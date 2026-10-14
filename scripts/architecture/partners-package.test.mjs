import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);
test('Business Partner application has a root/types boundary and no backend implementation', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('packages/partners/package.json', root), 'utf8'),
  );
  assert.deepEqual(manifest.exports, { '.': './src/index.ts', './types': './src/types.ts' });
  assert.equal(manifest.dependencies['@findeg/backend'], undefined);
  for (const feature of ['partner-membership', 'partner-sales']) {
    assert.equal(existsSync(new URL(`backend/src/features/${feature}`, root)), false);
  }
});
