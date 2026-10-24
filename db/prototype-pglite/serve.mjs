// PROTOTYPE: one owner, two actual apps. Uses only PROTOTYPE-wipe-me scratch state.
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { spawn } from 'node:child_process';
import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, open, readFile, unlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const scratch = new URL('.scratch/', import.meta.url);
const data = new URL('PROTOTYPE-wipe-me/', scratch);
if (!existsSync(data))
  throw new Error('Run pnpm prototype:pglite to initialize the scratch data first.');
await mkdir(scratch, { recursive: true });
const lockPath = new URL('host.lock', scratch);
if (existsSync(lockPath)) {
  const owner = Number(await readFile(lockPath, 'utf8'));
  try {
    process.kill(owner, 0);
    throw new Error(
      `Prototype state is owned by process ${owner}; stop it before reopening the store.`,
    );
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
    await unlink(lockPath);
  }
}
const lock = await open(lockPath, 'wx');
await lock.writeFile(String(process.pid));
await lock.close();
const db = await PGlite.create({ dataDir: fileURLToPath(data), extensions: { uuid_ossp } });
const host = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0, maxConnections: 32 });
await host.start();
const databaseUrl = `postgresql://postgres:postgres@${host.getServerConn()}/postgres`;
const storefront = 'http://127.0.0.1:3140';
const dashboard = 'http://127.0.0.1:3141';
const children = [];
let stopping = false;
const env = {
  ...process.env,
  NODE_ENV: 'development',
  DATABASE_URL: databaseUrl,
  DB_SSL: 'false',
  FINDEG_PGLITE_PROTOTYPE: '1',
  FINDEG_PROTOTYPE_CAPTURE_DIR: fileURLToPath(scratch),
  JWT_SECRET: 'prototype-only-signing-key-0123456789-abcdef',
  JWT_REFRESH_SECRET: 'prototype-only-refresh-key-0123456789-abcdef',
  GUEST_ACCESS_SECRET: 'prototype-only-guest-access-0123456789-abcdef',
  OUTBOX_SWEEPER_SECRET: 'prototype-only-sweeper-secret',
  RESEND_API_KEY: '',
  NEXT_PUBLIC_APP_URL: dashboard,
  NEXT_PUBLIC_SITE_URL: storefront,
  NEXT_TELEMETRY_DISABLED: '1',
};
delete env.DB_MIGRATING;
delete env.DB_SEEDING;
for (const [name, port] of [
  ['storefront', 3140],
  ['dashboard', 3141],
]) {
  const directory = `${root}frontend/${name}`;
  const require = createRequire(`${directory}/package.json`);
  const next = require.resolve('next/dist/bin/next');
  const child = spawn(
    process.execPath,
    [next, 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      cwd: directory,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const log = createWriteStream(new URL(`${name}.log`, scratch), { flags: 'a' });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  child.on('exit', (code, signal) => {
    console.log(`${name} exited: ${code ?? signal}`);
    if (!stopping) stop();
  });
  children.push(child);
}
await writeFile(
  new URL('runtime.json', scratch),
  JSON.stringify(
    {
      hostPid: process.pid,
      databaseUrl,
      storefront,
      dashboard,
      children: children.map((child) => child.pid),
    },
    null,
    2,
  ),
);
console.log(`PROTOTYPE Storefront: ${storefront}/en`);
console.log(`PROTOTYPE Dashboard: ${dashboard}/en/login`);
console.log('App logs: db/prototype-pglite/.scratch/{storefront,dashboard}.log');
const sweeper = setInterval(() => {
  fetch(`${storefront}/api/internal/outbox/drain`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OUTBOX_SWEEPER_SECRET}` },
  }).catch((error) => console.log(`Local sweep unavailable: ${error.message}`));
}, 60_000);
async function stop() {
  if (stopping) return;
  stopping = true;
  clearInterval(sweeper);
  await Promise.all(
    children.map(
      (child) =>
        new Promise((resolve) => {
          if (child.exitCode !== null) return resolve();
          child.once('exit', resolve);
          child.kill('SIGTERM');
          const timer = setTimeout(() => child.kill('SIGKILL'), 3_000);
          timer.unref();
        }),
    ),
  );
  await host.stop();
  await db.close();
  await unlink(lockPath);
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
