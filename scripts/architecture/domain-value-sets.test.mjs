import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const { ESLint } = createRequire(new URL('../../backend/package.json', import.meta.url))('eslint');
const ruleId = 'local/no-domain-value-set-copies';
async function copies(code, file = 'backend/src/domain-values-fixture.ts') {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: path.join(root, 'backend/eslint.config.js'),
  });
  const [result] = await eslint.lintText(code, { filePath: path.join(root, file) });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
  return result.messages.filter((message) => message.ruleId === ruleId);
}

test('domain ownership rejects a reversed complete value set as an error', async () => {
  const messages = await copies("export const statuses = ['inactive', 'active'] as const;");
  assert.equal(messages.length, 1);
  assert.equal(messages[0].severity, 2);
  assert.match(messages[0].message, /ACTIVE_STATUSES/);
});

test('domain ownership covers unions and SQL lists, including three-member subsets', async () => {
  for (const code of [
    "export type Status = 'shipped' | 'cancelled' | 'pending';",
    "export type Status = 'pending' | ('shipped' | 'cancelled');",
    "export const query = sql`status IN ('shipped', 'cancelled', 'pending')`;",
    "export const query = \"status in ('inactive', 'active')\";",
  ]) {
    assert.equal((await copies(code)).length, 1, code);
  }
});

test('domain ownership permits intentional fixture and owner copies', async () => {
  for (const file of [
    'backend/src/fixture.test.ts',
    'backend/src/fixture.spec.ts',
    'backend/src/__tests__/fixture.ts',
    'backend/src/testing/fixture.ts',
    'backend/tests/fixture.ts',
    'backend/specs/fixture.ts',
    'backend/cypress/fixtures/fixture.ts',
    'backend/fixtures/fixture.ts',
    'backend/migrations/fixture.ts',
  ])
    assert.equal(
      (await copies("export const statuses = ['inactive', 'active'];", file)).length,
      0,
      file,
    );
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: path.join(root, 'packages/domain/eslint.config.js'),
  });
  const [result] = await eslint.lintText(
    "export const statuses = ['inactive', 'active'] as const;",
    { filePath: path.join(root, 'packages/domain/src/fixture.ts') },
  );
  assert.equal(result.messages.filter((message) => message.ruleId === ruleId).length, 0);
});

test('new live exports are protected through aliases and satisfies; private and type-only sets are excluded', async () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-domain-exports-'));
  try {
    const config = path.join(fixture, 'packages/config');
    const domain = path.join(fixture, 'packages/domain');
    fs.mkdirSync(path.join(config, 'eslint/rules'), { recursive: true });
    fs.mkdirSync(path.join(domain, 'src'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'package.json'), '{"type":"module"}');
    fs.symlinkSync(
      path.join(root, 'packages/config/node_modules'),
      path.join(config, 'node_modules'),
    );
    fs.copyFileSync(
      path.join(root, 'packages/config/eslint/rules/no-domain-value-set-copies.js'),
      path.join(config, 'eslint/rules/no-domain-value-set-copies.js'),
    );
    fs.writeFileSync(
      path.join(domain, 'package.json'),
      JSON.stringify({ exports: { '.': './src/index.ts' } }),
    );
    fs.writeFileSync(
      path.join(domain, 'src/index.ts'),
      "export { NEW_VALUES as FUTURE_PUBLIC } from './values'; export type * from './types';",
    );
    fs.writeFileSync(
      path.join(domain, 'src/values.ts'),
      "export const NEW_VALUES = ['future-a', 'future-b', 'future-c', 'future-d'] as const satisfies readonly string[]; const PRIVATE = ['private-a', 'private-b'] as const;",
    );
    fs.writeFileSync(
      path.join(domain, 'src/types.ts'),
      "export const TYPE_ONLY = ['type-a', 'type-b'] as const;",
    );
    fs.writeFileSync(
      path.join(config, 'eslint.config.js'),
      "import tseslint from 'typescript-eslint'; import { noDomainValueSetCopiesRule } from './eslint/rules/no-domain-value-set-copies.js'; export default [{files:['**/*.ts'],languageOptions:{parser:tseslint.parser},plugins:{local:{rules:{'no-domain-value-set-copies':noDomainValueSetCopiesRule}}},rules:{'local/no-domain-value-set-copies':'error'}}];",
    );
    const eslint = new ESLint({
      cwd: fixture,
      overrideConfigFile: path.join(config, 'eslint.config.js'),
    });
    const [result] = await eslint.lintText(
      "const future = ['future-c', 'future-a', 'future-b']; const privateValues = ['private-a', 'private-b']; const typeOnly = ['type-a', 'type-b'];",
      { filePath: path.join(fixture, 'backend/src/values.ts') },
    );
    assert.equal(result.messages.length, 1, JSON.stringify(result.messages));
    assert.match(result.messages[0].message, /FUTURE_PUBLIC/);
    const configuration = fs.readFileSync(path.join(config, 'eslint.config.js'), 'utf8');
    fs.writeFileSync(path.join(domain, 'src/values.ts'), 'export const BROKEN = ;');
    fs.writeFileSync(
      path.join(config, 'invalid.config.js'),
      configuration.replace(
        'no-domain-value-set-copies.js',
        'no-domain-value-set-copies.js?invalid',
      ),
    );
    const invalid = new ESLint({
      cwd: fixture,
      overrideConfigFile: path.join(config, 'invalid.config.js'),
    });
    await assert.rejects(
      invalid.lintText('export const value = 1;', {
        filePath: path.join(fixture, 'backend/src/value.ts'),
      }),
      /Expression expected/,
    );
    fs.writeFileSync(path.join(domain, 'src/index.ts'), "export * from './missing';");
    fs.writeFileSync(
      path.join(config, 'missing.config.js'),
      configuration.replace(
        'no-domain-value-set-copies.js',
        'no-domain-value-set-copies.js?missing',
      ),
    );
    const missing = new ESLint({
      cwd: fixture,
      overrideConfigFile: path.join(config, 'missing.config.js'),
    });
    await assert.rejects(
      missing.lintText('export const value = 1;', {
        filePath: path.join(fixture, 'backend/src/value.ts'),
      }),
      /Cannot resolve domain export/,
    );
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('non-matches and compliant imports remain legal', async () => {
  for (const code of [
    "import { ORDER_STATUSES } from '@findeg/domain/orders'; export { ORDER_STATUSES };",
    "const partial = ['pending', 'processing'];",
    "type Partial = 'pending' | 'processing';",
    "const mixed = ['pending', 'processing', 'not-a-status'];",
    "const dynamic = ['pending', variable, 'cancelled'];",
    "const query = sql`status in ('pending', ${status}, 'cancelled')`;",
    "const query = `status in ('pending', 'processing')`;",
    "const query = `status in ('pending', 'processing', 'unknown')`;",
  ])
    assert.equal((await copies(code)).length, 0, code);
});

test('findeg-lint rejects a copied set rather than ratcheting it as a warning', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-domain-cli-'));
  try {
    fs.symlinkSync(
      path.join(root, 'packages/config/node_modules'),
      path.join(fixture, 'node_modules'),
    );
    fs.writeFileSync(
      path.join(fixture, 'package.json'),
      '{"name":"@fixture/domain-copy","type":"module"}',
    );
    const profile = pathToFileURL(
      path.join(root, 'packages/config/eslint/profiles/isomorphic.js'),
    ).href;
    fs.writeFileSync(
      path.join(fixture, 'eslint.config.js'),
      `export { isomorphic as default } from '${profile}';`,
    );
    fs.writeFileSync(
      path.join(fixture, 'index.ts'),
      "export const statuses = ['inactive', 'active'] as const;",
    );
    const result = spawnSync(
      process.execPath,
      [path.join(root, 'packages/config/bin/lint.mjs'), 'index.ts'],
      { cwd: fixture, encoding: 'utf8' },
    );
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, /error\s+Use ACTIVE_STATUSES.*local\/no-domain-value-set-copies/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
