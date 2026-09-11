import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readWebConfig } from '../dist/config.js';

test('web startup rejects a missing release revision without exposing secrets', () => {
  assert.throws(
    () => readWebConfig({ DATABASE_URL: 'postgres://user:private@localhost/findeg' }),
    (error) => error.message.includes('RELEASE_REVISION') && !error.message.includes('private'),
  );
});

test('process configuration ignores settings owned by other processes', async () => {
  const { readWorkerConfig, readMigrationConfig } = await import('../dist/config.js');
  const release = { RELEASE_REVISION: 'a'.repeat(40) };
  assert.deepEqual(readWebConfig({ ...release, WORKER_PORT: 'invalid', DATABASE_URL: 'invalid' }), {
    ...release,
    NODE_ENV: 'development',
  });
  assert.equal(readWorkerConfig({ ...release, WORKER_PORT: '4100' }).WORKER_PORT, 4100);
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
