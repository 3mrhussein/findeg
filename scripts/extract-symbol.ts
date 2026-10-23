#!/usr/bin/env bun
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface SymbolSnippet {
  filePath: string;
  symbol: string;
  startLine: number;
  endLine: number;
  code: string;
  contextBefore?: string;
  contextAfter?: string;
}

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.turbo',
  '.worktrees',
]);

const SUPPORTED_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function extractLineRange(filePath: string, start: number, end: number): SymbolSnippet | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const actualStart = Math.max(1, start);
    const actualEnd = Math.min(lines.length, end);
    const slice = lines.slice(actualStart - 1, actualEnd);

    const formatted = slice.map((l, idx) => `[L${actualStart + idx}] ${l}`).join('\n');

    return {
      filePath,
      symbol: `Lines ${actualStart}-${actualEnd}`,
      startLine: actualStart,
      endLine: actualEnd,
      code: formatted,
    };
  } catch {
    return null;
  }
}

function findSymbolInFile(
  filePath: string,
  symbolPattern: string,
  isExact: boolean,
  contextLines: number,
): SymbolSnippet[] {
  const snippets: SymbolSnippet[] = [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const pattern = isExact
      ? new RegExp(
          `\\b(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:function|class|interface|type|const|let|var|enum)\\s+${symbolPattern}\\b`,
        )
      : new RegExp(symbolPattern);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (pattern.test(line)) {
        const startLine = i + 1;
        let endLine = startLine;

        // Try to balance braces if there is an opening brace
        let openBraces = 0;
        let hasBrace = false;

        for (let j = i; j < lines.length; j++) {
          const curLine = lines[j];
          for (const ch of curLine) {
            if (ch === '{') {
              openBraces++;
              hasBrace = true;
            } else if (ch === '}') {
              openBraces--;
            }
          }
          if (hasBrace && openBraces <= 0) {
            endLine = j + 1;
            break;
          }
          if (!hasBrace && curLine.trim().endsWith(';')) {
            endLine = j + 1;
            break;
          }
          // Cap at max 120 lines to avoid runaway
          if (j - i > 120) {
            endLine = j + 1;
            break;
          }
        }

        const ctxStart = Math.max(1, startLine - contextLines);
        const ctxEnd = Math.min(lines.length, endLine + contextLines);

        const codeSlice = lines
          .slice(ctxStart - 1, ctxEnd)
          .map((l, idx) => `[L${ctxStart + idx}] ${l}`)
          .join('\n');

        snippets.push({
          filePath,
          symbol: symbolPattern,
          startLine,
          endLine,
          code: codeSlice,
        });

        // Fast forward i to avoid duplicate hits on same block
        i = endLine - 1;
      }
    }
  } catch {
    // Ignore read errors
  }
  return snippets;
}

function walkForCodeFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkForCodeFiles(full, fileList);
    } else if (entry.isFile() && SUPPORTED_EXTS.has(path.extname(entry.name))) {
      fileList.push(full);
    }
  }
  return fileList;
}

export function extractSymbol(
  targetPath: string,
  symbolOrPattern: string,
  options: {
    exact?: boolean;
    context?: number;
    lines?: string;
  } = {},
): SymbolSnippet[] {
  const absPath = path.resolve(targetPath);
  const context = options.context ?? 3;

  if (options.lines && fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
    const [startStr, endStr] = options.lines.split(':');
    const start = parseInt(startStr, 10) || 1;
    const end = parseInt(endStr, 10) || start + 20;
    const res = extractLineRange(absPath, start, end);
    return res ? [res] : [];
  }

  const results: SymbolSnippet[] = [];

  if (fs.existsSync(absPath)) {
    const stat = fs.statSync(absPath);
    if (stat.isFile()) {
      results.push(...findSymbolInFile(absPath, symbolOrPattern, !!options.exact, context));
    } else if (stat.isDirectory()) {
      const files = walkForCodeFiles(absPath);
      for (const f of files) {
        const found = findSymbolInFile(f, symbolOrPattern, !!options.exact, context);
        if (found.length > 0) results.push(...found);
      }
    }
  }

  return results;
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log('Usage: bun scripts/extract-symbol.ts <file-or-dir> <symbol-or-pattern> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --lines <start:end>   Extract specific line range from single file');
  console.log('  --context <N>         Number of context lines before/after (default: 3)');
  console.log('  --exact               Match exact symbol name in declaration');
  console.log('  --json                Emit output as JSON');
  process.exit(0);
}

const targetPath = args[0];
let symbolPattern = args[1] || '';
const isJson = args.includes('--json');
const isExact = args.includes('--exact');

let linesArg: string | undefined;
const linesIndex = args.indexOf('--lines');
if (linesIndex !== -1 && args[linesIndex + 1]) {
  linesArg = args[linesIndex + 1];
}

let contextNum = 3;
const ctxIndex = args.indexOf('--context');
if (ctxIndex !== -1 && args[ctxIndex + 1]) {
  contextNum = parseInt(args[ctxIndex + 1], 10) || 3;
}

const results = extractSymbol(targetPath, symbolPattern, {
  exact: isExact,
  context: contextNum,
  lines: linesArg,
});

if (isJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log('==================================================================');
  console.log(` SURGICAL SYMBOL EXTRACTOR: ${symbolPattern || linesArg || 'all'}`);
  console.log(` Matches Found: ${results.length}`);
  console.log('==================================================================');
  console.log('');

  for (const item of results) {
    console.log(`[FILE] ${item.filePath}#L${item.startLine}-L${item.endLine}`);
    console.log('-'.repeat(60));
    console.log(item.code);
    console.log('-'.repeat(60));
    console.log('');
  }
}
