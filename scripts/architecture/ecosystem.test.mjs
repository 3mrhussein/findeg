import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(new URL('../../configs/package.json', import.meta.url));
const { ESLint } = require('eslint');

async function fixture(role, filename, code) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-ecosystem-'));
  fs.symlinkSync(
    path.join(root, 'frontend/dashboard/node_modules'),
    path.join(directory, 'node_modules'),
  );
  fs.writeFileSync(
    path.join(directory, 'package.json'),
    '{"name":"@fixture/standards","type":"module"}',
  );
  fs.writeFileSync(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        jsx: 'react-jsx',
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        skipLibCheck: true,
      },
      include: ['**/*.ts', '**/*.tsx', '**/*.js'],
    }),
  );
  fs.mkdirSync(path.dirname(path.join(directory, filename)), { recursive: true });
  fs.writeFileSync(path.join(directory, filename), code);
  fs.writeFileSync(
    path.join(directory, 'eslint.config.js'),
    `import { standards } from '${new URL('../../configs/eslint/standards.js', import.meta.url).href}';\nexport default await standards('${role}', { root: ${JSON.stringify(directory)} });\n`,
  );
  fs.writeFileSync(path.join(directory, 'ratchet.json'), '{}');
  try {
    const results = await new ESLint({ cwd: directory }).lintFiles([filename]);
    assert.equal(results[0].fatalErrorCount, 0, JSON.stringify(results[0].messages));
    const eslintBin = path.join(root, 'frontend/dashboard/node_modules/eslint/bin/eslint.js');
    const cli = spawnSync(process.execPath, [eslintBin, filename], {
      cwd: directory,
      encoding: 'utf8',
    });
    return { messages: results[0].messages, status: cli.status, output: cli.stdout + cli.stderr };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('libraries enforce the complete strict type-aware baseline through the lint CLI', async () => {
  const valid = await fixture(
    'isomorphic',
    'index.ts',
    'export const MAX_SIZE = 2;\nexport function doubleValue(value: number): number {\n  return value * MAX_SIZE;\n}\n',
  );
  assert.equal(valid.status, 0, valid.output);
  const invalid = await fixture(
    'isomorphic',
    'index.ts',
    'export async function loadValue() {\n  return 1;\n}\nloadValue();\n',
  );
  assert.equal(invalid.status, 1);
  assert.ok(
    invalid.messages.some(({ ruleId }) => ruleId === '@typescript-eslint/no-floating-promises'),
  );
});

test('global naming covers local declarations without restricting mutable values or external keys', async () => {
  const valid = await fixture(
    'isomorphic',
    'index.ts',
    `export const maxSize = 1;
export const MAX_SIZE = 2;
export const external = { API_KEY: 3 };
export const { API_KEY: apiKey } = external;
export let Mutable_value = 4;
Mutable_value += 1;
export function getValue() { return apiKey; }
export const readValue = getValue;
export type Result = number;
export interface Value { API_KEY: number }
export enum State { Ready }
export class Store { value = 1; }
export const StoreAlias = Store;
export const store = new Store();
`,
  );
  assert.equal(valid.status, 0, valid.output);
  const invalid = await fixture(
    'isomorphic',
    'index.ts',
    `export const BadValue = 1;
export function BadFunction() { return 1; }
export const BAD_FUNCTION = () => 1;
export const BadAlias = BAD_FUNCTION;
export type badType = number;
export interface badInterface { value: number }
export enum badEnum { Ready }
export class badClass {}
export let BadMutableFunction = () => 1;
`,
  );
  assert.equal(invalid.status, 1);
  assert.equal(invalid.messages.filter(({ ruleId }) => ruleId === 'findeg/naming').length, 9);
});

test('TSX accepts component aliases and wrappers while rejecting ordinary PascalCase functions and context values', async () => {
  const valid = await fixture(
    'browser',
    'widgets.tsx',
    `import { memo, forwardRef, createContext } from 'react';
export function Card() { return <div />; }
export const Alias = Card;
export const MemoCard = memo(Card);
export const Input = forwardRef<HTMLInputElement>(function input(props, ref) { return <input ref={ref} />; });
export const cardContext = createContext(1);
export function readValue() { return 1; }
`,
  );
  assert.equal(valid.status, 0, valid.output);
  const invalid = await fixture(
    'browser',
    'widgets.tsx',
    `import { createContext } from 'react';
export const CardContext = createContext(1);
export function Calculate() { return 1; }
export const CALCULATE = () => 1;
export const Unnamed = () => <img />;
`,
  );
  assert.equal(invalid.status, 1);
  assert.equal(invalid.messages.filter(({ ruleId }) => ruleId === 'findeg/naming').length, 3);
  assert.ok(invalid.messages.some(({ ruleId }) => ruleId === 'jsx-a11y/alt-text'));
  const typescript = await fixture(
    'isomorphic',
    'index.ts',
    'export function Card() { return null; }\n',
  );
  assert.ok(typescript.messages.some(({ ruleId }) => ruleId === 'findeg/naming'));
});

test('configuration JavaScript follows naming and the JavaScript recommended preset', async () => {
  const valid = await fixture(
    'isomorphic',
    'tool.config.mjs',
    'export const MAX_SIZE = 2;\nexport function getSize() { return MAX_SIZE; }\nexport const readSize = getSize;\n',
  );
  assert.equal(valid.status, 0, valid.output);
  const invalid = await fixture(
    'isomorphic',
    'tool.config.mjs',
    'export const BAD_FUNCTION = () => 1;\nexport const BadAlias = BAD_FUNCTION;\nexport const BadValue = 1;\ndebugger;\n',
  );
  assert.equal(invalid.status, 1);
  assert.equal(invalid.messages.filter(({ ruleId }) => ruleId === 'findeg/naming').length, 3);
  assert.ok(invalid.messages.some(({ ruleId }) => ruleId === 'no-debugger'));
});

test('browser Hooks preset rejects conditional Hooks without imposing a library layout', async () => {
  const result = await fixture(
    'browser',
    'components/unrestricted/widget.tsx',
    `import { useState } from 'react';
export function Widget({ enabled }: { enabled: boolean }) {
  if (enabled) { useState(1); }
  return <div />;
}
`,
  );
  assert.equal(result.status, 1);
  assert.ok(result.messages.some(({ ruleId }) => ruleId === 'react-hooks/rules-of-hooks'));
});

let nodePluginMissing = false;
try {
  require.resolve('eslint-plugin-n');
} catch {
  nodePluginMissing = true;
}
const unavailable = nodePluginMissing
  ? 'eslint-plugin-n is not installed; registry unavailable (install configs dependencies)'
  : false;

test('Node recommended detects deprecated runtime APIs', { skip: unavailable }, async () => {
  const valid = await fixture('node', 'index.ts', "export const size = Buffer.byteLength('x');\n");
  assert.equal(valid.status, 0, valid.output);
  const invalid = await fixture('node', 'index.ts', "export const buffer = new Buffer('x');\n");
  assert.equal(invalid.status, 1);
  assert.ok(invalid.messages.some(({ ruleId }) => ruleId === 'n/no-deprecated-api'));
});

test(
  'Next composes Core Web Vitals, React, Hooks and full accessibility without duplicate plugins',
  { skip: unavailable },
  async () => {
    const valid = await fixture(
      'next',
      'src/app/page.tsx',
      'export default function Page() { return <main />; }\n',
    );
    assert.equal(valid.status, 0, valid.output);
    const invalid = await fixture(
      'next',
      'src/app/page.tsx',
      'export default function Page() { return <script src="https://example.com/script.js" />; }\n',
    );
    assert.equal(invalid.status, 1);
    assert.ok(invalid.messages.some(({ ruleId }) => ruleId === '@next/next/no-sync-scripts'));
  },
);
