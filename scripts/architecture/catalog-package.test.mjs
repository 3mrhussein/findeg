import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';

test('Catalog publishes root/types and replaces the backend contexts', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../../packages/catalog/package.json', import.meta.url)),
  );
  assert.equal(manifest.name, '@findeg/catalog');
  assert.deepEqual(Object.keys(manifest.exports).sort(), ['.', './types']);
  assert.equal(existsSync(new URL('../../backend/src/features/catalog', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../backend/src/features/review', import.meta.url)), false);
  assert.equal(manifest.dependencies['@findeg/backend'], undefined);
});
