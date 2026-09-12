import { test } from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { launchWeb } from './support/web-process.mjs';
import { randomUUID } from 'node:crypto';
import { runMigrations } from '../db/dist/runtime/migrations.js';
import { createWebRuntime } from '../runtime/dist/index.js';

const postgres = createRequire(new URL('../db/package.json', import.meta.url))('postgres');

test('Guest Cart and checkout persist ordinary commerce facts atomically', async (t) => {
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_checkout_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  let database;
  let runtime;
  let stopWeb;
  await admin`CREATE DATABASE ${admin(name)}`;
  try {
    await runMigrations({ url: url.toString(), ssl: false });
    database = postgres(url.toString(), { max: 1 });
    const [product] =
      await database`INSERT INTO catalog.products(localized_name, localized_description, localized_long_description) VALUES ('{"en":"Pen","ar":"قلم"}', '{}', '{}') RETURNING id`;
    const [variant] =
      await database`INSERT INTO catalog.product_variants(product_id, sku, variant_key, localized_label, base_price) VALUES (${product.id}, 'PEN-BLUE', 'blue', '{"en":"Blue","ar":"أزرق"}', '0.10') RETURNING id`;
    const [warehouse] =
      await database`INSERT INTO inventory.warehouses(code, name) VALUES ('MAIN', 'Main') RETURNING id`;
    await database`INSERT INTO inventory.inventory_balances(variant_id, warehouse_id, on_hand) VALUES (${variant.id}, ${warehouse.id}, 3)`;
    const [zone] =
      await database`INSERT INTO sales.delivery_zones(name, fee) VALUES ('{"en":"Cairo","ar":"القاهرة"}', '20.00') RETURNING id`;
    const web = await launchWeb(t, {
      RELEASE_REVISION: 'a'.repeat(40),
      DATABASE_URL: url.toString(),
    });
    stopWeb = web.stop;
    await t.test('HTTP Cart replaces an invalid guest cookie and preserves the Cart', async () => {
      const response = await fetch(`${web.base}/api/v1/commerce/cart`, {
        method: 'PUT',
        headers: {
          origin: web.base,
          cookie: 'findeg_guest_cart=invalid',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ items: [{ variantId: variant.id, quantity: 1 }] }),
      });
      assert.equal(response.status, 200);
      const cookie = response.headers.get('set-cookie');
      assert.ok(cookie, 'An invalid guest cookie must be replaced');
      const read = await fetch(`${web.base}/api/v1/commerce/cart`, {
        headers: { cookie: cookie.split(';')[0] },
      });
      assert.equal((await read.json()).quote.items[0].quantity, 1);
    });
    await t.test(
      'both Storefront languages expose Cart, checkout and Guest Order Access',
      async () => {
        for (const [locale, cart, checkout, access] of [
          ['en', 'Your Cart', 'Cash on Delivery', 'Guest Order Access'],
          ['ar', 'سلة التسوق', 'الدفع عند الاستلام', 'الوصول إلى طلب الضيف'],
        ]) {
          const html = await (await fetch(`${web.base}/${locale}`)).text();
          assert.ok(html.includes(cart), `${locale} Cart controls`);
          assert.ok(html.includes(checkout), `${locale} checkout form`);
          assert.ok(html.includes(access), `${locale} Guest Order Access form`);
        }
      },
    );
    runtime = createWebRuntime({ RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() });
    const guest = 'a'.repeat(64);
    const cart = { items: [{ variantId: variant.id, quantity: 3 }] };
    assert.equal((await runtime.commerce.replaceCart(guest, cart)).status, 'quoted');
    const quote = await runtime.commerce.quoteCheckout(guest, zone.id);
    assert.equal(quote.total, '20.30');
    const checkout = {
      key: 'checkout-request-0001',
      confirmation: quote.confirmation,
      address: {
        name: 'Customer',
        email: 'customer@example.test',
        phone: '01012345678',
        street: '10 Test Street',
        city: 'Cairo',
        zoneId: zone.id,
      },
      paymentMethod: 'cash-on-delivery',
      deliveryMethod: 'home-delivery',
    };
    const accepted = await runtime.commerce.acceptCheckout(guest, checkout);
    assert.equal(accepted.status, 'accepted');
    const [accessMessage] =
      await database`SELECT payload FROM system.checkout_outbox WHERE kind = 'guest-order-code'`;
    assert.equal(
      (
        await runtime.commerce.verifyGuestOrder(
          accepted.accessReference,
          accessMessage.payload.code,
        )
      ).status,
      'verified',
    );
    assert.equal(
      (
        await runtime.commerce.verifyGuestOrder(
          accepted.accessReference,
          accessMessage.payload.code,
        )
      ).status,
      'not-found',
    );
    assert.deepEqual(await runtime.commerce.acceptCheckout(guest, checkout), accepted);
    assert.equal(
      (
        await runtime.commerce.acceptCheckout(guest, {
          ...checkout,
          address: { ...checkout.address, street: 'changed' },
        })
      ).status,
      'idempotency-conflict',
    );
    assert.equal((await runtime.commerce.readCart(guest)).quote.items.length, 0);
    const [balance] =
      await database`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${variant.id}`;
    assert.equal(balance.reserved, 3);
    const [outbox] = await database`SELECT count(*)::int AS count FROM system.checkout_outbox`;
    assert.equal(outbox.count, 2);

    async function stockedVariant(stock = 1) {
      const sku = randomUUID();
      const [row] =
        await database`INSERT INTO catalog.product_variants(product_id, sku, variant_key, localized_label, base_price) VALUES (${product.id}, ${sku}, ${sku}, '{"en":"Blue","ar":"أزرق"}', '0.10') RETURNING id`;
      await database`INSERT INTO inventory.inventory_balances(variant_id, warehouse_id, on_hand) VALUES (${row.id}, ${warehouse.id}, ${stock})`;
      return row.id;
    }
    async function prepare(owner, items) {
      assert.equal((await runtime.commerce.replaceCart(owner, { items })).status, 'quoted');
      const quote = await runtime.commerce.quoteCheckout(owner, zone.id);
      assert.equal(quote.status, 'quoted');
      return { ...checkout, key: randomUUID(), confirmation: quote.confirmation };
    }

    await t.test(
      'two buyers cannot both reserve the final unit across runtime instances',
      async () => {
        const id = await stockedVariant();
        const firstOwner = 'b'.repeat(64);
        const secondOwner = 'c'.repeat(64);
        const first = await prepare(firstOwner, [{ variantId: id, quantity: 1 }]);
        const second = await prepare(secondOwner, [{ variantId: id, quantity: 1 }]);
        const other = createWebRuntime({
          RELEASE_REVISION: 'a'.repeat(40),
          DATABASE_URL: url.toString(),
        });
        try {
          const results = await Promise.all([
            runtime.commerce.acceptCheckout(firstOwner, first),
            other.commerce.acceptCheckout(secondOwner, second),
          ]);
          assert.deepEqual(results.map((result) => result.status).sort(), [
            'accepted',
            'insufficient-stock',
          ]);
          const [reserved] =
            await database`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${id}`;
          assert.equal(reserved.reserved, 1);
        } finally {
          await other.close();
        }
      },
    );

    await t.test(
      'simultaneous retries across runtime instances replay one Order and one reservation',
      async () => {
        const id = await stockedVariant(2);
        const owner = 'd'.repeat(64);
        const input = await prepare(owner, [{ variantId: id, quantity: 1 }]);
        const other = createWebRuntime({
          RELEASE_REVISION: 'a'.repeat(40),
          DATABASE_URL: url.toString(),
        });
        try {
          const results = await Promise.all([
            runtime.commerce.acceptCheckout(owner, input),
            other.commerce.acceptCheckout(owner, input),
          ]);
          assert.equal(results[0].status, 'accepted');
          assert.deepEqual(results[0], results[1]);
          const [reserved] =
            await database`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${id}`;
          assert.equal(reserved.reserved, 1);
          const [messages] =
            await database`SELECT count(*)::int AS count FROM system.checkout_outbox WHERE payload->>'reference' IN (${results[0].reference}, ${results[0].accessReference})`;
          assert.equal(messages.count, 2);
        } finally {
          await other.close();
        }
      },
    );

    await t.test(
      'changed prices require reconfirmation and accepted prices remain immutable',
      async () => {
        const id = await stockedVariant(2);
        const owner = 'e'.repeat(64);
        const input = await prepare(owner, [{ variantId: id, quantity: 1 }]);
        await database`UPDATE catalog.product_variants SET base_price = '0.20' WHERE id = ${id}`;
        assert.equal(
          (await runtime.commerce.acceptCheckout(owner, input)).status,
          'reconfirmation-required',
        );
        const current = await runtime.commerce.quoteCheckout(owner, zone.id);
        assert.equal(current.total, '20.20');
        const accepted = await runtime.commerce.acceptCheckout(owner, {
          ...input,
          confirmation: current.confirmation,
        });
        assert.equal(accepted.status, 'accepted');
        await database`UPDATE catalog.product_variants SET base_price = '0.30' WHERE id = ${id}`;
        const [message] =
          await database`SELECT payload FROM system.checkout_outbox WHERE payload->>'reference' = ${accepted.accessReference}`;
        const verified = await runtime.commerce.verifyGuestOrder(
          accepted.accessReference,
          message.payload.code,
        );
        assert.equal(verified.order.items[0].unitPrice, '0.20');
        assert.equal(verified.order.total, '20.20');
        await assert.rejects(
          database`UPDATE sales.accepted_orders SET snapshot = '{}' WHERE reference = ${accepted.reference}`,
          /immutable/,
        );
      },
    );

    await t.test(
      'a technical failure after reservation rolls back every required fact and permits retry',
      async () => {
        const id = await stockedVariant();
        const owner = 'f'.repeat(64);
        const input = await prepare(owner, [{ variantId: id, quantity: 1 }]);
        const [before] = await database`SELECT count(*)::int AS count FROM sales.accepted_orders`;
        await database`CREATE FUNCTION system.checkout_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'simulated outbox failure'; END; $$`;
        await database`CREATE TRIGGER checkout_test_failure BEFORE INSERT ON system.checkout_outbox FOR EACH ROW EXECUTE FUNCTION system.checkout_test_failure()`;
        try {
          await assert.rejects(runtime.commerce.acceptCheckout(owner, input));
          const [after] = await database`SELECT count(*)::int AS count FROM sales.accepted_orders`;
          assert.equal(after.count, before.count);
          const [balance] =
            await database`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${id}`;
          assert.equal(balance.reserved, 0);
          const [facts] =
            await database`SELECT (SELECT count(*) FROM sales.checkout_outcomes WHERE owner_digest = ${owner}) + (SELECT count(*) FROM inventory.order_reservations WHERE variant_id = ${id}) + (SELECT count(*) FROM inventory.stock_movements WHERE variant_id = ${id}) AS count`;
          assert.equal(Number(facts.count), 0);
          assert.equal((await runtime.commerce.readCart(owner)).quote.items[0].quantity, 1);
        } finally {
          await database`DROP TRIGGER checkout_test_failure ON system.checkout_outbox`;
          await database`DROP FUNCTION system.checkout_test_failure()`;
        }
        assert.equal((await runtime.commerce.acceptCheckout(owner, input)).status, 'accepted');
      },
    );

    await t.test(
      'stock rejection after a partial reservation rolls back the Order and all reservations',
      async () => {
        const first = await stockedVariant();
        const last = await stockedVariant();
        const owner = '1'.repeat(64);
        const input = await prepare(owner, [
          { variantId: first, quantity: 1 },
          { variantId: last, quantity: 1 },
        ]);
        const [before] = await database`SELECT count(*)::int AS count FROM sales.accepted_orders`;
        // Force stock to change after the authoritative quote but before reservation.
        await database.unsafe(
          `CREATE FUNCTION inventory.checkout_test_stock_loss() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE inventory.inventory_balances SET on_hand = 0 WHERE variant_id = ${last}; RETURN NEW; END; $$`,
        );
        await database`CREATE TRIGGER checkout_test_stock_loss AFTER INSERT ON sales.accepted_orders FOR EACH ROW EXECUTE FUNCTION inventory.checkout_test_stock_loss()`;
        try {
          assert.equal(
            (await runtime.commerce.acceptCheckout(owner, input)).status,
            'insufficient-stock',
          );
          const [after] = await database`SELECT count(*)::int AS count FROM sales.accepted_orders`;
          assert.equal(after.count, before.count);
          const rows =
            await database`SELECT on_hand, reserved FROM inventory.inventory_balances WHERE variant_id IN (${first}, ${last}) ORDER BY variant_id`;
          assert.deepEqual(
            rows.map(({ on_hand, reserved }) => ({ on_hand, reserved })),
            [
              { on_hand: 1, reserved: 0 },
              { on_hand: 1, reserved: 0 },
            ],
          );
          const [facts] =
            await database`SELECT (SELECT count(*) FROM sales.checkout_outcomes WHERE owner_digest = ${owner}) + (SELECT count(*) FROM inventory.order_reservations WHERE variant_id IN (${first}, ${last})) + (SELECT count(*) FROM inventory.stock_movements WHERE variant_id IN (${first}, ${last})) AS count`;
          assert.equal(Number(facts.count), 0);
          assert.equal((await runtime.commerce.readCart(owner)).quote.items.length, 2);
        } finally {
          await database`DROP TRIGGER checkout_test_stock_loss ON sales.accepted_orders`;
          await database`DROP FUNCTION inventory.checkout_test_stock_loss()`;
        }
        assert.equal((await runtime.commerce.acceptCheckout(owner, input)).status, 'accepted');
      },
    );

    await t.test('Customers complete the bilingual browser checkout journeys', async () => {
      try {
        await exec(
          process.execPath,
          [
            'frontend/web/node_modules/cypress/bin/cypress',
            'run',
            '--project',
            'frontend/web',
            '--config',
            `baseUrl=${web.base}`,
          ],
          {
            env: {
              ...process.env,
              ELECTRON_RUN_AS_NODE: undefined,
              CHECKOUT_JOURNEY_DATABASE_URL: url.toString(),
            },
            timeout: 120000,
            maxBuffer: 2 * 1024 * 1024,
          },
        );
      } catch (error) {
        throw new Error(
          `Checkout browser journey failed:\n${error.stdout ?? ''}\n${error.stderr ?? ''}`,
          { cause: error },
        );
      }
    });
  } finally {
    await stopWeb?.();
    await runtime?.close();
    await database?.end();
    await admin`DROP DATABASE ${admin(name)}`;
    await admin.end();
  }
});
