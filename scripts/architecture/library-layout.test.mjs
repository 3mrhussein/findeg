import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { libraryScopes } from '../../configs/library-scopes.mjs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(new URL('../../configs/package.json', import.meta.url));
const { ESLint } = require('eslint');
const libraryConfig = new URL('../../configs/eslint/library.js', import.meta.url).href;

// Lints a fixture library with the recursive layout rule and returns its layout diagnostics.
async function layout(files, scopes = ['src/common']) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-layout-'));
  try {
    for (const [file, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      fs.writeFileSync(path.join(directory, file), content);
    }
    fs.writeFileSync(
      path.join(directory, 'eslint.config.js'),
      `import { libraryLayout } from ${JSON.stringify(libraryConfig)};\nexport default libraryLayout(${JSON.stringify(scopes)}, { root: ${JSON.stringify(directory)} });\n`,
    );
    const linted = Object.keys(files).filter((file) => /\.tsx?$/.test(file));
    const results = await new ESLint({ cwd: directory, warnIgnored: false }).lintFiles(linted);
    return results.flatMap((result) =>
      result.messages
        .filter(({ ruleId }) => ruleId === 'findeg-library/layout')
        .map(({ message }) => path.relative(directory, result.filePath) + ': ' + message),
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

const body = 'export const value = 42;\n';

test('accepts the recursive vocabulary: area entries, named features, helper directories and tests', async () => {
  const violations = await layout({
    'src/common/index.ts': "export * from './types';\nexport * from './features/money';\n",
    'src/common/types.ts': 'export type Id = number;\n',
    'src/common/constants.ts': body,
    'src/common/features/money/index.ts': "export { value } from './helpers';\n",
    'src/common/features/money/helpers.ts': body,
    'src/common/features/money/__tests__/money.test.ts': body,
    'src/common/features/money/__tests__/fixtures/data.ts': body,
    'src/common/features/catalog/index.ts': "export * from './helpers';\n",
    'src/common/features/catalog/helpers/index.ts': "export * from './sku';\n",
    'src/common/features/catalog/helpers/sku/index.ts': body,
    'src/common/features/catalog/helpers/sku/helpers.ts': body,
    'src/common/features/catalog/types.ts': 'export type Sku = string;\n',
    'src/common/features/catalog/features/pricing/index.ts': body,
    'src/common/features/catalog/features/pricing/helpers.ts': body,
  });
  assert.deepEqual(violations, []);
});

test('rejects implementation files and folders outside the module vocabulary', async () => {
  const violations = await layout({
    'src/common/index.ts': body,
    'src/common/money.ts': body,
    'src/common/features/money/index.ts': body,
    'src/common/features/money/utils.ts': body,
    'src/common/features/money/nested/index.ts': body,
    'src/common/lib/index.ts': body,
  });
  assert.ok(
    violations.some((text) => text.includes('money.ts')),
    violations.join('\n'),
  );
  assert.ok(
    violations.some((text) => text.includes('utils.ts')),
    violations.join('\n'),
  );
  assert.ok(
    violations.some((text) => text.includes('nested/')),
    violations.join('\n'),
  );
  assert.ok(
    violations.some((text) => text.includes('lib/')),
    violations.join('\n'),
  );
});

test('rejects a helper file beside a helper directory and a helper file without an entry', async () => {
  const both = await layout({
    'src/common/index.ts': body,
    'src/common/helpers.ts': body,
    'src/common/helpers/index.ts': body,
  });
  assert.ok(
    both.some((text) => text.includes('cannot both exist')),
    both.join('\n'),
  );
  const noEntry = await layout({
    'src/common/features/money/helpers.ts': body,
  });
  assert.ok(
    noEntry.some((text) => text.includes('needs an index.ts entry')),
    noEntry.join('\n'),
  );
});

test('rejects implementation directly inside helper and feature containers', async () => {
  const violations = await layout({
    'src/common/index.ts': body,
    'src/common/helpers/helpers.ts': body,
    'src/common/features/rate.ts': body,
  });
  assert.ok(
    violations.some((text) => text.includes('helpers.ts')),
    violations.join('\n'),
  );
  assert.ok(
    violations.some((text) => text.includes('rate.ts')),
    violations.join('\n'),
  );
});

test('applies only to the configured scopes, so applications and UI keep their own layouts', async () => {
  const violations = await layout(
    {
      'src/common/index.ts': body,
      'src/components/Button.tsx': 'export const Button = () => null;\n',
      'src/app/page.tsx': body,
      'src/lib/money.ts': body,
    },
    ['src/common'],
  );
  assert.deepEqual(violations, []);
});

test('the Domain library scopes conform to the recursive library layout', async () => {
  const domain = path.join(root, 'packages/domain');
  const scopes = libraryScopes['packages/domain'];
  const eslint = new ESLint({ cwd: domain });
  const results = await eslint.lintFiles(scopes.map((scope) => `${scope}/**/*.ts`));
  const diagnostics = results.flatMap((result) =>
    result.messages.filter(({ ruleId }) => ruleId === 'findeg-library/layout'),
  );
  assert.deepEqual(
    diagnostics.map(({ message }) => message),
    [],
  );
});
