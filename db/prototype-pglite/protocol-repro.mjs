// PROTOTYPE: reproduce interleaved unnamed extended-query messages without app/schema code.
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(new URL('../package.json', import.meta.url));
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const { sql } = require('drizzle-orm');
const engine = process.env.PROTOTYPE_POSTGRES_URL ? undefined : await PGlite.create();
const host = engine
  ? new PGLiteSocketServer({ db: engine, host: '127.0.0.1', port: 0, maxConnections: 8 })
  : undefined;
if (host) await host.start();
const url =
  process.env.PROTOTYPE_POSTGRES_URL ??
  `postgresql://postgres:postgres@${host.getServerConn()}/postgres`;
const mode = process.argv.includes('--raw') ? 'raw' : 'drizzle';
const options = { max: 1, ssl: false, transform: { undefined: null }, onnotice: () => {} };
const clients = [postgres(url, options), postgres(url, options)];
const dbs = clients.map((client) => drizzle(client));
const results = [];
let outcome = 'unrun';
let serverVersion;
try {
  await Promise.all(clients.map((client) => client`select 1`));
  serverVersion = (await clients[0]`show server_version`)[0].server_version;
  for (let iteration = 0; iteration < 10; iteration++) {
    const outcomes = await Promise.allSettled(
      mode === 'raw'
        ? [
            clients[0].unsafe('select $1::int as value', [11]),
            clients[1].unsafe('select $1::int + $2::int as value', [20, 2]),
          ]
        : [
            dbs[0].execute(sql`select ${11}::int as value`),
            dbs[1].execute(sql`select ${20}::int + ${2}::int as value`),
          ],
    );
    const result = {
      iteration,
      outcomes: outcomes.map((outcome) =>
        outcome.status === 'fulfilled'
          ? { status: 'fulfilled', value: outcome.value[0].value }
          : {
              status: 'rejected',
              code: (outcome.reason.cause ?? outcome.reason).code,
              message: (outcome.reason.cause ?? outcome.reason).message,
            },
      ),
    };
    results.push(result);
    console.log(JSON.stringify(result));
    if (
      outcomes.some(
        (outcome, index) =>
          outcome.status === 'rejected' || outcome.value[0].value !== [11, 22][index],
      )
    ) {
      outcome = 'failed';
      process.exitCode = 1;
      break;
    }
    outcome = 'passed';
  }
} finally {
  await Promise.allSettled(clients.map((client) => client.end({ timeout: 1 })));
  if (host) await host.stop();
  if (engine) await engine.close();
  await mkdir(new URL('.scratch/', import.meta.url), { recursive: true });
  await writeFile(
    new URL(`.scratch/protocol-${engine ? 'pglite' : 'postgres'}-${mode}.json`, import.meta.url),
    JSON.stringify(
      {
        target: engine ? 'PGlite 0.5.11 / Socket 0.2.14' : 'configured local PostgreSQL',
        postgres: '3.4.9',
        mode,
        outcome,
        serverVersion,
        connectionMax: 1,
        clients: 2,
        prepare: 'postgres-js unsafe default',
        results,
      },
      null,
      2,
    ) + '\n',
  );
}
