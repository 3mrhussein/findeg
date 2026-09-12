const { defineConfig } = require('cypress');
const { createRequire } = require('node:module');
const { randomUUID } = require('node:crypto');
const postgres = createRequire(require.resolve('../../db/package.json'))('postgres');

module.exports = defineConfig({
  video: false,
  allowCypressEnv: false,
  viewportWidth: 1100,
  viewportHeight: 900,
  e2e: {
    supportFile: false,
    specPattern: 'cypress/e2e/*.cy.js',
    setupNodeEvents(on) {
      async function fixture(operation) {
        const url = process.env.CHECKOUT_JOURNEY_DATABASE_URL;
        if (!url || !new URL(url).pathname.startsWith('/findeg_checkout_')) {
          throw new Error('Checkout journeys require an isolated checkout test database');
        }
        const sql = postgres(url, { max: 1 });
        try {
          return await operation(sql);
        } finally {
          await sql.end();
        }
      }
      let workerFixture;
      async function stopWorkerFixture() {
        if (!workerFixture) return;
        await workerFixture.worker.close();
        await workerFixture.sql.end();
        await workerFixture.admin`DROP DATABASE ${workerFixture.admin(workerFixture.name)}`;
        await workerFixture.admin.end();
        workerFixture = undefined;
      }
      on('after:run', stopWorkerFixture);
      on('task', {
        operatorFixture() {
          return fixture(async (sql) => {
            const bcrypt = createRequire(require.resolve('../../db/package.json'))('bcryptjs');
            const email = randomUUID() + '@example.test';
            const password = 'journey-password-123';
            const [user] =
              await sql`INSERT INTO identity.users(email, email_verified) VALUES (${email}, now()) RETURNING id`;
            await sql`INSERT INTO identity.password_credentials(user_id, password_hash) VALUES (${user.id}, ${await bcrypt.hash(password, 4)})`;
            await sql`INSERT INTO identity.staff_role_grants(user_id, role) VALUES (${user.id}, 'finance-manager')`;
            const [partner] =
              await sql`INSERT INTO identity.business_partners(code, name_en, name_ar, status) VALUES (${randomUUID()}, 'Journey Partner', 'شريك التجربة', 'active') RETURNING id`;
            const [other] =
              await sql`INSERT INTO identity.business_partners(code, name_en, name_ar, status) VALUES (${randomUUID()}, 'Other Partner', 'شريك آخر', 'active') RETURNING id`;
            const [invitation] =
              await sql`INSERT INTO identity.partner_invitations(business_partner_id, email, roles, token_digest, inviter_id, expires_at, status) VALUES (${partner.id}, ${email}, ARRAY['report-viewer'], ${randomUUID()}, ${user.id}, now() + interval '1 day', 'accepted') RETURNING id`;
            await sql`INSERT INTO identity.partner_memberships(business_partner_id, user_id, invitation_id, roles) VALUES (${partner.id}, ${user.id}, ${invitation.id}, ARRAY['report-viewer'])`;
            return { email, password, partnerId: partner.id, otherPartnerId: other.id };
          });
        },
        async failedWorkerFixture() {
          await stopWorkerFixture();
          const source = process.env.CHECKOUT_JOURNEY_DATABASE_URL;
          if (!source || !new URL(source).pathname.startsWith('/findeg_checkout_'))
            throw new Error('Isolated journey database required');
          const { runMigrations } = await import('../../db/dist/runtime/migrations.js');
          const { startWorker } = await import('../../runtime/dist/worker.js');
          const { createServer } = require('node:net');
          const { once } = require('node:events');
          const adminUrl = new URL(source);
          adminUrl.pathname = '/postgres';
          const admin = postgres(adminUrl.toString(), { max: 1 });
          const name = 'findeg_checkout_worker_' + randomUUID().replaceAll('-', '');
          await admin`CREATE DATABASE ${admin(name)}`;
          const url = new URL(source);
          url.pathname = '/' + name;
          const sql = postgres(url.toString(), { max: 1 });
          await runMigrations({ url: url.toString(), ssl: false });
          const listener = createServer();
          listener.listen(0, '127.0.0.1');
          await once(listener, 'listening');
          const port = listener.address().port;
          await new Promise((resolve) => listener.close(resolve));
          await sql`INSERT INTO system.checkout_outbox(id, kind, payload) VALUES ('operator-journey', 'order-accepted', '{"reference":"journey","email":"journey@example.test"}')`;
          const environment = {
            NODE_ENV: 'test',
            RELEASE_REVISION: 'a'.repeat(40),
            DATABASE_URL: url.toString(),
            WORKER_PORT: String(port),
            OUTBOX_MAX_ATTEMPTS: '1',
            OUTBOX_POLL_MS: '10',
          };
          const worker = await startWorker(environment, {
            async deliver() {
              throw new Error('provider unavailable');
            },
          });
          workerFixture = { admin, name, sql, worker, environment, receipts: [] };
          return { base: `http://127.0.0.1:${port}` };
        },
        async recoverWorker() {
          const f = workerFixture;
          await f.worker.close();
          // Rehearse the documented investigated retry; preserve the delivery ID.
          await f.sql`UPDATE system.checkout_outbox SET status = 'pending', attempts = 0, next_attempt_at = now(), lease_token = NULL, lease_until = NULL WHERE id = 'operator-journey' AND status = 'exhausted'`;
          const { startWorker } = await import('../../runtime/dist/worker.js');
          f.worker = await startWorker(f.environment, {
            async deliver(message) {
              f.receipts.push(message.id);
            },
          });
          return null;
        },
        workerReceipts() {
          return workerFixture.receipts;
        },
        checkoutFixture() {
          return fixture(async (sql) => {
            const sku = randomUUID();
            const [product] =
              await sql`INSERT INTO catalog.products(localized_name, localized_description, localized_long_description) VALUES ('{"en":"Journey notebook","ar":"دفتر تجربة"}', '{}', '{}') RETURNING id`;
            const [variant] =
              await sql`INSERT INTO catalog.product_variants(product_id, sku, variant_key, localized_label, base_price) VALUES (${product.id}, ${sku}, ${sku}, '{"en":"Blue","ar":"أزرق"}', '12.50') RETURNING id`;
            const [warehouse] =
              await sql`INSERT INTO inventory.warehouses(code, name) VALUES (${sku}, 'Journey') RETURNING id`;
            await sql`INSERT INTO inventory.inventory_balances(variant_id, warehouse_id, on_hand) VALUES (${variant.id}, ${warehouse.id}, 5)`;
            const [zone] =
              await sql`SELECT id FROM sales.delivery_zones WHERE is_active = true ORDER BY id LIMIT 1`;
            return { variantId: variant.id, sku, zoneId: zone.id };
          });
        },
        listFixture() {
          return fixture(async (sql) => {
            const code = randomUUID().replaceAll('-', '');
            const [user] =
              await sql`INSERT INTO identity.users(email) VALUES (${code + '@example.test'}) RETURNING id`;
            const [partner] =
              await sql`INSERT INTO identity.business_partners(code, name_en, name_ar, status) VALUES (${code}, 'Journey School', 'مدرسة التجربة', 'active') RETURNING id`;
            const [category] =
              await sql`INSERT INTO catalog.categories(slug) VALUES (${code}) RETURNING id`;
            const [brand] =
              await sql`INSERT INTO catalog.brands(slug, localized_name) VALUES (${code}, '{"en":"School Brand","ar":"علامة المدرسة"}') RETURNING id`;
            const [product] =
              await sql`INSERT INTO catalog.products(localized_name, localized_description, localized_long_description, category_id, brand_id) VALUES ('{"en":"List notebook","ar":"دفتر القائمة"}', '{}', '{}', ${category.id}, ${brand.id}) RETURNING id`;
            const [variant] =
              await sql`INSERT INTO catalog.product_variants(product_id, sku, variant_key, localized_label, base_price, is_default) VALUES (${product.id}, ${code}, 'default', '{"en":"Blue","ar":"أزرق"}', '12.50', true) RETURNING id`;
            const [alternateBrand] =
              await sql`INSERT INTO catalog.brands(slug, localized_name) VALUES (${code + '-alt'}, '{"en":"Alternative Brand","ar":"علامة البديل"}') RETURNING id`;
            const [alternateProduct] =
              await sql`INSERT INTO catalog.products(localized_name, localized_description, localized_long_description, category_id, brand_id) VALUES ('{"en":"Alternative notebook","ar":"دفتر بديل"}', '{}', '{}', ${category.id}, ${alternateBrand.id}) RETURNING id`;
            const [alternative] =
              await sql`INSERT INTO catalog.product_variants(product_id, sku, variant_key, localized_label, base_price, is_default) VALUES (${alternateProduct.id}, ${code + '-alt'}, 'default', '{"en":"Red","ar":"أحمر"}', '10.00', true) RETURNING id`;
            const [color] =
              await sql`INSERT INTO catalog.attributes(key, data_type, localized_label) VALUES (${code + '-color'}, 'text', '{"en":"Color","ar":"لون"}') RETURNING id`;
            await sql`INSERT INTO catalog.variant_attributes(variant_id, attribute_id, value_text) VALUES (${variant.id}, ${color.id}, 'blue'), (${alternative.id}, ${color.id}, 'red')`;
            const [warehouse] =
              await sql`INSERT INTO inventory.warehouses(code, name) VALUES (${code}, 'Journey') RETURNING id`;
            await sql`INSERT INTO inventory.inventory_balances(variant_id, warehouse_id, on_hand) VALUES (${variant.id}, ${warehouse.id}, 50), (${alternative.id}, ${warehouse.id}, 50)`;
            const [list] =
              await sql`INSERT INTO school_engine.school_supply_lists(business_partner_id, created_by, academic_year, school_name, grade, title_en, title_ar) VALUES (${partner.id}, ${user.id}, '2026', 'Journey School', '4', 'School list', 'قائمة المدرسة') RETURNING id`;
            const specification = sql.json({ categoryId: category.id, attributes: {} });
            const [required] =
              await sql`INSERT INTO school_engine.school_supply_list_items(list_id, variant_id, quantity, label_en, label_ar, specification) VALUES (${list.id}, ${variant.id}, 2, 'Required notebook', 'دفتر مطلوب', ${specification}) RETURNING id`;
            await sql`INSERT INTO school_engine.school_supply_list_items(list_id, variant_id, quantity, label_en, label_ar, required, specification) VALUES (${list.id}, ${alternative.id}, 1, 'Optional notebook', 'دفتر اختياري', false, ${specification})`;
            await sql`UPDATE school_engine.school_supply_lists SET status = 'published', public_code = ${code} WHERE id = ${list.id}`;
            await sql`INSERT INTO sales.list_offers(list_id, basis_points) VALUES (${list.id}, 2000)`;
            const [zone] =
              await sql`SELECT id FROM sales.delivery_zones WHERE is_active = true ORDER BY id LIMIT 1`;
            return {
              code,
              listId: list.id,
              itemId: required.id,
              alternativeId: alternative.id,
              sku: code,
              variantId: variant.id,
              zoneId: zone.id,
            };
          });
        },
        staleListDefaults({ variantId, alternativeId }) {
          return fixture(async (sql) => {
            const [source] =
              await sql`SELECT product_id FROM catalog.product_variants WHERE id = ${variantId}`;
            const sku = randomUUID();
            const [recovery] =
              await sql`INSERT INTO catalog.product_variants(product_id, sku, variant_key, base_price) VALUES (${source.product_id}, ${sku}, ${sku}, '9.00') RETURNING id`;
            await sql`UPDATE catalog.product_variants SET is_active = false WHERE id IN (${variantId}, ${alternativeId})`;
            return recovery.id;
          });
        },
        archiveList(listId) {
          return fixture(async (sql) => {
            await sql`UPDATE school_engine.school_supply_lists SET status = 'archived' WHERE id = ${listId}`;
            return null;
          });
        },
        // Observe the notification at the external delivery boundary; #59 owns actual delivery.
        guestCode(reference) {
          return fixture(async (sql) => {
            const [message] =
              await sql`SELECT payload FROM system.checkout_outbox WHERE kind = 'guest-order-code' AND payload->>'reference' = ${reference}`;
            if (!message) throw new Error('Guest verification notification was not committed');
            return message.payload.code;
          });
        },
      });
    },
  },
});
