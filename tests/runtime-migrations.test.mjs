import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { schemaOwnership, validateSchemaOwnership } from '../db/dist/runtime/schema.js';
import { createTransactionRuntime } from '../runtime/dist/transactions.js';

const postgres = createRequire(new URL('../db/package.json', import.meta.url))('postgres');
const { sql } = createRequire(new URL('../db/package.json', import.meta.url))('drizzle-orm');
const exec = promisify(execFile);
const entry = fileURLToPath(new URL('../runtime/dist/migrate-main.js', import.meta.url));

test(
  'the migration executable applies one ordered history and can be rerun from any directory',
  { timeout: 30000 },
  async () => {
    assert.ok(
      process.env.MIGRATION_TEST_DATABASE_URL,
      'MIGRATION_TEST_DATABASE_URL must explicitly select a test PostgreSQL server',
    );
    const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
    const admin = postgres(url.toString(), { max: 1 });
    const name = `findeg_runtime_${randomUUID().replaceAll('-', '')}`;
    let created = false;
    let database;
    try {
      await admin`CREATE DATABASE ${admin(name)}`;
      created = true;
      url.pathname = `/${name}`;
      const environment = {
        PATH: process.env.PATH,
        RELEASE_REVISION: 'a'.repeat(40),
        DATABASE_URL: url.toString(),
        DB_SSL: 'false',
      };
      for (let attempt = 0; attempt < 2; attempt++) {
        await exec(process.execPath, [entry], { cwd: tmpdir(), env: environment, timeout: 10000 });
      }
      database = postgres(url.toString(), { max: 1 });
      const [history] =
        await database`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`;
      assert.equal(history.count, 13);
      const views =
        await database`SELECT table_name,is_updatable FROM information_schema.views WHERE table_schema='identity' AND table_name LIKE 'partner_report_%'`;
      assert.equal(views.length, 2);
      assert.ok(views.every((view) => view.is_updatable === 'NO'));
      assert.equal(schemaOwnership['identity.partner_reward_rates'], 'partner-rewards');
      assert.equal(schemaOwnership['identity.partner_reward_entitlements'], 'partner-rewards');
      const [column] =
        await database`SELECT column_default FROM information_schema.columns WHERE table_schema = 'identity' AND table_name = 'users' AND column_name = 'authorization_version'`;
      assert.equal(column.column_default, '1');
      const records = await database`SELECT table_schema || '.' || table_name AS name
        FROM information_schema.tables WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema', 'drizzle')`;
      assert.deepEqual(records.map(({ name }) => name).sort(), Object.keys(schemaOwnership).sort());
      assert.equal(schemaOwnership['identity.organizations'], 'partner-management');
      assert.equal(schemaOwnership['identity.organization_memberships'], 'partner-management');
      assert.equal(schemaOwnership['identity.payment_methods'], 'commerce');
      assert.equal(schemaOwnership['school_engine.cart_kits'], 'commerce');
      assert.equal(schemaOwnership['catalog.reviews'], 'catalog');
    } finally {
      await database?.end();
      if (created) await admin`DROP DATABASE ${admin(name)}`;
      await admin.end();
    }
  },
);

for (const result of ['commit', 'reject', 'throw']) {
  test(`participating adapters ${result} together through the application transaction contract`, async () => {
    const url = process.env.MIGRATION_TEST_DATABASE_URL;
    assert.ok(url);
    const database = postgres(url, { max: 1 });
    const table = `transaction_probe_${randomUUID().replaceAll('-', '')}`;
    const runtime = createTransactionRuntime({ url, ssl: false, max: 2 }, (connection) => ({
      commerce: {
        record: (id) =>
          connection.execute(
            sql`INSERT INTO ${sql.identifier(table)} (id, owner) VALUES (${id}, 'commerce')`,
          ),
      },
      inventory: {
        record: (id) =>
          connection.execute(
            sql`INSERT INTO ${sql.identifier(table)} (id, owner) VALUES (${id}, 'inventory')`,
          ),
      },
    }));
    try {
      await database`CREATE TABLE ${database(table)} (id text PRIMARY KEY, owner text NOT NULL)`;
      const operation = runtime.transactions.run(async ({ commerce, inventory }) => {
        await commerce.record('order');
        await inventory.record('reservation');
        if (result === 'reject') return { ok: false, error: { code: 'insufficient-stock' } };
        if (result === 'throw') throw new Error('technical failure');
        return { ok: true, value: 'accepted' };
      });
      if (result === 'throw') await assert.rejects(operation, /technical failure/);
      else
        assert.deepEqual(
          await operation,
          result === 'commit'
            ? { ok: true, value: 'accepted' }
            : { ok: false, error: { code: 'insufficient-stock' } },
        );
      const records = await database`SELECT id FROM ${database(table)} ORDER BY id`;
      assert.deepEqual(
        records.map(({ id }) => id),
        result === 'commit' ? ['order', 'reservation'] : [],
      );
    } finally {
      await runtime.close();
      await database`DROP TABLE IF EXISTS ${database(table)}`;
      await database.end();
    }
  });
}

test('schema assembly rejects duplicate and missing record owners', () => {
  assert.throws(
    () =>
      validateSchemaOwnership(['catalog.products'], {
        catalog: ['catalog.products'],
        commerce: ['catalog.products'],
      }),
    /multiple owners.*catalog.products/,
  );
  assert.throws(
    () => validateSchemaOwnership(['catalog.products'], { catalog: [] }),
    /unowned.*catalog.products/,
  );
  assert.throws(
    () => validateSchemaOwnership([], { catalog: ['catalog.products'] }),
    /unknown.*catalog.products/,
  );
});
