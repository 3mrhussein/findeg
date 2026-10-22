import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { noSuppressionCommentsRule } from './rules/no-suppression-comments.js';
import { declaredWorkspaceDependenciesRule } from './rules/declared-workspace-dependencies.js';
import { runtimeLayer } from './layers/runtime.js';

const root = new URL('../../', import.meta.url);
const rootPath = fileURLToPath(root);
const configsRequire = createRequire(new URL('../../configs/package.json', import.meta.url));
const { ESLint } = configsRequire('eslint');
const tseslint = configsRequire('typescript-eslint');

async function lintWithConfig(overrideConfig, relativeFile, code) {
  const isTs = relativeFile.endsWith('.ts') || relativeFile.endsWith('.tsx');
  const baseConfig = isTs
    ? [{ files: ['**/*.ts', '**/*.tsx'], languageOptions: { parser: tseslint.parser } }]
    : [];
  const eslint = new ESLint({
    cwd: rootPath,
    overrideConfigFile: true,
    overrideConfig: [...baseConfig, ...overrideConfig],
  });
  const [result] = await eslint.lintText(code, { filePath: path.join(rootPath, relativeFile) });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
  return result.messages.map((message) => `${message.ruleId}:${message.severity}`);
}

const only = (messages, ruleId) => messages.filter((message) => message.startsWith(`${ruleId}:`));

test('L4: suppression comments are reported, typed expectations are not', async () => {
  const config = [
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: { local: { rules: { 'no-suppression-comments': noSuppressionCommentsRule } } },
      rules: { 'local/no-suppression-comments': 'error' },
    },
  ];
  for (const code of [
    '// @ts-ignore\nexport const a = 1;',
    '/* eslint-disable no-undef */\nexport const a = 1;',
    '// eslint-disable-next-line no-undef\nexport const a = 1;',
    '// @ts-nocheck\nexport const a = 1;',
  ]) {
    const messages = await lintWithConfig(config, 'backend/src/fixture.ts', code);
    assert.equal(only(messages, 'local/no-suppression-comments').length, 1, code);
  }
  const allowed = await lintWithConfig(
    config,
    'backend/src/fixture.ts',
    '// @ts-expect-error intentional\nexport const a: number = "x";',
  );
  assert.deepEqual(only(allowed, 'local/no-suppression-comments'), []);
});

test('L2: a workspace import the manifest does not declare is reported', async () => {
  const config = [
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: {
        local: { rules: { 'declared-workspace-dependencies': declaredWorkspaceDependenciesRule } },
      },
      rules: { 'local/declared-workspace-dependencies': 'error' },
    },
  ];
  const undeclared = [
    ['backend', 'backend/src/fixture.ts', "import '@findeg/dashboard';"],
    ['frontend/ui', 'frontend/ui/src/fixture.ts', "import '@findeg/backend/features/core';"],
    ['packages/domain', 'packages/domain/src/fixture.ts', "import '@findeg/db';"],
    ['db', 'db/src/fixture.ts', "const x = import('@findeg/orders');"],
  ];
  for (const [, file, code] of undeclared) {
    const messages = await lintWithConfig(config, file, code);
    assert.equal(only(messages, 'local/declared-workspace-dependencies').length, 1, code);
  }
  for (const [, file, code] of [
    ['backend', 'backend/src/fixture.ts', "import '@findeg/db'; import '@findeg/backend/index';"],
    ['packages/orders', 'packages/orders/src/fixture.ts', "import '@findeg/domain';"],
  ]) {
    const messages = await lintWithConfig(config, file, code);
    assert.deepEqual(only(messages, 'local/declared-workspace-dependencies'), [], code);
  }
});

test('L1: modules the runtime cannot provide are reported outside tests only', async () => {
  const isomorphicConfig = runtimeLayer('isomorphic');
  const isomorphic = await lintWithConfig(
    isomorphicConfig,
    'packages/domain/src/fixture.ts',
    "import 'node:fs'; import 'react'; import 'next/headers';",
  );
  assert.equal(only(isomorphic, 'no-restricted-imports').length, 3);

  const nodeConfig = runtimeLayer('node');
  const node = await lintWithConfig(nodeConfig, 'backend/src/fixture.ts', "import 'next/server';");
  assert.equal(only(node, 'no-restricted-imports').length, 1);

  const inTest = await lintWithConfig(
    isomorphicConfig,
    'packages/domain/src/fixture.test.ts',
    "import 'node:fs';",
  );
  assert.deepEqual(only(inTest, 'no-restricted-imports'), []);
});

test('runtime restrictions cover dynamic, require and erased type imports', async () => {
  const nodeConfig = runtimeLayer('node');
  for (const code of [
    "export const load = () => import('next/headers');",
    'export const load = () => import(`next/headers`);',
    "export const value = require('next/headers');",
    "export type Value = import('next/headers').Value;",
  ]) {
    const messages = await lintWithConfig(nodeConfig, 'backend/src/fixture.ts', code);
    assert.equal(only(messages, 'no-restricted-syntax').length, 1, code);
  }
});

test('recommended standards reject dummy parameters and allow positional callbacks', async () => {
  const { standards } = await import('../../configs/eslint/standards.js');
  const config = await standards('isomorphic', { root: rootPath, complete: false });
  const rejected = await lintWithConfig(
    config,
    'backend/src/fixture.ts',
    'export function readValue(value: number, ..._dummy: unknown[]) { return value; }',
  );
  assert.equal(only(rejected, '@typescript-eslint/no-unused-vars').length, 1);
  const accepted = await lintWithConfig(
    config,
    'backend/src/fixture.ts',
    'export const positions = [1, 2].map((_value, index) => index);',
  );
  assert.deepEqual(only(accepted, '@typescript-eslint/no-unused-vars'), []);
});

test('legacy argument exceptions are restricted to listed workspace files and names', async () => {
  const { standards } = await import('../../configs/eslint/standards.js');
  const { unusedArgumentCompatibility } =
    await import('../../configs/eslint/unused-argument-compatibility.js');
  for (const [scope, entries] of Object.entries(unusedArgumentCompatibility)) {
    const workspace = path.join(rootPath, scope);
    const eslint = new ESLint({
      cwd: workspace,
      overrideConfigFile: true,
      overrideConfig: await standards('isomorphic', { root: workspace, complete: false }),
    });
    async function unused(relativeFile, parameters) {
      const [result] = await eslint.lintText(
        `export function readValue(${parameters}) { return 1; }`,
        { filePath: path.join(workspace, relativeFile) },
      );
      assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
      return result.messages.filter(({ ruleId }) => ruleId === '@typescript-eslint/no-unused-vars');
    }
    for (const { files, names } of entries) {
      for (const file of files) {
        const filename = file.replaceAll('\\[', '[').replaceAll('\\]', ']');
        assert.deepEqual(
          await unused(filename, names.map((name) => `${name}: unknown`).join(', ')),
          [],
          `${scope}/${file}`,
        );
        assert.equal(
          (await unused(filename, '..._dummy: unknown[]')).length,
          1,
          `${scope}/${file}`,
        );
      }
      assert.equal((await unused('src/unlisted.ts', `${names[0]}: unknown`)).length, 1, scope);
    }
  }
});
