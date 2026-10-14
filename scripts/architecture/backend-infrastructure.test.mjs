import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);
test('backend publishes infrastructure entries without Administration business services', () => {
  const manifest = JSON.parse(readFileSync(new URL('backend/package.json', root), 'utf8'));
  assert.equal(existsSync(new URL('backend/src/features/administration', root)), false);
  assert.equal(manifest.exports['./features/administration'], undefined);
  assert.equal(manifest.exports['./features/*'], undefined);
});
test('PostgreSQL harness belongs to shared test tooling', () => {
  assert.equal(existsSync(new URL('configs/vitest/postgres/global-setup.ts', root)), true);
  assert.equal(existsSync(new URL('backend/src/testing/postgres', root)), false);
});

test('Backend resolves only its published infrastructure surface', async () => {
  const { createRequire } = await import('node:module');
  const require = createRequire(new URL('backend/package.json', root));
  for (const entry of [
    'features/core',
    'features/core/logger',
    'features/media',
    'features/notifications',
    'features/outbox',
    'features/audit',
    'lib/sanitize-html',
  ]) {
    assert.ok(require.resolve(`@findeg/backend/${entry}`));
  }
  for (const entry of [
    'features/administration',
    'features/core/schemas',
    'features/core/domain/auth',
    'features/catalog',
    'features/core/infrastructure/auth/JwtTokenService',
  ]) {
    assert.throws(() => require.resolve(`@findeg/backend/${entry}`), {
      code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
    });
  }
});
