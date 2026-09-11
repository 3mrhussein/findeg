import { checkModuleBoundaries } from './module-boundaries.mjs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const canonicalDocuments = [
  'CONTEXT.md',
  'docs/architecture/README.md',
  'docs/adr/0001-target-architecture.md',
  'docs/contracts/openapi/v1.yaml',
  'docs/operations/README.md',
  'docs/package-guidance.md',
];

const sourceRoots = [
  'backend/src/features',
  'backend/src/modules',
  'backend/src/application',
  'db/src',
  'frontend',
  'runtime/src',
];
const inspectableFile = /\.(?:[cm]?[jt]sx?|md)$/;
const ignoredDirectories = new Set(['.git', '.next', 'dist', 'node_modules']);

async function filesUnder(root, directory, { required = false } = {}) {
  const entries = await readdir(resolve(root, directory), { withFileTypes: true }).catch(
    (error) => {
      if (required) throw error;
      return [];
    },
  );
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = `${directory}/${entry.name}`;
      if (entry.isDirectory())
        return ignoredDirectories.has(entry.name) ? [] : filesUnder(root, relativePath);
      return entry.isFile() && inspectableFile.test(entry.name) ? [relativePath] : [];
    }),
  );
  return files.flat();
}

function isUnresolvedMergeMarker(contents) {
  return /^(?:<<<<<<< .+|=======|>>>>>>> .+)$/mu.test(contents);
}

function prohibitedDependencies(relativePath, contents) {
  const imports = [
    ...contents.matchAll(
      /(?:\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?|\b(?:import|require)\s*\()\s*["']([^"']+)["']/g,
    ),
  ].map((match) => match[1]);
  return imports.flatMap((imported) => {
    if (relativePath.startsWith('frontend/') && imported.startsWith('@findeg/db')) {
      return [`Prohibited dependency: ${relativePath} imports ${imported}`];
    }
    if (
      relativePath.startsWith('frontend/') &&
      /@findeg\/backend(?:\/.*)?\/infrastructure(?:\/|$)/.test(imported)
    ) {
      return [`Prohibited dependency: ${relativePath} imports ${imported}`];
    }
    if (
      relativePath.startsWith('backend/src/features/') &&
      (imported === 'next' || imported.startsWith('next/'))
    ) {
      return [`Prohibited dependency: ${relativePath} imports ${imported}`];
    }
    if (relativePath.startsWith('db/src/') && imported.startsWith('@findeg/backend')) {
      return [`Prohibited dependency: ${relativePath} imports ${imported}`];
    }
    return [];
  });
}

export async function runArchitectureCheck(root = process.cwd()) {
  const missingDocuments = [];
  for (const document of canonicalDocuments) {
    const exists = await readFile(resolve(root, document))
      .then(() => true)
      .catch(() => false);
    if (!exists) missingDocuments.push(`Missing canonical documentation: ${document}`);
  }

  const historicalDocuments = [
    'README.md',
    ...(await filesUnder(root, 'docs')).filter((relativePath) => relativePath.endsWith('.md')),
  ].filter((relativePath) => !canonicalDocuments.includes(relativePath));
  const historicalClaims = (
    await Promise.all(
      historicalDocuments.map(async (relativePath) => {
        const contents = await readFile(resolve(root, relativePath), 'utf8');
        return /\b(?:single|canonical) source(?: of truth)?\b/iu.test(contents)
          ? [`Historical document claims canonical authority: ${relativePath}`]
          : [];
      }),
    )
  )
    .flat()
    .sort();

  const unresolvedMergeMarkers = (
    await Promise.all(
      ['README.md', ...(await filesUnder(root, 'docs')).filter((path) => path.endsWith('.md'))].map(
        async (relativePath) => {
          const contents = await readFile(resolve(root, relativePath), 'utf8');
          return isUnresolvedMergeMarker(contents)
            ? [`Documentation drift: unresolved Git merge marker: ${relativePath}`]
            : [];
        },
      ),
    )
  )
    .flat()
    .sort();

  const unreadableSourceRoots = [];
  const sourceFiles = [];
  for (const directory of sourceRoots) {
    try {
      sourceFiles.push(...(await filesUnder(root, directory, { required: true })));
    } catch {
      unreadableSourceRoots.push(`Required source root is missing or unreadable: ${directory}`);
    }
  }
  const violations = (
    await Promise.all(
      sourceFiles.map(async (relativePath) =>
        prohibitedDependencies(relativePath, await readFile(resolve(root, relativePath), 'utf8')),
      ),
    )
  ).flat();

  const moduleViolations = checkModuleBoundaries(
    root,
    await Promise.all(
      sourceFiles.map(async (path) => [path, await readFile(resolve(root, path), 'utf8')]),
    ),
  );

  return [
    ...historicalClaims,
    ...unresolvedMergeMarkers,
    ...missingDocuments,
    ...unreadableSourceRoots,
    ...violations.sort(),
    ...moduleViolations,
  ];
}

async function main() {
  const rootFlag = process.argv.indexOf('--root');
  const root = rootFlag === -1 ? process.cwd() : process.argv[rootFlag + 1];
  if (!root) {
    console.error('--root requires a directory path');
    process.exitCode = 1;
    return;
  }

  const violations = await runArchitectureCheck(root);
  if (violations.length === 0) return;
  console.error(violations.join('\n'));
  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
