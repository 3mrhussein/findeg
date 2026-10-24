// DISPOSABLE DIAGNOSTIC: synthetic queries only; never production composition.
import { mkdir, writeFile } from 'node:fs/promises';

if (process.env.NODE_ENV !== 'development') {
  console.error('This diagnostic requires NODE_ENV=development.');
  process.exit(2);
}

const [{ PGlite }, { PGLiteSocketServer }, { default: postgres }, { drizzle }, { sql }] =
  await Promise.all([
    import('@electric-sql/pglite'),
    import('@electric-sql/pglite-socket'),
    import('postgres'),
    import('drizzle-orm/postgres-js'),
    import('drizzle-orm'),
  ]);

const engine = await PGlite.create();
const traceEnabled = process.argv.includes('--trace');
const serial = process.argv.includes('--serial');
const reverse = process.argv.includes('--reverse');
const events = [];
let recording = false;
let activeHandler;

function frontend(message) {
  const bytes = Buffer.from(message);
  const type = String.fromCharCode(bytes[0]);
  const result = { type };
  if (type === 'P') {
    const end = bytes.indexOf(0, 5);
    const queryEnd = bytes.indexOf(0, end + 1);
    result.name = bytes.toString('utf8', 5, end);
    result.sql = bytes.toString('utf8', end + 1, queryEnd);
  } else if (type === 'B') {
    const portalEnd = bytes.indexOf(0, 5);
    const statementEnd = bytes.indexOf(0, portalEnd + 1);
    result.portal = bytes.toString('utf8', 5, portalEnd);
    result.statement = bytes.toString('utf8', portalEnd + 1, statementEnd);
    const formatCount = bytes.readUInt16BE(statementEnd + 1);
    result.parameterCount = bytes.readUInt16BE(statementEnd + 3 + 2 * formatCount);
  }
  return result;
}

function backend(data) {
  const bytes = Buffer.from(data);
  const responses = [];
  for (let offset = 0; offset + 5 <= bytes.length;) {
    const type = String.fromCharCode(bytes[offset]);
    const length = bytes.readUInt32BE(offset + 1);
    if (length < 4 || offset + length + 1 > bytes.length) {
      responses.push({ type: 'partial', bytes: bytes.length - offset });
      break;
    }
    const response = { type };
    if (type === 'Z') response.status = String.fromCharCode(bytes[offset + 5]);
    if (type === 'E') {
      let fieldOffset = offset + 5;
      while (fieldOffset < offset + 1 + length && bytes[fieldOffset] !== 0) {
        const tag = String.fromCharCode(bytes[fieldOffset]);
        const end = bytes.indexOf(0, fieldOffset + 1);
        if (tag === 'C') response.code = bytes.toString('utf8', fieldOffset + 1, end);
        if (tag === 'M') response.message = bytes.toString('utf8', fieldOffset + 1, end);
        fieldOffset = end + 1;
      }
    }
    responses.push(response);
    offset += length + 1;
  }
  return responses;
}

function record(event) {
  if (recording) events.push({ sequence: events.length, ...event });
}

const host = new PGLiteSocketServer({
  db: engine,
  host: '127.0.0.1',
  port: 0,
  maxConnections: 8,
});
if (traceEnabled) {
  // Observers wrap the existing methods without changing ownership or scheduling.
  // These private names are version-pinned and intentionally confined to this diagnostic.
  const queue = host.queryQueue;
  if (!queue?.enqueue || !queue?.log) throw new Error('Pinned Socket internals changed.');
  const enqueue = queue.enqueue;
  queue.enqueue = function (handler, message, onData) {
    record({ phase: 'enqueue', handler, frontend: frontend(message) });
    return enqueue.call(this, handler, message, onData);
  };
  const log = queue.log;
  queue.log = function (message, ...args) {
    const match = message.match(/^processing query from handler #(\d+)/);
    if (match) activeHandler = Number(match[1]);
    return log.call(this, message, ...args);
  };
  const execute = engine.execProtocolRawStream.bind(engine);
  engine.execProtocolRawStream = function (message, options) {
    const handler = activeHandler;
    record({ phase: 'execute', handler, frontend: frontend(message) });
    return execute(message, {
      ...options,
      onRawData(data) {
        record({ phase: 'response', handler, backend: backend(data) });
        options.onRawData(data);
      },
    });
  };
}
const deadline = setTimeout(() => {
  console.error('Diagnostic exceeded its 15-second deadline.');
  process.exit(3);
}, 15_000);
const options = { max: 1, ssl: false, onnotice: () => {} };
const results = [];
let clients = [];
let serverVersion;
try {
  await host.start();
  const url = `postgresql://postgres:postgres@${host.getServerConn()}/postgres`;
  clients = [postgres(url, options), postgres(url, options)];
  for (const client of clients) await client`select 1`;
  serverVersion = (await clients[0]`show server_version`)[0].server_version;
  const dbs = clients.map((client) => drizzle(client));
  recording = true;
  for (let round = 0; round < 10; round++) {
    const calls = [
      () => dbs[0].execute(sql`select ${11}::int as value`),
      () => dbs[1].execute(sql`select ${20}::int + ${2}::int as value`),
    ];
    const order = reverse ? [1, 0] : [0, 1];
    const ordered = [];
    if (serial) {
      for (const index of order) ordered.push((await Promise.allSettled([calls[index]()]))[0]);
    } else {
      ordered.push(...(await Promise.allSettled(order.map((index) => calls[index]()))));
    }
    const outcomes = reverse ? ordered.reverse() : ordered;
    const row = {
      round,
      outcomes: outcomes.map((outcome) => {
        if (outcome.status === 'fulfilled') {
          return { status: 'fulfilled', value: outcome.value[0].value };
        }
        const error = outcome.reason.cause ?? outcome.reason;
        return { status: 'rejected', code: error.code, message: error.message };
      }),
    };
    results.push(row);
    console.log(JSON.stringify(row));
    if (
      row.outcomes.some(
        (outcome, index) => outcome.status !== 'fulfilled' || outcome.value !== [11, 22][index],
      )
    ) {
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await mkdir(new URL('.scratch/', import.meta.url), { recursive: true });
  await writeFile(
    new URL(
      `.scratch/query-${serial ? 'serial' : 'concurrent'}${reverse ? '-reverse' : ''}${traceEnabled ? '-trace' : ''}.json`,
      import.meta.url,
    ),
    JSON.stringify({ serverVersion, serial, reverse, traceEnabled, results, events }, null, 2) +
      '\n',
  );
  await Promise.allSettled(clients.map((client) => client.end({ timeout: 1 })));
  await host.stop();
  await engine.close();
  clearTimeout(deadline);
}
