import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const storefront = new URL('../../frontend/storefront/', import.meta.url);
const require = createRequire(new URL('package.json', storefront));
const { ESLint } = require('eslint');
const eslint = new ESLint({ cwd: fileURLToPath(storefront) });

async function boundaryMessages(code) {
  const [result] = await eslint.lintText(code, { filePath: 'src/components/boundary-fixture.tsx' });
  assert.equal(result.fatalErrorCount, 0);
  return result.messages.filter((message) =>
    ['no-restricted-imports', 'local/no-full-barrel-import-in-client-components'].includes(
      message.ruleId,
    ),
  );
}

test('storefront lint rejects backend infrastructure and direct database imports', async () => {
  for (const source of [
    '@findeg/backend/features/catalog/infrastructure/repositories/ProductRepository',
    '@findeg/db/connection',
    '@findeg/db',
  ]) {
    const messages = await boundaryMessages(`import { value } from '${source}';`);
    assert.equal(messages.length, 1, source);
    assert.equal(messages[0].ruleId, 'no-restricted-imports');
  }
});

test('client schema values must use the schemas entry point', async () => {
  const messages = await boundaryMessages(`
    'use client';
    import { ShippingAddressSchema } from '@findeg/orders';
  `);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].ruleId, 'local/no-full-barrel-import-in-client-components');
});

test('server factories, client schemas and erased client types remain allowed', async () => {
  for (const code of [
    "import { createStorefrontServices } from '@findeg/backend/features/catalog';",
    "'use client'; import { ShippingAddressSchema } from '@findeg/orders/schemas';",
    "'use client'; import { hasPermission, PERMISSION_CODES } from '@findeg/backend/features/core/schemas';",
    "'use client'; import type { ShippingAddressSchema } from '@findeg/orders';",
    "'use client'; import { type ShippingAddressSchema } from '@findeg/orders';",
  ]) {
    assert.deepEqual(await boundaryMessages(code), []);
  }
});
