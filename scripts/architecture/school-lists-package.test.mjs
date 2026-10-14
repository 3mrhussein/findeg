import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);
test('School Supply Lists expose root/types without a Backend dependency or legacy implementation', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('packages/school-lists/package.json', root), 'utf8'),
  );
  assert.deepEqual(Object.keys(manifest.exports).sort(), ['.', './types']);
  for (const name of ['@findeg/domain', '@findeg/domain-errors', '@findeg/db']) {
    assert.equal(manifest.dependencies[name], 'workspace:*');
  }
  assert.equal(manifest.dependencies['@findeg/backend'], undefined);
  await assert.rejects(access(new URL('backend/src/features/school', root)), { code: 'ENOENT' });
  await assert.rejects(
    access(
      new URL(
        'backend/src/features/administration/application/services/AdminSchoolSupplyListService.ts',
        root,
      ),
    ),
    { code: 'ENOENT' },
  );
});
