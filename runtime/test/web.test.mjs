import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWebRuntime } from '../dist/index.js';

const environment = {
  RELEASE_REVISION: 'a'.repeat(40),
  DATABASE_URL: 'postgres://localhost/findeg',
};

test('the Storefront is public while protected portal entry requires a Current Session', async () => {
  const web = createWebRuntime(environment);
  assert.equal(await web.enterPortal('storefront'), 'allowed');
  assert.equal(await web.enterPortal('partner'), 'authentication-required');
  assert.equal(await web.enterPortal('back-office'), 'authentication-required');
  await web.close();
  assert.deepEqual(web.health(), { process: 'web', revision: 'a'.repeat(40), status: 'alive' });
});
