import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { launchWeb } from './support/web-process.mjs';
import { runMigrations } from '../db/dist/runtime/migrations.js';

const require = createRequire(new URL('../db/package.json', import.meta.url));
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

test('Catalog Managers publish bilingual variants and contested adjustments do not oversell', async (t) => {
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_catalog_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  let database, stopWeb;
  await admin`CREATE DATABASE ${admin(name)}`;
  try {
    await runMigrations({ url: url.toString(), ssl: false });
    database = postgres(url.toString(), { max: 1 });
    const [user] =
      await database`INSERT INTO identity.users(email) VALUES ('catalog@example.test') RETURNING id`;
    const hash = await bcrypt.hash('test-password-123', 4);
    await database`INSERT INTO identity.password_credentials(user_id, password_hash) VALUES (${user.id}, ${hash})`;
    await database`INSERT INTO identity.staff_role_grants(user_id, role) VALUES (${user.id}, 'catalog-manager')`;
    const [product] = await database`
      INSERT INTO catalog.products(localized_name, localized_description, localized_long_description)
      VALUES (${JSON.stringify({ en: 'Notebook', ar: 'دفتر' })}::jsonb, '{}'::jsonb, '{}'::jsonb)
      RETURNING id
    `;
    const [warehouse] = await database`
      INSERT INTO inventory.warehouses(code, name) VALUES ('MAIN', 'Main') RETURNING id
    `;
    const environment = { RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() };
    const { base, stop, output } = await launchWeb(t, environment);
    stopWeb = stop;
    const signIn = await fetch(`${base}/api/v1/sessions`, {
      method: 'POST',
      headers: { origin: base, 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'catalog@example.test', password: 'test-password-123' }),
    });
    assert.equal(signIn.status, 201, output());
    const cookie = signIn.headers.get('set-cookie').split(';')[0];
    const headers = { origin: base, cookie, 'content-type': 'application/json' };
    const created = await fetch(`${base}/api/v1/back-office/catalog/variants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId: product.id,
        sku: 'NOTE-A5',
        variantKey: 'a5',
        label: { en: 'A5', ar: 'أيه ٥' },
        basePrice: '25.00',
        isActive: true,
      }),
    });
    assert.equal(created.status, 201, output());
    const { variantId } = await created.json();
    const adjust = (quantityDelta) =>
      fetch(`${base}/api/v1/back-office/inventory/adjustments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ variantId, warehouseId: warehouse.id, quantityDelta }),
      });
    assert.equal((await adjust(5)).status, 200, output());
    const storefront = await fetch(`${base}/api/v1/catalog?locale=ar`);
    assert.deepEqual(await storefront.json(), [
      { id: variantId, sku: 'NOTE-A5', name: 'دفتر', label: 'أيه ٥', price: '25.00', available: 5 },
    ]);
    const englishStorefront = await fetch(`${base}/api/v1/catalog?locale=en`);
    assert.deepEqual(await englishStorefront.json(), [
      {
        id: variantId,
        sku: 'NOTE-A5',
        name: 'Notebook',
        label: 'A5',
        price: '25.00',
        available: 5,
      },
    ]);
    const contested = await Promise.all([adjust(-4), adjust(-4)]);
    assert.deepEqual(contested.map((response) => response.status).sort(), [200, 409]);
  } finally {
    await stopWeb?.();
    await database?.end();
    await admin`DROP DATABASE ${admin(name)}`;
    await admin.end();
  }
});
