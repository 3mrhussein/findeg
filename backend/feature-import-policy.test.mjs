import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { restriction } from './feature-import-policy.mjs';

const lint = (source, feature = 'administration', exceptions = []) =>
  new Linter().verify(`import { value } from '${source}';`, {
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: {
      'no-restricted-imports': ['error', { patterns: [restriction(feature, exceptions)] }],
    },
  });

test('rejects relative and package imports into another feature internals', () => {
  for (const source of [
    '../../../order/application/services/foo',
    '@findeg/backend/features/order/domain/foo',
    '../outbox/infrastructure/foo',
    '@findeg/backend/features/partner-sales/partner-report',
  ]) {
    assert.equal(
      lint(source).filter((x) => x.ruleId === 'no-restricted-imports').length,
      1,
      source,
    );
  }
});
test('permits barrels, documented public entries and same-feature internals', () => {
  for (const source of [
    '../../../order',
    '@findeg/backend/features/order',
    '../order/schemas',
    '../core/money',
    './application/foo',
    '@findeg/backend/features/administration/domain/foo',
  ]) {
    assert.equal(lint(source).length, 0, source);
  }
  assert.equal(lint('../../../order/application/foo', 'order').length, 0);
});
test('legacy exceptions permit one exact import without opening its neighboring files', () => {
  const exception = '../../../catalog/application/dtos';
  assert.equal(lint(exception, 'administration', [exception]).length, 0);
  assert.equal(lint(`${exception}/private`, 'administration', [exception]).length, 1);
});

test('lazy imports cannot bypass feature internals; public lazy entries remain allowed', async () => {
  const { dynamicInternalImports } = await import('./feature-import-policy.mjs');
  const config = {
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    plugins: { features: { rules: { dynamic: dynamicInternalImports } } },
    rules: { 'features/dynamic': ['error', restriction('administration').regex] },
  };
  for (const source of ['../../../order/factory', '@findeg/backend/features/order/mapper']) {
    const messages = new Linter().verify(`const orders = await import('${source}');`, config);
    assert.equal(messages.length, 1, source);
    assert.equal(messages[0].ruleId, 'features/dynamic');
  }
  for (const source of ['../../../order', '../outbox/transaction', '@findeg/db/connection']) {
    assert.equal(
      new Linter().verify(`const module = await import('${source}');`, config).length,
      0,
      source,
    );
  }
});

test('TypeScript import types preserve the same feature seam', async () => {
  const { dynamicInternalImports } = await import('./feature-import-policy.mjs');
  const { backend } = await import('@findeg/config/eslint/backend');
  const parser = backend.find((entry) => entry.languageOptions?.parser).languageOptions.parser;
  const config = {
    languageOptions: { parser },
    plugins: { features: { rules: { dynamic: dynamicInternalImports } } },
    rules: { 'features/dynamic': ['error', restriction('administration').regex] },
  };
  assert.equal(
    new Linter().verify("type Orders = import('../../../order/factory').Orders;", config).length,
    1,
  );
  assert.equal(
    new Linter().verify("type Orders = import('../../../order').Orders;", config).length,
    0,
  );
});
