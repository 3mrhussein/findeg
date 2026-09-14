const { createRequire } = require('node:module');
const { randomUUID } = require('node:crypto');
const postgres = createRequire(require.resolve('../../db/package.json'))('postgres');

module.exports = function registerOperatorJourneys(on, fixture) {
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
        await sql`INSERT INTO identity.staff_role_grants(user_id, role) VALUES (${user.id}, 'finance-manager'), (${user.id}, 'fulfillment-operator')`;
        const [partner] =
          await sql`INSERT INTO identity.business_partners(code, name_en, name_ar, status) VALUES (${randomUUID()}, 'Journey Partner', 'شريك التجربة', 'active') RETURNING id`;
        const [other] =
          await sql`INSERT INTO identity.business_partners(code, name_en, name_ar, status) VALUES (${randomUUID()}, 'Other Partner', 'شريك آخر', 'active') RETURNING id`;
        const [invitation] =
          await sql`INSERT INTO identity.partner_invitations(business_partner_id, email, roles, token_digest, inviter_id, expires_at, status) VALUES (${partner.id}, ${email}, ARRAY['report-viewer'], ${randomUUID()}, ${user.id}, now() + interval '1 day', 'accepted') RETURNING id`;
        await sql`INSERT INTO identity.partner_memberships(business_partner_id, user_id, invitation_id, roles) VALUES (${partner.id}, ${user.id}, ${invitation.id}, ARRAY['report-viewer'])`;
        const reference = randomUUID();
        const [rate] =
          await sql`INSERT INTO identity.partner_reward_rates(business_partner_id, points_per_egp, egp_per_point, actor_id, request_key) VALUES (${partner.id}, '1.000000', '0.0100', ${user.id}, ${randomUUID()}) RETURNING id`;
        await sql`INSERT INTO sales.accepted_orders(reference, snapshot) VALUES (${reference}, ${sql.json({ items: [{ variantId: 1, attribution: { listId: 1, listItemId: 1 } }] })})`;
        const [entitlement] =
          await sql`INSERT INTO identity.partner_reward_entitlements(business_partner_id, order_reference, line_index, rate_id, eligible_subtotal, points, reward_value) VALUES (${partner.id}, ${reference}, 0, ${rate.id}, '12.50', 12, '0.12') RETURNING id`;
        await sql`INSERT INTO identity.partner_reward_events(entitlement_id, business_partner_id, order_reference, event_type, points, pending_points, conversion_rate) VALUES (${entitlement.id}, ${partner.id}, ${reference}, 'accepted', 12, 12, '0.0100')`;
        await sql`INSERT INTO sales.order_lifecycle_events(order_reference, event_type, actor_id, amount) VALUES (${reference}, 'paid', ${user.id}, '12.50')`;
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
  });
};
