import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(import.meta.dirname, '../..');
const require = createRequire(path.join(root, 'backend/package.json'));
const binary = path.join(path.dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
function run(files, library = true, extra = [], scope = undefined) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-policy-'));
  try {
    fs.symlinkSync(path.join(root, 'backend/node_modules'), path.join(directory, 'node_modules'));
    for (const [file, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      fs.writeFileSync(path.join(directory, file), content);
    }
    fs.writeFileSync(
      path.join(directory, 'vitest.config.ts'),
      `import { sharedTest } from ${JSON.stringify(path.join(root, 'configs/vitest/policy.mjs'))};
export default { test: { ...sharedTest({ root: ${JSON.stringify(directory)}, enabled: true, library: ${library}, scope: ${JSON.stringify(scope)} }), maxWorkers: 1 } };`,
    );
    const result = spawnSync(process.execPath, [binary, 'run', ...extra], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 60000,
    });
    return { status: result.status, output: result.stdout + result.stderr };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}
const implementation = 'export function value() { return 42; }';
const executableTest = `import { test, expect } from 'vitest'; import { value } from '../index'; test('value', () => expect(value()).toBe(42));`;
test('enforcing run discovers arbitrary executable filenames in __tests__', () => {
  const result = run({
    'src/index.ts': implementation,
    'src/__tests__/behavior.ts': executableTest,
  });
  assert.equal(result.status, 0, result.output);
});
test('rejects missing or non-executable local tests and rejects coverage bypass', () => {
  for (const tests of [{}, { 'src/__tests__/empty.ts': 'export const fixture = 1;' }]) {
    const result = run({
      'src/index.ts': implementation,
      ...tests,
      'elsewhere.test.ts': "import { test } from 'vitest'; test('runs', () => {});",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.output, /require local executable __tests__/);
  }
  const bypass = run(
    { 'src/index.ts': implementation, 'src/__tests__/behavior.ts': executableTest },
    true,
    ['--coverage.enabled=false'],
  );
  assert.notEqual(bypass.status, 0);
  assert.match(bypass.output, /requires enabled 80% per-file coverage/);
});
test('exempts recursive types, constants, declarations and re-export directories', () => {
  const result = run({
    'src/index.ts': "export { value } from './features/value';",
    'src/features/types.ts': 'export interface Value { value: number }',
    'src/features/constants.ts': 'export const ignored = () => 0;',
    'src/features/declarations/index.ts':
      'export interface Example { value: string }; export declare function declaration(): void;',
    'src/features/value/index.ts': implementation,
    'src/features/value/__tests__/behavior.ts': executableTest,
  });
  assert.equal(result.status, 0, result.output);
});
test('unimported helper fails despite fully covered sibling; apps retain colocated tests', () => {
  const files = {
    'src/index.ts': implementation,
    'src/__tests__/behavior.ts': executableTest,
    'src/helpers.ts': 'export function uncovered() { return 0; }',
  };
  const result = run(files);
  assert.notEqual(result.status, 0);
  assert.match(result.output, /helpers.ts/);
  assert.match(result.output, /coverage.*threshold/i);
  const app = run(
    {
      'src/index.ts': implementation,
      'src/legacy.test.ts': executableTest.replace("'../index'", "'./index'"),
    },
    false,
  );
  assert.equal(app.status, 0, app.output);
});
test('accepts exactly 80% and rejects below threshold independently for each metric', () => {
  // Five equal functions: four called gives precisely 80% lines/statements/functions.
  const functions = Array.from(
    { length: 5 },
    (_, index) => `export function f${index}() { return ${index}; }`,
  ).join('\n');
  const calls = (count) =>
    `import { test, expect } from 'vitest'; import * as values from '../index'; test('known values', () => { ${Array.from({ length: count }, (_, index) => `expect(values.f${index}()).toBe(${index});`).join(' ')} });`;
  const exact = run({ 'src/index.ts': functions, 'src/__tests__/behavior.ts': calls(4) });
  assert.equal(exact.status, 0, exact.output);
  const below = run({ 'src/index.ts': functions, 'src/__tests__/behavior.ts': calls(3) });
  assert.notEqual(below.status, 0);
  for (const metric of ['lines', 'statements', 'functions'])
    assert.match(below.output, new RegExp(`Coverage for ${metric} .*threshold`));
  // All functions and statements execute; one arm of each conditional remains uncovered.
  const branch = run({
    'src/index.ts': 'export function value(flag: boolean) { return flag ? 42 : 0; }',
    'src/__tests__/behavior.ts': executableTest.replace('value()', 'value(true)'),
  });
  assert.notEqual(branch.status, 0);
  assert.match(branch.output, /Coverage for branches .*threshold/);
  assert.doesNotMatch(branch.output, /Coverage for (lines|statements|functions) .*threshold/);
});

test('each coverage metric independently rejects an implementation file', () => {
  const repeated = 'let value = 0; ' + 'value++; '.repeat(9) + 'return value;';
  const cases = {
    functions: Array.from(
      { length: 10 },
      (_, i) => `export function f${i}() { ${i < 3 ? repeated : 'return 0;'} }`,
    ).join(' '),
    statements: Array.from(
      { length: 10 },
      (_, i) => `export function f${i}() { ${i === 9 ? repeated : 'return 0;'} }`,
    ).join(' '),
    lines: Array.from(
      { length: 10 },
      (_, i) =>
        `export function f${i}() { ${i === 9 ? repeated.replaceAll('; ', ';\n') : repeated} }`,
    ).join('\n'),
  };
  for (const [metric, code] of Object.entries(cases)) {
    const count = metric === 'functions' ? 3 : 9;
    const result = run({
      'src/index.ts': code,
      'src/__tests__/behavior.ts': `import { test } from 'vitest'; import * as values from '../index'; test('executes known paths', () => { ${Array.from({ length: count }, (_, i) => `values.f${i}();`).join(' ')} });`,
    });
    assert.notEqual(result.status, 0, result.output);
    assert.match(result.output, new RegExp(`Coverage for ${metric} .*threshold`));
    for (const other of ['lines', 'statements', 'functions', 'branches'].filter(
      (name) => name !== metric,
    ))
      assert.doesNotMatch(result.output, new RegExp(`Coverage for ${other} .*threshold`));
  }
});
test('accepts exactly 80% branch coverage', () => {
  const code = Array.from(
    { length: 5 },
    (_, i) => `export function f${i}(flag: boolean) { return flag ? 42 : 0; }`,
  ).join('\n');
  const result = run({
    'src/index.ts': code,
    'src/__tests__/behavior.ts': `import { test, expect } from 'vitest'; import * as values from '../index'; test('known branch results', () => { ${Array.from({ length: 5 }, (_, i) => `expect(values.f${i}(true)).toBe(42); ${i < 3 ? `expect(values.f${i}(false)).toBe(0);` : ''}`).join(' ')} });`,
  });
  assert.equal(result.status, 0, result.output);
});
test('ordinary constant declarations remain covered and skipped tests do not satisfy placement', () => {
  const result = run({
    'src/index.ts': implementation,
    'src/helpers.ts': 'export const ordinaryValue = 42;',
    'src/__tests__/behavior.ts': executableTest,
  });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /threshold .*helpers.ts/);
  const skipped = run({
    'src/index.ts': implementation,
    'src/__tests__/behavior.ts': executableTest.replace("test('value'", "test.skip('value'"),
  });
  assert.notEqual(skipped.status, 0);
  assert.match(skipped.output, /require local executable __tests__/);
});
test('missing local tests are rejected even with passWithNoTests', () => {
  const result = run({ 'src/index.ts': implementation }, true, ['--passWithNoTests']);
  assert.notEqual(result.status, 0);
  assert.match(result.output, /require local executable __tests__/);
});
test('non-test helper files under __tests__ are not executed as suites', () => {
  const result = run({
    'src/index.ts': implementation,
    'src/__tests__/fixtures.ts': 'export const fixture = { value: 42 };',
    'src/__tests__/behavior.ts': executableTest,
  });
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /No test suite found/);
});

test('a pilot scope measures and places only its own subtree', () => {
  const scoped = {
    'src/common/index.ts': implementation,
    'src/common/__tests__/behavior.ts': executableTest,
  };
  // Untested and test-less implementation outside the pilot scope does not block the scope.
  const accepted = run(
    { ...scoped, 'src/lib/unused.ts': implementation },
    true,
    [],
    ['src/common'],
  );
  assert.equal(accepted.status, 0, accepted.output);
  // Untested implementation inside the scope is measured and rejected per file.
  const rejected = run(
    { ...scoped, 'src/common/unused.ts': implementation },
    true,
    [],
    ['src/common'],
  );
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.output, /src\/common\/unused\.ts|unused\.ts/);
});
