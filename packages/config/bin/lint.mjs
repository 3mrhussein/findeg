#!/usr/bin/env node
// `findeg-lint`: runs ESLint exactly as `eslint` would, then enforces the lint ratchet.
//
// Rules listed in eslint/standard.js report as warnings while known violations remain. The
// per-package, per-rule warning counts allowed today live in ratchet.json. A run fails when
//   - any error is reported,
//   - a rule reports MORE warnings than its baseline (new violations), or
//   - a rule reports FEWER (the baseline must shrink so the gain cannot be lost again).
// `--update-ratchet` rewrites this package's baseline; it is for humans (CODEOWNERS), never
// for a feature change.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = process.cwd();
const ratchetFile =
  process.env.FINDEG_RATCHET_FILE ?? fileURLToPath(new URL('../ratchet.json', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
const require = createRequire(path.join(cwd, 'package.json'));

const argv = process.argv.slice(2);
const update = argv.includes('--update-ratchet');
const eslintArgs = argv.filter((arg) => arg !== '--update-ratchet');
const targets = eslintArgs.filter((arg) => !arg.startsWith('-'));
// A baseline only describes a whole-package run; partial runs skip the comparison.
const wholePackage = targets.length === 0 || (targets.length === 1 && targets[0] === '.');
if (targets.length === 0) eslintArgs.unshift('.');

const output = path.join(os.tmpdir(), `findeg-lint-${process.pid}.json`);
const run = spawnSync(
  process.execPath,
  [
    path.join(path.dirname(require.resolve('eslint/package.json')), 'bin/eslint.js'),
    ...eslintArgs,
    '--format',
    'json',
    '--output-file',
    output,
  ],
  { cwd, stdio: ['inherit', 'inherit', 'inherit'] },
);
if (!fs.existsSync(output)) process.exit(run.status ?? 2);
const results = JSON.parse(fs.readFileSync(output, 'utf8'));
fs.rmSync(output, { force: true });

const { ESLint } = require('eslint');
const text = (await new ESLint({ cwd }).loadFormatter('stylish')).format(results);
if (text) console.log(text);

const errors = results.reduce((sum, file) => sum + file.errorCount, 0);
const warnings = {};
for (const file of results) {
  for (const message of file.messages) {
    if (message.severity === 1) {
      const rule = message.ruleId ?? 'parse';
      warnings[rule] = (warnings[rule] ?? 0) + 1;
    }
  }
}

const ratchet = JSON.parse(fs.readFileSync(ratchetFile, 'utf8'));
const baseline = ratchet[manifest.name] ?? {};

if (update && wholePackage) {
  if (Object.keys(warnings).length) ratchet[manifest.name] = warnings;
  else delete ratchet[manifest.name];
  const sorted = Object.fromEntries(Object.entries(ratchet).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(ratchetFile, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Lint ratchet updated for ${manifest.name}.`);
  process.exit(errors ? 1 : 0);
}

const problems = [];
if (wholePackage) {
  for (const rule of new Set([...Object.keys(warnings), ...Object.keys(baseline)])) {
    const actual = warnings[rule] ?? 0;
    const allowed = baseline[rule] ?? 0;
    if (actual > allowed) {
      problems.push(`${rule}: ${actual} warnings, baseline ${allowed}. Fix the new violations.`);
    } else if (actual < allowed) {
      problems.push(
        `${rule}: ${actual} warnings, baseline ${allowed}. Lower the baseline (findeg-lint --update-ratchet).`,
      );
    }
  }
}
if (problems.length) {
  console.error(`\nLint ratchet failed for ${manifest.name}:\n  ${problems.join('\n  ')}`);
}
process.exit(errors || problems.length ? 1 : 0);
