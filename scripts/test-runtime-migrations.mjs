import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const exec = promisify(execFile);
const name = `findeg-runtime-test-${randomUUID()}`;
let created = false;
try {
  let url = process.env.MIGRATION_TEST_DATABASE_URL;
  if (!url) {
    await exec('docker', [
      'run',
      '--detach',
      '--rm',
      '--name',
      name,
      '-e',
      'POSTGRES_PASSWORD=runtime-test',
      '-p',
      '127.0.0.1::5432',
      'postgres:16-alpine',
    ]);
    created = true;
    const { stdout } = await exec('docker', ['port', name, '5432/tcp']);
    const port = stdout.trim().split(':').at(-1);
    url = `postgres://postgres:runtime-test@127.0.0.1:${port}/postgres`;
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      try {
        await exec('docker', ['exec', name, 'pg_isready', '-U', 'postgres']);
        ready = true;
        break;
      } catch {
        await delay(500);
      }
    }
    if (!ready) throw new Error('Disposable PostgreSQL did not become ready');
  }
  const child = spawn(
    process.execPath,
    [
      '--test',
      'tests/runtime-migrations.test.mjs',
      'tests/identity-access.test.mjs',
      'tests/partner-memberships.test.mjs',
      'tests/catalog-inventory.test.mjs',
      'tests/guest-checkout.test.mjs',
      'tests/outbox-delivery.test.mjs',
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, MIGRATION_TEST_DATABASE_URL: url },
    },
  );
  const [code] = await once(child, 'exit');
  process.exitCode = code ?? 1;
} finally {
  if (created) await exec('docker', ['stop', name]);
}
