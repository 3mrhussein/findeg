// PROTOTYPE, wipe me: first storage gate only. No production behavior is selected.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const dbRequire = createRequire(new URL('../package.json', import.meta.url));
const postgres = dbRequire('postgres');
const { drizzle } = dbRequire('drizzle-orm/postgres-js');
const { sql: drizzleSql } = dbRequire('drizzle-orm');
const tsx = dbRequire.resolve('tsx/cli');
const directory = fileURLToPath(new URL('.', import.meta.url));
const dbDirectory = fileURLToPath(new URL('../', import.meta.url));
const scratch = new URL('.scratch/', import.meta.url);
const data = new URL('PROTOTYPE-wipe-me/', scratch);
const run = promisify(execFile);
const checks = [];
const clients = [];
let engine;
let host;
let url;
let failure;
let ownsLock = false;
const lockPath = new URL('host.lock', scratch);

function errorDetail(error) {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    constraint: error.constraint_name,
    cause: error.cause ? errorDetail(error.cause) : undefined,
  };
}

async function check(name, action, status = 'passed') {
  const started = performance.now();
  try {
    const detail = await action();
    const result = { name, status, durationMs: Math.round(performance.now() - started), detail };
    checks.push(result);
    console.log(JSON.stringify(result));
    return detail;
  } catch (error) {
    const result = {
      name,
      status: 'failed',
      durationMs: Math.round(performance.now() - started),
      error: errorDetail(error),
    };
    checks.push(result);
    console.error(JSON.stringify(result));
    throw error;
  }
}

function connect() {
  const client = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 5,
    ssl: false,
    transform: { undefined: null },
    onnotice: () => {},
  });
  clients.push(client);
  return client;
}

async function existingScript(file, flag, args = []) {
  // Explicit scratch URL before imports; do not load/copy production credentials.
  const env = { ...process.env, DATABASE_URL: url, DB_SSL: 'false', NODE_ENV: 'development' };
  delete env.DB_MIGRATING;
  delete env.DB_SEEDING;
  if (flag) env[flag] = 'true';
  const logName = file.replaceAll('/', '-');
  try {
    const result = await run(process.execPath, [tsx, file, ...args], {
      cwd: dbDirectory,
      env,
      timeout: 60_000,
      maxBuffer: 20 * 1024 * 1024,
    });
    await writeFile(new URL(`${logName}.stdout.log`, scratch), result.stdout);
    return { exitCode: 0, log: `.scratch/${logName}.stdout.log` };
  } catch (error) {
    await writeFile(new URL(`${logName}.stdout.log`, scratch), error.stdout ?? '');
    await writeFile(new URL(`${logName}.stderr.log`, scratch), error.stderr ?? '');
    throw new Error(`${file} failed (${error.code}); see .scratch/${logName}.stderr.log`, {
      cause: error,
    });
  }
}

try {
  await mkdir(scratch, { recursive: true });
  if (existsSync(new URL('host.lock', scratch))) {
    throw new Error('Stop the prototype app helper before resetting its scratch state.');
  }
  await writeFile(lockPath, String(process.pid), { flag: 'wx' });
  ownsLock = true;
  // The one disposable directory is reset on each gate run. Never use a user path.
  await rm(data, { recursive: true, force: true });
  await check('start one filesystem-backed host', async () => {
    engine = await PGlite.create({ dataDir: fileURLToPath(data), extensions: { uuid_ossp } });
    host = new PGLiteSocketServer({ db: engine, host: '127.0.0.1', port: 0, maxConnections: 32 });
    await host.start();
    url = `postgresql://postgres:postgres@${host.getServerConn()}/postgres`;
    return { pglite: '0.5.11', socket: '0.2.14', maxConnections: 32 };
  });
  const a = connect();
  const b = connect();
  await check('existing init-db.sql through postgres-js', async () => {
    await a.unsafe(await readFile(new URL('../init-db.sql', import.meta.url), 'utf8'));
    return { uuidOssp: true };
  });
  await check('all historical migrations through existing migrate.ts', async () => {
    await existingScript('migrate.ts', 'DB_MIGRATING');
    const journal = JSON.parse(
      await readFile(new URL('../migrations/meta/_journal.json', import.meta.url), 'utf8'),
    );
    const [{ count }] = await a`select count(*)::int as count from drizzle.__drizzle_migrations`;
    assert.equal(count, journal.entries.length);
    return { count };
  });
  await check('actual seed.ts and repeatable reset', async () => {
    await existingScript('seed.ts', 'DB_SEEDING');
    await existingScript('seed.ts', 'DB_SEEDING');
    const [{ users, products, variants, orders }] = await a`
      select (select count(*)::int from identity.users) as users,
        (select count(*)::int from catalog.products) as products,
        (select count(*)::int from catalog.product_variants) as variants,
        (select count(*)::int from sales.orders) as orders`;
    assert.deepEqual(
      { users, products, variants, orders },
      { users: 8, products: 229, variants: 229, orders: 1 },
    );
    return { users, products, variants, orders };
  });
  await check('exact values through current postgres-js and Drizzle', async () => {
    const query = drizzleSql`select (0.10::numeric(10,2) + 0.20::numeric(10,2)) as money,
      99999999.99::numeric(10,2) as maximum_money,
      timestamp '2026-10-24 12:34:56.123' as instant,
      '{"en":"Pen","ar":"قلم","nested":{"n":1}}'::jsonb as localized,
      array['partner-administrator','report-viewer']::text[] as roles`;
    const [row] = await drizzle(a).execute(query);
    assert.equal(row.money, '0.30');
    assert.equal(row.maximum_money, '99999999.99');
    // The installed Drizzle driver intentionally leaves raw timestamp results as strings.
    assert.equal(row.instant, '2026-10-24 12:34:56.123');
    assert.equal(row.localized.ar, 'قلم');
    assert.deepEqual(row.roles, ['partner-administrator', 'report-viewer']);
    return row;
  });
  await check('real schema values, constraints, savepoints and outer rollback', () =>
    existingScript('prototype-pglite/schema-probe.ts'),
  );
  await check('two independent clients make overlapping parameterized queries', async () => {
    for (let i = 0; i < 10; i++) {
      const [left, right] = await Promise.all([
        a`select ${i}::int as value`,
        b`select ${i + 100}::int as value`,
      ]);
      assert.equal(left[0].value, i);
      assert.equal(right[0].value, i + 100);
    }
    return { iterations: 10 };
  });
  await check('transaction-owner disconnect rolls back and releases queued client', async () => {
    const owner = await a.reserve();
    await owner`begin`;
    await owner`insert into catalog.brands (slug) values ('prototype-uncommitted-owner')`;
    let finished = false;
    const waiting =
      b`select count(*)::int as count from catalog.brands where slug = 'prototype-uncommitted-owner'`.then(
        (rows) => {
          finished = true;
          return rows;
        },
      );
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(finished, false, 'peer ran inside the owner transaction');
    await a.end({ timeout: 0 });
    const [{ count }] = await Promise.race([
      waiting,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('queued client did not recover within 5s')), 5_000),
      ),
    ]);
    assert.equal(count, 0, 'disconnected owner write was not rolled back');
    await b`insert into catalog.brands (slug) values ('prototype-peer-committed')`;
    const c = connect();
    const [row] = await c`select slug from catalog.brands where slug = 'prototype-peer-committed'`;
    assert.equal(row.slug, 'prototype-peer-committed');
    return { rolledBackOwner: true, peerProgress: true };
  });
  await check('finite cancellation and statement-timeout behavior', async () => {
    const c = connect();
    const started = performance.now();
    const query = c`select pg_sleep(0.25)`;
    const pending = query.then(
      () => 'completed',
      (error) => error.code,
    );
    await delay(25);
    const cancelRequest = await Promise.race([
      Promise.resolve(query.cancel()).then(
        () => 'returned',
        (error) => error.code,
      ),
      delay(1_000).then(() => 'no acknowledgement within 1s'),
    ]);
    const outcome = await Promise.race([
      pending,
      delay(2_000).then(() => {
        throw new Error('finite cancelled query did not settle');
      }),
    ]);
    const cancellationMs = Math.round(performance.now() - started);
    const timeoutOutcome = await c
      .begin(async (tx) => {
        await tx`set local statement_timeout = '50ms'`;
        return tx`select pg_sleep(0.25)`.then(
          () => 'completed',
          (error) => error.code,
        );
      })
      .catch((error) => error.code);
    assert.equal((await c`select 1 as usable`)[0].usable, 1);
    return {
      cancelRequest,
      cancelOutcome: outcome,
      cancellationMs,
      statementTimeoutOutcome: timeoutOutcome,
      recovered: true,
    };
  });
  await check('committed data survives host restart', async () => {
    await Promise.all(clients.map((client) => client.end({ timeout: 1 })));
    await host.stop();
    await engine.close();
    engine = await PGlite.create({ dataDir: fileURLToPath(data), extensions: { uuid_ossp } });
    host = new PGLiteSocketServer({ db: engine, host: '127.0.0.1', port: 0, maxConnections: 32 });
    await host.start();
    url = `postgresql://postgres:postgres@${host.getServerConn()}/postgres`;
    const d = connect();
    assert.equal((await d`select count(*)::int as count from catalog.products`)[0].count, 229);
    assert.equal(
      (
        await d`select count(*)::int as count from catalog.brands where slug = 'prototype-peer-committed'`
      )[0].count,
      1,
    );
    assert.equal(
      (
        await d`select count(*)::int as count from catalog.brands where slug = 'prototype-uncommitted-owner'`
      )[0].count,
      0,
    );
    return { products: 229, peerCommitRetained: true, ownerRollbackRetained: true };
  });
  // Human explicitly accepted this capability gap for the prototype on 2026-10-25.
  // The standalone probe still asserts the PostgreSQL contract by default.
  await check(
    'independent-client interruption capability gap accepted for prototype only',
    () =>
      existingScript('prototype-pglite/cancellation-probe.mjs', undefined, [
        '--record-accepted-limitation',
      ]),
    'accepted-limitation',
  );
} catch (error) {
  failure = errorDetail(error);
  process.exitCode = 1;
} finally {
  await Promise.allSettled(clients.map((client) => client.end({ timeout: 1 })));
  if (host) await host.stop();
  if (engine) await engine.close();
  if (ownsLock) await rm(lockPath);
  const report = {
    question: 'Can one shared PGlite Socket host preserve the current SQL seam?',
    date: new Date().toISOString(),
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    prototype: true,
    checks,
    failure,
    unrun: [
      'remaining integrity/recovery probes',
      'both real apps and business journeys',
      'human usability evaluation',
      'resource comparison',
    ],
  };
  await writeFile(new URL('result.json', scratch), JSON.stringify(report, null, 2) + '\n');
  console.log(
    `PROTOTYPE RESULT: ${failure ? 'STOP — storage gate failed' : 'initial storage checks passed; gate incomplete'}`,
  );
  console.log(`${directory}.scratch/result.json`);
}
