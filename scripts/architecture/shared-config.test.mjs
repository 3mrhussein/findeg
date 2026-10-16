import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = fileURLToPath(new URL('../../', import.meta.url));
const { ESLint } = createRequire(new URL('../../backend/package.json', import.meta.url))('eslint');
const env = { ...process.env, pnpm_config_verify_deps_before_run: 'false' };
function run(args) {
  const result = spawnSync('pnpm', args, { cwd: root, encoding: 'utf8', env });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result.stdout;
}

test('root ESLint profiles report real source violations', async () => {
  for (const [profile, name] of [
    ['isomorphic', 'isomorphic'],
    ['node', 'node'],
    ['react-ui', 'reactUi'],
    ['next', 'next'],
  ]) {
    const shared = await import(
      new URL(`../../configs/eslint/profiles/${profile}.js`, import.meta.url)
    );
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: shared[name] });
    const [result] = await eslint.lintText('debugger;\n', { filePath: 'fixture.ts' });
    assert.equal(result.fatalErrorCount, 0);
    assert.ok(
      result.messages.some((message) => message.ruleId === 'no-debugger' && message.severity === 2),
    );
    const [valid] = await eslint.lintText('export const value = 1;\n', {
      filePath: 'fixture.ts',
    });
    assert.equal(valid.errorCount, 0, JSON.stringify(valid.messages));
  }
});

test('canonical TypeScript base resolves environment paths', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-config-ts-'));
  try {
    fs.writeFileSync(
      path.join(directory, 'index.ts'),
      "import type { Env } from '@findeg/env';\nexport const acceptEnv = (env: Env) => env;\n",
    );
    fs.writeFileSync(
      path.join(directory, 'tsconfig.json'),
      JSON.stringify({
        extends: path.join(root, 'configs/tsconfig/base.json'),
        compilerOptions: {
          types: ['node'],
          typeRoots: [path.join(root, 'configs/env/node_modules/@types')],
        },
        include: ['index.ts'],
      }),
    );
    const result = spawnSync(
      process.execPath,
      [path.join(root, 'node_modules/typescript/bin/tsc'), '--project', directory],
      { encoding: 'utf8', env },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('root config edits invalidate task hashes and select affected consumers', () => {
  const args = ['exec', 'turbo', 'run', 'lint', 'type-check', 'test', 'build', '--dry=json'];
  const before = JSON.parse(run(args));
  const probe = path.join(root, 'configs', 'cache-fixture.json');
  assert.equal(fs.existsSync(probe), false);
  try {
    fs.writeFileSync(probe, '{"fixture":true}\n');
    const after = JSON.parse(run(args));
    for (const task of before.tasks.filter((task) => !task.taskId.endsWith('#transit'))) {
      const changed = after.tasks.find((candidate) => candidate.taskId === task.taskId);
      assert.notEqual(changed.hash, task.hash, task.taskId);
    }
    const affected = JSON.parse(run(['exec', 'turbo', 'run', 'lint', '--affected', '--dry=json']));
    for (const workspace of [
      '@findeg/backend',
      '@findeg/domain',
      '@findeg/dashboard',
      '@findeg/storefront',
      '@findeg/ui',
      '@findeg/db',
    ]) {
      assert.ok(affected.packages.includes(workspace), workspace);
    }
  } finally {
    fs.rmSync(probe, { force: true });
  }
});

test('shared Vitest defaults preserve node/browser discovery, setup and aliases', () => {
  for (const [workspace, preset, browser] of [
    ['backend', 'nodeTest', false],
    ['frontend/dashboard', 'browserTest', true],
  ]) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-config-vitest-'));
    try {
      fs.symlinkSync(
        path.join(root, workspace, 'node_modules'),
        path.join(directory, 'node_modules'),
      );
      fs.mkdirSync(path.join(directory, '__tests__'));
      fs.writeFileSync(path.join(directory, 'setup.ts'), 'globalThis.compatibilityFixture = 42;\n');
      fs.writeFileSync(path.join(directory, 'value.ts'), 'export const value = 7;\n');
      fs.writeFileSync(
        path.join(directory, '__tests__/compatibility.test.ts'),
        `import { value } from 'fixture-value';
        test('loads the selected runtime, setup and alias', () => {
          expect(typeof document).toBe('${browser ? 'object' : 'undefined'}');
          expect(globalThis.compatibilityFixture).toBe(42);
          expect(value).toBe(7);
        });`,
      );
      fs.writeFileSync(
        path.join(directory, 'vitest.config.ts'),
        `import { ${preset} } from ${JSON.stringify(path.join(root, 'configs/vitest/defaults.ts'))};
        export default {
          test: { ...${preset}, globals: true, include: ['__tests__/*.test.ts'], setupFiles: ['./setup.ts'] },
          resolve: { alias: { 'fixture-value': ${JSON.stringify(path.join(directory, 'value.ts'))} } }
        };`,
      );
      const require = createRequire(path.join(root, workspace, 'package.json'));
      const binary = path.join(path.dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
      const result = spawnSync(process.execPath, [binary, 'run'], {
        cwd: directory,
        env,
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, result.stdout + result.stderr);
      assert.match(result.stdout, /1 passed/);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
});

test('Domain source edits invalidate lint for consumers without a Domain dependency', () => {
  const args = ['exec', 'turbo', 'run', 'lint', '--dry=json'];
  const before = JSON.parse(run(args));
  const probe = path.join(root, 'packages/domain/src/domain-copy-cache-fixture.ts');
  assert.equal(fs.existsSync(probe), false);
  try {
    fs.writeFileSync(probe, "export const FUTURE_VALUES = ['future-a', 'future-b'] as const;\n");
    const after = JSON.parse(run(args));
    for (const task of before.tasks.filter((task) => task.task === 'lint')) {
      const changed = after.tasks.find((candidate) => candidate.taskId === task.taskId);
      assert.notEqual(changed.hash, task.hash, task.taskId);
    }
    const affected = JSON.parse(run(['exec', 'turbo', 'run', 'lint', '--affected', '--dry=json']));
    assert.ok(affected.packages.includes('@findeg/ui'));
  } finally {
    fs.rmSync(probe, { force: true });
  }
});
