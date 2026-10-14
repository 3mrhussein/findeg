import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';

test('Inventory publishes root/types and replaces the backend inventory code', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../../packages/inventory/package.json', import.meta.url)),
  );
  assert.equal(manifest.name, '@findeg/inventory');
  assert.deepEqual(Object.keys(manifest.exports).sort(), ['.', './types']);
  assert.equal(
    existsSync(
      new URL(
        '../../backend/src/features/administration/application/services/AdminInventoryService.ts',
        import.meta.url,
      ),
    ),
    false,
  );
  assert.equal(manifest.dependencies['@findeg/backend'], undefined);
});
