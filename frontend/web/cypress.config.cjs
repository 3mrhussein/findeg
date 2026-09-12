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
      on('task', {
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
