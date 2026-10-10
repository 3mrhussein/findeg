import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Negative fixtures for the lint standard (packages/config): every rule must FAIL on a
// violating file, so a verifier cannot go green by being silently switched off.

const root = new URL('../../', import.meta.url);
const rootPath = fileURLToPath(root);
const backendRequire = createRequire(new URL('backend/package.json', root));
const { ESLint } = backendRequire('eslint');

async function lint(project, relativeFile, code) {
  const eslint = new ESLint({
    cwd: rootPath,
    overrideConfigFile: path.join(rootPath, project, 'eslint.config.js'),
  });
  const [result] = await eslint.lintText(code, { filePath: path.join(rootPath, relativeFile) });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
  return result.messages.map((message) => `${message.ruleId}:${message.severity}`);
}

const only = (messages, ruleId) => messages.filter((message) => message.startsWith(`${ruleId}:`));

test('L4: suppression comments are reported, typed expectations are not', async () => {
  for (const code of [
    '// @ts-ignore\nexport const a = 1;',
    '/* eslint-disable no-undef */\nexport const a = 1;',
    '// eslint-disable-next-line no-undef\nexport const a = 1;',
    '// @ts-nocheck\nexport const a = 1;',
  ]) {
    const messages = await lint('backend', 'backend/src/fixture.ts', code);
    assert.equal(only(messages, 'local/no-suppression-comments').length, 1, code);
  }
  const allowed = await lint(
    'backend',
    'backend/src/fixture.ts',
    '// @ts-expect-error intentional\nexport const a: number = "x";',
  );
  assert.deepEqual(only(allowed, 'local/no-suppression-comments'), []);
});

test('L2: a workspace import the manifest does not declare is reported', async () => {
  const undeclared = [
    ['backend', 'backend/src/fixture.ts', "import '@findeg/dashboard';"],
    ['frontend/ui', 'frontend/ui/src/fixture.ts', "import '@findeg/backend/features/core';"],
    ['packages/money', 'packages/money/src/fixture.ts', "import '@findeg/db';"],
    ['db', 'db/src/fixture.ts', "const x = import('@findeg/orders');"],
  ];
  for (const [project, file, code] of undeclared) {
    const messages = await lint(project, file, code);
    assert.equal(only(messages, 'local/declared-workspace-dependencies').length, 1, code);
  }
  for (const [project, file, code] of [
    ['backend', 'backend/src/fixture.ts', "import '@findeg/db'; import '@findeg/backend/index';"],
    ['packages/orders', 'packages/orders/src/fixture.ts', "import '@findeg/money';"],
  ]) {
    const messages = await lint(project, file, code);
    assert.deepEqual(only(messages, 'local/declared-workspace-dependencies'), [], code);
  }
});

test('L1: modules the runtime cannot provide are reported outside tests only', async () => {
  const isomorphic = await lint(
    'packages/money',
    'packages/money/src/fixture.ts',
    "import 'node:fs'; import 'react'; import 'next/headers';",
  );
  assert.equal(only(isomorphic, 'local/runtime-imports').length, 3);
  const node = await lint('backend', 'backend/src/fixture.ts', "import 'next/server';");
  assert.equal(only(node, 'local/runtime-imports').length, 1);
  const inTest = await lint(
    'packages/money',
    'packages/money/src/fixture.test.ts',
    "import 'node:fs';",
  );
  assert.deepEqual(only(inTest, 'local/runtime-imports'), []);
});

test('ratchet: new warnings and stale baselines both fail, an exact baseline passes', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-ratchet-'));
  fs.symlinkSync(
    path.join(rootPath, 'packages/config/node_modules'),
    path.join(directory, 'node_modules'),
  );
  fs.writeFileSync(path.join(directory, 'package.json'), '{"name":"@fixture/ratchet"}');
  fs.writeFileSync(
    path.join(directory, 'eslint.config.js'),
    "export default [{ rules: { 'no-debugger': 'warn' } }];\n",
  );
  fs.writeFileSync(path.join(directory, 'index.js'), 'debugger;\ndebugger;\n');
  const ratchet = path.join(directory, 'ratchet.json');
  const run = (baseline, ...args) => {
    fs.writeFileSync(ratchet, JSON.stringify(baseline));
    return spawnSync(
      process.execPath,
      [path.join(rootPath, 'packages/config/bin/lint.mjs'), '.', ...args],
      { cwd: directory, encoding: 'utf8', env: { ...process.env, FINDEG_RATCHET_FILE: ratchet } },
    );
  };

  const regression = run({});
  assert.equal(regression.status, 1);
  assert.match(regression.stderr, /no-debugger: 2 warnings, baseline 0/);

  const stale = run({ '@fixture/ratchet': { 'no-debugger': 3 } });
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /Lower the baseline/);

  assert.equal(run({ '@fixture/ratchet': { 'no-debugger': 2 } }).status, 0);

  const update = run({}, '--update-ratchet');
  assert.equal(update.status, 0);
  assert.deepEqual(JSON.parse(fs.readFileSync(ratchet, 'utf8')), {
    '@fixture/ratchet': { 'no-debugger': 2 },
  });
  fs.rmSync(directory, { recursive: true, force: true });
});
