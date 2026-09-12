import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { runMigrations } from '../db/dist/runtime/migrations.js';
import { createWebRuntime } from '../runtime/dist/index.js';

const postgres = createRequire(new URL('../db/package.json', import.meta.url))('postgres');

test('Guest Cart and checkout persist ordinary commerce facts atomically', async () => {
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_checkout_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  let database;
  let runtime;
  await admin`CREATE DATABASE ${admin(name)}`;
  try {
    await runMigrations({ url: url.toString(), ssl: false });
    database = postgres(url.toString(), { max: 1 });
    const [product] = await database`INSERT INTO catalog.products(localized_name, localized_description, localized_long_description) VALUES ('{"en":"Pen","ar":"قلم"}', '{}', '{}') RETURNING id`;
    const [variant] = await database`INSERT INTO catalog.product_variants(product_id, sku, variant_key, localized_label, base_price) VALUES (${product.id}, 'PEN-BLUE', 'blue', '{"en":"Blue","ar":"أزرق"}', '0.10') RETURNING id`;
    const [warehouse] = await database`INSERT INTO inventory.warehouses(code, name) VALUES ('MAIN', 'Main') RETURNING id`;
    await database`INSERT INTO inventory.inventory_balances(variant_id, warehouse_id, on_hand) VALUES (${variant.id}, ${warehouse.id}, 3)`;
    const [zone] = await database`INSERT INTO sales.delivery_zones(name, fee) VALUES ('{"en":"Cairo","ar":"القاهرة"}', '20.00') RETURNING id`;
    runtime = createWebRuntime({ RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() });
    const guest = 'a'.repeat(64);
    const cart = { items: [{ variantId: variant.id, quantity: 3 }] };
    assert.equal((await runtime.commerce.replaceCart(guest, cart)).status, 'quoted');
    const quote = await runtime.commerce.quoteCheckout(guest, zone.id);
    assert.equal(quote.total, '20.30');
    const checkout = {
      key: 'checkout-request-0001',
      confirmation: quote.confirmation,
      address: { name: 'Customer', email: 'customer@example.test', phone: '01012345678', street: '10 Test Street', city: 'Cairo', zoneId: zone.id },
      paymentMethod: 'cash-on-delivery',
      deliveryMethod: 'home-delivery',
    };
    const accepted = await runtime.commerce.acceptCheckout(guest, checkout);
    assert.equal(accepted.status, 'accepted');
    const [accessMessage] = await database`SELECT payload FROM system.checkout_outbox WHERE kind = 'guest-order-code'`;
    assert.equal((await runtime.commerce.verifyGuestOrder(accepted.accessReference, accessMessage.payload.code)).status, 'verified');
    assert.equal((await runtime.commerce.verifyGuestOrder(accepted.accessReference, accessMessage.payload.code)).status, 'not-found');
    assert.deepEqual(await runtime.commerce.acceptCheckout(guest, checkout), accepted);
    assert.equal((await runtime.commerce.acceptCheckout(guest, { ...checkout, address: { ...checkout.address, street: 'changed' } })).status, 'idempotency-conflict');
    assert.equal((await runtime.commerce.readCart(guest)).quote.items.length, 0);
    const [balance] = await database`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${variant.id}`;
    assert.equal(balance.reserved, 3);
    const [outbox] = await database`SELECT count(*)::int AS count FROM system.checkout_outbox`;
    assert.equal(outbox.count, 2);
  } finally {
    await runtime?.close();
    await database?.end();
    await admin`DROP DATABASE ${admin(name)}`;
    await admin.end();
  }
});
