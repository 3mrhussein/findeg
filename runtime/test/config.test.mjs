import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readWebConfig } from '../dist/config.js';

test('production worker rejects absent, Sink, and unvalidated delivery providers', async () => {
  const { readWorkerConfig } = await import('../dist/config.js');
  const environment = {
    RELEASE_REVISION: 'a'.repeat(40),
    NODE_ENV: 'production',
    DATABASE_URL: 'postgres://user:private@localhost/findeg',
  };
  for (const DELIVERY_ADAPTER of [undefined, 'sink', 'unvalidated']) {
    assert.throws(
      () => readWorkerConfig({ ...environment, DELIVERY_ADAPTER }),
      (error) => /DELIVERY_ADAPTER/.test(error.message) && !/private/.test(error.message),
    );
  }
});

test('web startup rejects a missing release revision without exposing secrets', () => {
  assert.throws(
    () => readWebConfig({ DATABASE_URL: 'postgres://user:private@localhost/findeg' }),
    (error) => error.message.includes('RELEASE_REVISION') && !error.message.includes('private'),
  );
});

test('process configuration ignores settings owned by other processes', async () => {
  const { readWorkerConfig, readMigrationConfig } = await import('../dist/config.js');
  const release = { RELEASE_REVISION: 'a'.repeat(40) };
  assert.deepEqual(
    readWebConfig({
      ...release,
      WORKER_PORT: 'invalid',
      DATABASE_URL: 'postgres://localhost/findeg',
    }),
    {
      ...release,
      NODE_ENV: 'development',
      DATABASE_URL: 'postgres://localhost/findeg',
      DB_SSL: false,
      PARTNER_INVITATION_DAYS: 7,
      LIST_SELECTION_INACTIVITY_DAYS: 30,
    },
  );
  assert.throws(() => readWebConfig(release), /DATABASE_URL/);
  assert.equal(
    readWorkerConfig({
      ...release,
      DATABASE_URL: 'postgres://localhost/findeg',
      WORKER_PORT: '4100',
    }).WORKER_PORT,
    4100,
  );
  assert.throws(() => readWorkerConfig({ ...release, WORKER_PORT: '0' }), /WORKER_PORT/);
  assert.throws(() => readWorkerConfig({ ...release, WORKER_PORT: '3.5' }), /WORKER_PORT/);
  assert.throws(() => readMigrationConfig(release), /DATABASE_URL/);
  assert.throws(
    () => readMigrationConfig({ ...release, DATABASE_URL: 'https://example.com/db' }),
    /DATABASE_URL/,
  );
  assert.equal(
    readMigrationConfig({
      ...release,
      DATABASE_URL: 'postgres://localhost/findeg',
      DB_SSL: 'false',
    }).DB_SSL,
    false,
  );
  assert.throws(
    () =>
      readMigrationConfig({
        ...release,
        DATABASE_URL: 'postgres://localhost/findeg',
        DB_SSL: 'no',
      }),
    /DB_SSL/,
  );
});

test('Partner Invitation lifetime is bounded and configurable for the web process', () => {
  const environment = {
    RELEASE_REVISION: 'a'.repeat(40),
    DATABASE_URL: 'postgres://localhost/findeg',
  };
  assert.equal(readWebConfig(environment).PARTNER_INVITATION_DAYS, 7);
  assert.equal(
    readWebConfig({ ...environment, PARTNER_INVITATION_DAYS: '3' }).PARTNER_INVITATION_DAYS,
    3,
  );
  assert.throws(
    () => readWebConfig({ ...environment, PARTNER_INVITATION_DAYS: '0' }),
    /PARTNER_INVITATION_DAYS/,
  );
});
