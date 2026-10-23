#!/usr/bin/env bun
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface PackageMeta {
  name: string;
  version: string;
  relPath: string;
  absPath: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  internalDeps: string[];
  externalDeps: string[];
}

export interface EventEvidence {
  channel: string;
  type: 'emit' | 'listen';
  file: string;
  line: number;
  snippet: string;
}

export interface EnvEvidence {
  key: string;
  source: 'code' | 'env_file' | 'schema';
  file: string;
  line?: number;
}

export interface SystemXrayReport {
  timestamp: string;
  targetRoot: string;
  packages: PackageMeta[];
  internalGraph: Record<string, string[]>;
  events: EventEvidence[];
  envVariables: EnvEvidence[];
  metrics: {
    totalPackages: number;
    internalEdges: number;
    uniqueEvents: number;
    uniqueEnvVars: number;
    scannedFiles: number;
  };
}

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.turbo',
  '.worktrees',
  'coverage',
]);

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walkDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath, fileList);
    } else if (entry.isFile()) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function findPackageJsonFiles(rootDir: string): string[] {
  const allFiles = walkDirectory(rootDir);
  return allFiles.filter(
    (f) =>
      path.basename(f) === 'package.json' &&
      !f.includes('/node_modules/') &&
      !f.includes('/.next/'),
  );
}

function parsePackageJson(filePath: string, rootDir: string): PackageMeta | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(raw);
    const dir = path.dirname(filePath);
    return {
      name: json.name || path.basename(dir),
      version: json.version || '0.0.0',
      relPath: path.relative(rootDir, dir) || '.',
      absPath: dir,
      dependencies: json.dependencies || {},
      devDependencies: json.devDependencies || {},
      internalDeps: [],
      externalDeps: [],
    };
  } catch {
    return null;
  }
}

function scanEventsInFile(filePath: string, rootDir: string): EventEvidence[] {
  const evidence: EventEvidence[] = [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relFile = path.relative(rootDir, filePath);

    const emitRegex =
      /(?:\.emit|\.publish|\.dispatch|\.send|eventBus\.emit)\(\s*['"`]([a-zA-Z0-9_.:-]+)['"`]/g;
    const listenRegex =
      /(?:\.on|\.once|\.addListener|\.subscribe|\.addEventListener)\(\s*['"`]([a-zA-Z0-9_.:-]+)['"`]/g;

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      let match: RegExpExecArray | null;

      while ((match = emitRegex.exec(lineText)) !== null) {
        evidence.push({
          channel: match[1],
          type: 'emit',
          file: relFile,
          line: i + 1,
          snippet: lineText.trim().slice(0, 100),
        });
      }

      while ((match = listenRegex.exec(lineText)) !== null) {
        evidence.push({
          channel: match[1],
          type: 'listen',
          file: relFile,
          line: i + 1,
          snippet: lineText.trim().slice(0, 100),
        });
      }
    }
  } catch {
    // Ignore read errors
  }
  return evidence;
}

function scanEnvInFile(filePath: string, rootDir: string): EnvEvidence[] {
  const evidence: EnvEvidence[] = [];
  try {
    const relFile = path.relative(rootDir, filePath);
    const baseName = path.basename(filePath);

    if (baseName.startsWith('.env')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;
        const match = /^([A-Z0-9_]+)=/.exec(line);
        if (match) {
          evidence.push({
            key: match[1],
            source: 'env_file',
            file: relFile,
            line: i + 1,
          });
        }
      }
      return evidence;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const isSchema =
      filePath.includes('/env') || filePath.includes('env.ts') || filePath.includes('schema');

    const envRegex = /(?:process\.env|import\.meta\.env)\.([A-Z0-9_]+)/g;

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      let match: RegExpExecArray | null;

      while ((match = envRegex.exec(lineText)) !== null) {
        evidence.push({
          key: match[1],
          source: isSchema ? 'schema' : 'code',
          file: relFile,
          line: i + 1,
        });
      }
    }
  } catch {
    // Ignore read errors
  }
  return evidence;
}

export function runSystemXray(targetDir: string = '.'): SystemXrayReport {
  const absRoot = path.resolve(targetDir);
  const pkgFiles = findPackageJsonFiles(absRoot);

  const packages: PackageMeta[] = [];
  const knownPackageNames = new Set<string>();

  for (const pkgFile of pkgFiles) {
    const meta = parsePackageJson(pkgFile, absRoot);
    if (meta) {
      packages.push(meta);
      knownPackageNames.add(meta.name);
    }
  }

  const internalGraph: Record<string, string[]> = {};
  let internalEdges = 0;

  for (const pkg of packages) {
    const allDepKeys = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)];
    for (const dep of allDepKeys) {
      if (knownPackageNames.has(dep) && dep !== pkg.name) {
        pkg.internalDeps.push(dep);
      } else {
        pkg.externalDeps.push(dep);
      }
    }
    internalGraph[pkg.name] = pkg.internalDeps;
    internalEdges += pkg.internalDeps.length;
  }

  const allFiles = walkDirectory(absRoot);
  const codeFiles = allFiles.filter(
    (f) => CODE_EXTENSIONS.has(path.extname(f)) || path.basename(f).startsWith('.env'),
  );

  const allEvents: EventEvidence[] = [];
  const allEnv: EnvEvidence[] = [];

  for (const file of codeFiles) {
    if (CODE_EXTENSIONS.has(path.extname(file))) {
      const events = scanEventsInFile(file, absRoot);
      if (events.length > 0) allEvents.push(...events);
    }
    const envList = scanEnvInFile(file, absRoot);
    if (envList.length > 0) allEnv.push(...envList);
  }

  const uniqueEvents = new Set(allEvents.map((e) => e.channel)).size;
  const uniqueEnvVars = new Set(allEnv.map((e) => e.key)).size;

  return {
    timestamp: new Date().toISOString(),
    targetRoot: absRoot,
    packages,
    internalGraph,
    events: allEvents,
    envVariables: allEnv,
    metrics: {
      totalPackages: packages.length,
      internalEdges,
      uniqueEvents,
      uniqueEnvVars,
      scannedFiles: codeFiles.length,
    },
  };
}

function printCliReport(report: SystemXrayReport): void {
  console.log('==================================================================');
  console.log(' SYSTEM X-RAY: BOUNDARY, DEPENDENCY & ENVIRONMENT SCANNER');
  console.log('==================================================================');
  console.log(`Target Root: ${report.targetRoot}`);
  console.log(`Timestamp:   ${report.timestamp}`);
  console.log('');

  console.log('## METRICS SUMMARY');
  console.log(`- Total Packages Discovered: ${report.metrics.totalPackages}`);
  console.log(`- Internal Workspace Edges:  ${report.metrics.internalEdges}`);
  console.log(`- Unique Event Channels:     ${report.metrics.uniqueEvents}`);
  console.log(`- Unique Environment Keys:   ${report.metrics.uniqueEnvVars}`);
  console.log(`- Total Code Files Scanned:  ${report.metrics.scannedFiles}`);
  console.log('');

  console.log('## PACKAGES & BOUNDARIES');
  for (const pkg of report.packages) {
    const internalList = pkg.internalDeps.length > 0 ? pkg.internalDeps.join(', ') : 'none';
    console.log(`* ${pkg.name} (${pkg.relPath})`);
    console.log(`  Version: ${pkg.version}`);
    console.log(`  Internal Dependencies: [${internalList}]`);
    console.log(`  External Dependencies Count: ${pkg.externalDeps.length}`);
  }
  console.log('');

  console.log('## EVENT SURFACE (SAMPLE)');
  if (report.events.length === 0) {
    console.log('  No explicit event emitter/listener calls detected.');
  } else {
    const sample = report.events.slice(0, 10);
    for (const ev of sample) {
      console.log(`  [${ev.type.toUpperCase()}] ${ev.channel} at ${ev.file}:${ev.line}`);
    }
    if (report.events.length > 10) {
      console.log(`  ... and ${report.events.length - 10} more events.`);
    }
  }
  console.log('');

  console.log('## ENVIRONMENT VARIABLES (SAMPLE)');
  if (report.envVariables.length === 0) {
    console.log('  No environment variable accesses detected.');
  } else {
    const uniqueMap = new Map<string, EnvEvidence>();
    for (const env of report.envVariables) {
      if (!uniqueMap.has(env.key)) {
        uniqueMap.set(env.key, env);
      }
    }
    const sampleEnv = Array.from(uniqueMap.values()).slice(0, 15);
    for (const env of sampleEnv) {
      const lineStr = env.line ? `:${env.line}` : '';
      console.log(`  ${env.key.padEnd(28)} [${env.source.toUpperCase()}] in ${env.file}${lineStr}`);
    }
    if (uniqueMap.size > 15) {
      console.log(`  ... and ${uniqueMap.size - 15} more unique environment variables.`);
    }
  }
  console.log('==================================================================');
}

// Execution entry point
const args = process.argv.slice(2);
const targetPath = args.find((a) => !a.startsWith('--')) || '.';
const isJson = args.includes('--json');

const report = runSystemXray(targetPath);

if (isJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printCliReport(report);
}
