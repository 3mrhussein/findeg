import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { runMigrations } from '../db/dist/runtime/migrations.js';
import { createTransactionRuntime } from '../runtime/dist/transactions.js';
import { bindCheckoutOutbox } from '../runtime/dist/checkout-outbox.js';
import { startWorker } from '../runtime/dist/worker.js';

const postgres = createRequire(new URL('../db/package.json', import.meta.url))('postgres');

async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function fixture(t) {
  assert.ok(process.env.MIGRATION_TEST_DATABASE_URL);
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_outbox_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  await admin`CREATE DATABASE ${admin(name)}`;
  const database = postgres(url.toString(), { max: 2 });
  const transactions = createTransactionRuntime(
    { url: url.toString(), ssl: false, max: 2 },
    bindCheckoutOutbox,
  );
  const workers = [];
  t.after(async () => {
    await Promise.all(workers.map((worker) => worker.close()));
    await transactions.close();
    await database.end();
    await admin`DROP DATABASE ${admin(name)}`;
    await admin.end();
  });
  await runMigrations({ url: url.toString(), ssl: false });
  const { createOutboxDelivery } = await import('../runtime/dist/outbox-delivery.js');
  const environment = {
    RELEASE_REVISION: 'a'.repeat(40),
    NODE_ENV: 'test',
    DATABASE_URL: url.toString(),
    OUTBOX_RETRY_MS: '20',
    OUTBOX_MAX_ATTEMPTS: '2',
    OUTBOX_DELIVERY_TIMEOUT_MS: '100',
  };
  return {
    database,
    transactions,
    environment,
    worker(adapter, envOverrides = {}) {
      const worker = createOutboxDelivery({ ...environment, ...envOverrides }, adapter);
      workers.push(worker);
      return worker;
    },
    async startWorkerService(adapter, envOverrides = {}) {
      const port = await freePort();
      const worker = await startWorker(
        { ...environment, WORKER_PORT: String(port), ...envOverrides },
        adapter,
      );
      workers.push(worker);
      return { worker, port };
    },
    async enqueue(
      id = randomUUID(),
      payload = { reference: 'order-reference', email: 'customer@example.test' },
    ) {
      await transactions.transactions.run(async (outbox) => {
        await outbox.enqueue(id, 'order-accepted', payload);
        return { ok: true, value: id };
      });
      return id;
    },
  };
}

test('only committed notifications reach the persistent local Sink, once per delivery ID', async (t) => {
  const f = await fixture(t);
  const worker = f.worker();
  await f.transactions.transactions.run(async (outbox) => {
    await outbox.enqueue('rolled-back', 'order-accepted', {
      reference: 'order',
      email: 'customer@example.test',
    });
    assert.equal(await worker.deliverNext(), 'idle');
    return { ok: false, error: 'checkout-rejected' };
  });
  const id = await f.enqueue('committed');
  assert.equal(await worker.deliverNext(), 'delivered');
  assert.equal(await worker.deliverNext(), 'idle');
  const sink = await f.database`SELECT id, kind, payload FROM system.notification_sink`;
  assert.deepEqual(
    [...sink],
    [
      {
        id,
        kind: 'order-accepted',
        payload: { reference: 'order-reference', email: 'customer@example.test' },
      },
    ],
  );
  assert.deepEqual(await worker.status(), {
    pending: 0,
    processing: 0,
    delivered: 1,
    exhausted: 0,
  });
});

test('the worker retries failed delivery with stable identifiers, backoff delay, and retains exhausted failures', async (t) => {
  const f = await fixture(t);
  const received = [];
  let shouldFail = true;
  const adapter = {
    async deliver(message) {
      received.push(message);
      if (shouldFail) {
        throw new Error('sensitive provider token error text that must not leak');
      }
    },
  };
  const worker = f.worker(adapter);
  const id = await f.enqueue('retry-order');

  // Attempt 1: fails
  assert.equal(await worker.deliverNext(), 'failed');
  assert.equal(received.length, 1);
  assert.equal(received[0].id, id);

  // Immediately checking again: next_attempt_at is in the future, so worker is idle
  assert.equal(await worker.deliverNext(), 'idle');

  // Wait for retry backoff delay (20ms)
  await delay(30);

  // Attempt 2: fails again (max attempts = 2 reached, transitions to exhausted)
  assert.equal(await worker.deliverNext(), 'failed');
  assert.equal(received.length, 2);
  assert.equal(received[1].id, id); // Stable identifier preserved across retries

  // Notification is retained for operator investigation, not deleted
  const [record] = await f.database`
    SELECT id, status, attempts, last_error, payload
    FROM system.checkout_outbox
    WHERE id = ${id}
  `;
  assert.equal(record.id, id);
  assert.equal(record.status, 'exhausted');
  assert.equal(record.attempts, 2);
  assert.equal(record.last_error, 'delivery-failed'); // Error category preserved without sensitive message
  assert.doesNotMatch(record.last_error, /sensitive provider token/);
  assert.deepEqual(record.payload, {
    reference: 'order-reference',
    email: 'customer@example.test',
  });

  assert.deepEqual(await worker.status(), {
    pending: 0,
    processing: 0,
    delivered: 0,
    exhausted: 1,
  });
});

test('delivery deadline aborts slow adapters and records delivery-timeout without sensitive provider text', async (t) => {
  const f = await fixture(t);
  let aborted = false;
  const slowAdapter = {
    async deliver(_message, signal) {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          aborted = true;
          reject(new Error('AbortError: delivery timed out'));
        });
      });
    },
  };
  const worker = f.worker(slowAdapter);
  const id = await f.enqueue('slow-delivery');

  assert.equal(await worker.deliverNext(), 'failed');
  assert.equal(aborted, true);

  const [record] =
    await f.database`SELECT last_error, status FROM system.checkout_outbox WHERE id = ${id}`;
  assert.equal(record.last_error, 'delivery-timeout');
  assert.equal(record.status, 'pending');
});

test('crashed worker lease expires and is recovered by another worker; expired final attempt exhausts', async (t) => {
  const f = await fixture(t);
  const id = await f.enqueue('lease-test');

  // Simulate a crashed worker that acquired a lease in the past
  await f.database`
    UPDATE system.checkout_outbox
    SET status = 'processing',
        attempts = 1,
        lease_token = ${randomUUID()}::uuid,
        lease_until = now() - interval '1 second'
    WHERE id = ${id}
  `;

  // An active worker claims and successfully delivers the expired lease
  const worker = f.worker();
  assert.equal(await worker.deliverNext(), 'delivered');

  const [record] =
    await f.database`SELECT status, attempts FROM system.checkout_outbox WHERE id = ${id}`;
  assert.equal(record.status, 'delivered');
  assert.equal(record.attempts, 2);

  // Now test an expired final attempt (attempts >= maxAttempts)
  const idFinal = await f.enqueue('final-lease-test');
  await f.database`
    UPDATE system.checkout_outbox
    SET status = 'processing',
        attempts = 2,
        lease_token = ${randomUUID()}::uuid,
        lease_until = now() - interval '1 second'
    WHERE id = ${idFinal}
  `;

  // Next claim sweeps expired final attempt to exhausted
  assert.equal(await worker.deliverNext(), 'idle');
  const [finalRecord] =
    await f.database`SELECT status, last_error FROM system.checkout_outbox WHERE id = ${idFinal}`;
  assert.equal(finalRecord.status, 'exhausted');
  assert.equal(finalRecord.last_error, 'lease-expired');
});

test('worker HTTP service reports 200 on healthy queue and 503 on exhausted failures or database down', async (t) => {
  const f = await fixture(t);
  const { port } = await f.startWorkerService();

  // Queue is clean
  const cleanResponse = await fetch(`http://127.0.0.1:${port}/health/ready`);
  assert.equal(cleanResponse.status, 200);
  const cleanBody = await cleanResponse.json();
  assert.equal(cleanBody.status, 'ready');
  assert.equal(cleanBody.exhausted, 0);

  // Simulate an exhausted record
  const id = await f.enqueue('exhausted-for-health');
  await f.database`
    UPDATE system.checkout_outbox
    SET status = 'exhausted', attempts = 2, last_error = 'delivery-failed'
    WHERE id = ${id}
  `;

  const exhaustedResponse = await fetch(`http://127.0.0.1:${port}/health/ready`);
  assert.equal(exhaustedResponse.status, 503);
  const exhaustedBody = await exhaustedResponse.json();
  assert.equal(exhaustedBody.status, 'exhausted-failures');
  assert.equal(exhaustedBody.exhausted, 1);
});
