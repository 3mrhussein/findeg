import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Use the repository's installed TS runtime, while resolving the real package export map.
const require = createRequire(new URL('../../db/package.json', import.meta.url));
test('the public server factory imports and uses an injected DB without app configuration', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--import',
      require.resolve('tsx/esm'),
      '--input-type=module',
      '--eval',
      `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    import { createOrders, NotAuthorizedError } from '@findeg/orders';
    const require = createRequire(import.meta.url);
    for (const entry of ['@findeg/orders', '@findeg/orders/schemas', '@findeg/orders/events']) require.resolve(entry);
    for (const entry of ['@findeg/orders/mapper', '@findeg/orders/src/orders', '@findeg/backend/features/order', '@findeg/backend/features/order/schemas']) {
      assert.throws(() => require.resolve(entry), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
    }
    const orders = createOrders();
    await assert.rejects(orders.changeStatus({kind: 'staff', userId: 1}, 1, {status: 'confirmed'}), NotAuthorizedError);
    const sentinel = new Error('injected database');
    const injected = createOrders({db: {select() { throw sentinel; }}});
    await assert.rejects(injected.get(1), error => error === sentinel);
  `,
    ],
    { cwd: fileURLToPath(new URL('../../backend/', import.meta.url)), env: {}, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
