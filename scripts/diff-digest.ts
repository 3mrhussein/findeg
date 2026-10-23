#!/usr/bin/env bun
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

export interface FileDiffSummary {
  file: string;
  package: string;
  insertions: number;
  deletions: number;
  status: 'added' | 'modified' | 'deleted';
  modifiedSymbols: string[];
}

export interface BlastRadiusImpact {
  changedFile: string;
  affectedCallers: string[];
  affectedPackages: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReason: string;
}

export interface DiffDigestReport {
  timestamp: string;
  baseRef: string;
  headRef: string;
  filesChanged: number;
  totalInsertions: number;
  totalDeletions: number;
  files: FileDiffSummary[];
  blastRadius: BlastRadiusImpact[];
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

function runGit(command: string, cwd: string = '.'): string {
  try {
    return execSync(command, { cwd, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }).trim();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return '';
  }
}

function resolveBaseRef(): string {
  const hasOriginDevelop = runGit('git rev-parse --verify origin/develop 2>/dev/null');
  if (hasOriginDevelop) return 'origin/develop';
  const hasDevelop = runGit('git rev-parse --verify develop 2>/dev/null');
  if (hasDevelop) return 'develop';
  const hasMain = runGit('git rev-parse --verify origin/main 2>/dev/null');
  if (hasMain) return 'origin/main';
  return 'HEAD~1';
}

function extractSymbolsFromDiff(diffText: string): string[] {
  const symbols = new Set<string>();
  const symbolRegex =
    /^[+-]\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|const|enum)\s+([a-zA-Z0-9_$]+)/;
  const lines = diffText.split('\n');

  for (const line of lines) {
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    const match = symbolRegex.exec(line);
    if (match && match[1]) {
      symbols.add(match[1]);
    }
  }
  return Array.from(symbols);
}

function findCallersForFile(targetRelPath: string, rootDir: string): string[] {
  const callers: string[] = [];
  const baseName = path.basename(targetRelPath, path.extname(targetRelPath));
  if (baseName === 'index') {
    // Parent folder name
    const parentDir = path.basename(path.dirname(targetRelPath));
    const grepCmd = `git grep -l "${parentDir}" -- "*.ts" "*.tsx" "*.js" "*.jsx" 2>/dev/null`;
    const hits = runGit(grepCmd, rootDir).split('\n').filter(Boolean);
    callers.push(...hits.filter((f) => f !== targetRelPath));
  } else {
    const grepCmd = `git grep -l "${baseName}" -- "*.ts" "*.tsx" "*.js" "*.jsx" 2>/dev/null`;
    const hits = runGit(grepCmd, rootDir).split('\n').filter(Boolean);
    callers.push(...hits.filter((f) => f !== targetRelPath));
  }
  return Array.from(new Set(callers)).slice(0, 10);
}

function determinePackage(filePath: string): string {
  const parts = filePath.split(path.sep);
  if (parts[0] === 'packages' && parts.length > 1) {
    return `packages/${parts[1]}`;
  }
  if (parts[0] === 'frontend' && parts.length > 1) {
    return `frontend/${parts[1]}`;
  }
  if (parts[0] === 'backend') return 'backend';
  if (parts[0] === 'db') return 'db';
  if (parts[0] === 'configs') return 'configs';
  return 'root';
}

export function runDiffDigest(
  baseRef?: string,
  headRef?: string,
  isStaged: boolean = false,
): DiffDigestReport {
  const rootDir = process.cwd();
  const effectiveBase = baseRef || (isStaged ? 'HEAD' : resolveBaseRef());
  const effectiveHead = headRef || (isStaged ? '--staged' : 'HEAD');

  const diffCommand = isStaged
    ? 'git diff --staged --numstat'
    : `git diff --numstat ${effectiveBase}...${headRef || 'HEAD'}`;

  const rawNumstat = runGit(diffCommand, rootDir);
  const numstatLines = rawNumstat.split('\n').filter(Boolean);

  const files: FileDiffSummary[] = [];
  let totalInsertions = 0;
  let totalDeletions = 0;

  for (const line of numstatLines) {
    const parts = line.split('\t');
    if (parts.length < 3) continue;

    const ins = parseInt(parts[0], 10) || 0;
    const del = parseInt(parts[1], 10) || 0;
    const filePath = parts[2];

    totalInsertions += ins;
    totalDeletions += del;

    // Get symbol diff for this file
    const fileDiffCmd = isStaged
      ? `git diff --staged -- "${filePath}"`
      : `git diff ${effectiveBase}...${headRef || 'HEAD'} -- "${filePath}"`;
    const fileDiffText = runGit(fileDiffCmd, rootDir);
    const symbols = extractSymbolsFromDiff(fileDiffText);

    let status: 'added' | 'modified' | 'deleted' = 'modified';
    if (del === 0 && ins > 0) status = 'added';
    else if (ins === 0 && del > 0) status = 'deleted';

    files.push({
      file: filePath,
      package: determinePackage(filePath),
      insertions: ins,
      deletions: del,
      status,
      modifiedSymbols: symbols,
    });
  }

  const blastRadius: BlastRadiusImpact[] = [];
  let highestRiskScore = 0;

  for (const f of files) {
    const callers = findCallersForFile(f.file, rootDir);
    const affectedPkgs = Array.from(new Set(callers.map(determinePackage)));

    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let reason = 'Localized file changes with minimal downstream impact';
    let score = 1;

    if (f.file.includes('db/schema') || f.file.includes('migrations/')) {
      risk = 'HIGH';
      reason = 'Database schema or migration change affects persistence layer';
      score = 3;
    } else if (f.file.includes('configs/env') || f.file.includes('.env')) {
      risk = 'HIGH';
      reason = 'Environment configuration change impacts system bootstrap';
      score = 3;
    } else if (affectedPkgs.length > 2 || callers.length >= 6) {
      risk = 'HIGH';
      reason = `Multiple packages (${affectedPkgs.length}) or numerous callers (${callers.length}) depend on this module`;
      score = 3;
    } else if (affectedPkgs.length > 1 || callers.length >= 2) {
      risk = 'MEDIUM';
      reason = 'Touches shared contracts imported across workspace boundaries';
      score = 2;
    }

    if (score > highestRiskScore) highestRiskScore = score;

    blastRadius.push({
      changedFile: f.file,
      affectedCallers: callers,
      affectedPackages: affectedPkgs,
      riskLevel: risk,
      riskReason: reason,
    });
  }

  const overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' =
    highestRiskScore >= 3 ? 'HIGH' : highestRiskScore === 2 ? 'MEDIUM' : 'LOW';

  return {
    timestamp: new Date().toISOString(),
    baseRef: effectiveBase,
    headRef: effectiveHead,
    filesChanged: files.length,
    totalInsertions,
    totalDeletions,
    files,
    blastRadius,
    overallRisk,
  };
}

function printCliReport(report: DiffDigestReport): void {
  console.log('==================================================================');
  console.log(' DIFF DIGEST: COMPACT GIT DIFF & CALLER BLAST-RADIUS ANALYZER');
  console.log('==================================================================');
  console.log(`Comparison:  ${report.baseRef} -> ${report.headRef}`);
  console.log(
    `Summary:     ${report.filesChanged} files changed (+${report.totalInsertions}, -${report.totalDeletions})`,
  );
  console.log(`Risk Index:  [${report.overallRisk}]`);
  console.log('');

  console.log('## CHANGED FILES');
  if (report.files.length === 0) {
    console.log('  No changes detected in range.');
  } else {
    for (const f of report.files) {
      const symStr =
        f.modifiedSymbols.length > 0 ? ` (symbols: ${f.modifiedSymbols.join(', ')})` : '';
      console.log(
        `* [${f.status.toUpperCase().padEnd(8)}] ${f.file} (+${f.insertions}, -${f.deletions}) [${f.package}]${symStr}`,
      );
    }
  }
  console.log('');

  console.log('## BLAST-RADIUS & DOWNSTREAM IMPACT');
  for (const b of report.blastRadius) {
    console.log(`* ${b.changedFile}`);
    console.log(`  Risk: ${b.riskLevel} (${b.riskReason})`);
    console.log(`  Packages Impacted: [${b.affectedPackages.join(', ') || 'none'}]`);
    if (b.affectedCallers.length > 0) {
      console.log(`  Direct Callers Sample:`);
      for (const caller of b.affectedCallers.slice(0, 5)) {
        console.log(`    - ${caller}`);
      }
      if (b.affectedCallers.length > 5) {
        console.log(`    ... and ${b.affectedCallers.length - 5} more callers`);
      }
    }
  }
  console.log('==================================================================');
}

const args = process.argv.slice(2);
const isJson = args.includes('--json');
const isStaged = args.includes('--staged');
const nonFlagArgs = args.filter((a) => !a.startsWith('--'));

const baseRef = nonFlagArgs[0];
const headRef = nonFlagArgs[1];

const report = runDiffDigest(baseRef, headRef, isStaged);

if (isJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printCliReport(report);
}
