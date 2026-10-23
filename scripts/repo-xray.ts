#!/usr/bin/env bun
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

export interface LanguageStat {
  extension: string;
  files: number;
  lines: number;
}

export interface PackageSummary {
  name: string;
  version: string;
  relPath: string;
  scripts: string[];
  main?: string;
  types?: string;
}

export interface RepoXrayReport {
  timestamp: string;
  rootDir: string;
  git: {
    branch: string;
    commit: string;
    isClean: boolean;
  };
  monorepo: {
    isMonorepo: boolean;
    packageManager: string;
    packages: PackageSummary[];
  };
  languages: LanguageStat[];
  totals: {
    files: number;
    lines: number;
    configs: number;
    tests: number;
  };
}

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.turbo',
  '.worktrees',
  'coverage',
]);

const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript (React)',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript (React)',
  '.mjs': 'JavaScript Module',
  '.cjs': 'CommonJS',
  '.json': 'JSON',
  '.md': 'Markdown',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.html': 'HTML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.sql': 'SQL',
  '.sh': 'Shell',
};

function getGitInfo(cwd: string): { branch: string; commit: string; isClean: boolean } {
  try {
    const branch = execSync('git branch --show-current', { cwd, encoding: 'utf-8' }).trim();
    const commit = execSync('git rev-parse --short HEAD', { cwd, encoding: 'utf-8' }).trim();
    const status = execSync('git status --porcelain', { cwd, encoding: 'utf-8' }).trim();
    return {
      branch: branch || 'HEAD (detached)',
      commit: commit || 'unknown',
      isClean: status.length === 0,
    };
  } catch {
    return { branch: 'unknown', commit: 'unknown', isClean: false };
  }
}

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

export function runRepoXray(targetDir: string = '.'): RepoXrayReport {
  const absRoot = path.resolve(targetDir);
  const git = getGitInfo(absRoot);

  const langMap = new Map<string, { files: number; lines: number }>();
  let totalFiles = 0;
  let totalLines = 0;
  let totalConfigs = 0;
  let totalTests = 0;

  const packageJsonFiles: string[] = [];

  function scanDir(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        totalFiles++;
        const ext = path.extname(entry.name).toLowerCase();
        const lines = countLines(fullPath);
        totalLines += lines;

        const langName = EXT_TO_LANG[ext] || (ext ? ext : 'Other');
        const current = langMap.get(langName) || { files: 0, lines: 0 };
        current.files += 1;
        current.lines += lines;
        langMap.set(langName, current);

        if (entry.name === 'package.json') {
          packageJsonFiles.push(fullPath);
        }

        if (
          entry.name.includes('config') ||
          entry.name.startsWith('.') ||
          entry.name.endsWith('.yaml') ||
          entry.name.endsWith('.yml')
        ) {
          totalConfigs++;
        }

        if (
          entry.name.includes('.test.') ||
          entry.name.includes('.spec.') ||
          entry.name.includes('.cy.')
        ) {
          totalTests++;
        }
      }
    }
  }

  scanDir(absRoot);

  const packages: PackageSummary[] = [];
  for (const pkgPath of packageJsonFiles) {
    try {
      const raw = fs.readFileSync(pkgPath, 'utf-8');
      const json = JSON.parse(raw);
      packages.push({
        name: json.name || path.basename(path.dirname(pkgPath)),
        version: json.version || '0.0.0',
        relPath: path.relative(absRoot, path.dirname(pkgPath)) || '.',
        scripts: json.scripts ? Object.keys(json.scripts) : [],
        main: json.main,
        types: json.types,
      });
    } catch {
      // Ignore invalid JSON
    }
  }

  // Detect package manager
  let packageManager = 'npm';
  if (fs.existsSync(path.join(absRoot, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (
    fs.existsSync(path.join(absRoot, 'bun.lockb')) ||
    fs.existsSync(path.join(absRoot, 'bun.lock'))
  ) {
    packageManager = 'bun';
  } else if (fs.existsSync(path.join(absRoot, 'yarn.lock'))) {
    packageManager = 'yarn';
  }

  const isMonorepo =
    fs.existsSync(path.join(absRoot, 'pnpm-workspace.yaml')) || packages.length > 1;

  const languages: LanguageStat[] = Array.from(langMap.entries())
    .map(([extension, stat]) => ({
      extension,
      files: stat.files,
      lines: stat.lines,
    }))
    .sort((a, b) => b.lines - a.lines);

  return {
    timestamp: new Date().toISOString(),
    rootDir: absRoot,
    git,
    monorepo: {
      isMonorepo,
      packageManager,
      packages,
    },
    languages,
    totals: {
      files: totalFiles,
      lines: totalLines,
      configs: totalConfigs,
      tests: totalTests,
    },
  };
}

function printCliReport(report: RepoXrayReport): void {
  console.log('==================================================================');
  console.log(' REPO X-RAY: FAST REPOSITORY INVENTORY');
  console.log('==================================================================');
  console.log(`Directory:   ${report.rootDir}`);
  console.log(
    `Branch:      ${report.git.branch} @ ${report.git.commit} (${report.git.isClean ? 'clean' : 'modified'})`,
  );
  console.log(
    `Monorepo:    ${report.monorepo.isMonorepo ? 'yes' : 'no'} (${report.monorepo.packageManager})`,
  );
  console.log(`Timestamp:   ${report.timestamp}`);
  console.log('');

  console.log('## FILE & CODE TOTALS');
  console.log(`- Total Files:        ${report.totals.files}`);
  console.log(`- Total Lines:        ${report.totals.lines.toLocaleString()}`);
  console.log(`- Config Files:       ${report.totals.configs}`);
  console.log(`- Test Files:         ${report.totals.tests}`);
  console.log('');

  console.log('## LANGUAGE BREAKDOWN');
  console.log('Language'.padEnd(25) + 'Files'.padStart(10) + 'Lines of Code'.padStart(18));
  console.log('-'.repeat(53));
  for (const lang of report.languages.slice(0, 10)) {
    console.log(
      lang.extension.padEnd(25) +
        lang.files.toString().padStart(10) +
        lang.lines.toLocaleString().padStart(18),
    );
  }
  console.log('');

  console.log(`## PACKAGES INVENTORY (${report.monorepo.packages.length} packages)`);
  for (const pkg of report.monorepo.packages) {
    const scriptsList = pkg.scripts.length > 0 ? pkg.scripts.join(', ') : 'none';
    console.log(`* ${pkg.name.padEnd(30)} [${pkg.relPath}] (v${pkg.version})`);
    console.log(`  Scripts: ${scriptsList}`);
  }
  console.log('==================================================================');
}

const args = process.argv.slice(2);
const targetPath = args.find((a) => !a.startsWith('--')) || '.';
const isJson = args.includes('--json');

const report = runRepoXray(targetPath);

if (isJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printCliReport(report);
}
