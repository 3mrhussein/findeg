// Disposable diagnosis only: no application imports, schemas, fixtures or credentials.
if (process.env.NODE_ENV !== 'development') {
  throw new Error('This disposable diagnostic requires NODE_ENV=development.');
}

const { PGlite } = await import('@electric-sql/pglite');
const { PGLiteSocketServer } = await import('@electric-sql/pglite-socket');
const { default: postgres } = await import('postgres');
const { drizzle } = await import('drizzle-orm/postgres-js');
const { sql } = await import('drizzle-orm');
const { mkdir, writeFile } = await import('node:fs/promises');
const asynchronousErrors = [];
process.on('unhandledRejection', (reason) => {
  const error = reason.cause ?? reason;
  asynchronousErrors.push({ code: error.code, message: error.message });
});

const config = { isolationLevel: 'repeatable read', accessMode: 'read only' };
const cases = [
  { name: 'single-client', peers: 0, max: 1 },
  { name: 'two-client-concurrent-reads', peers: 1, max: 1 },
  { name: 'one-pool-two-connections', peers: 0, max: 2, samePoolReads: 4 },
  { name: 'two-pools-two-connections', peers: 1, max: 2, samePoolReads: 4 },
  { name: 'two-pools-parallel-transactions', peers: 1, max: 2, transactions: 4, samePoolReads: 4 },
  {
    name: 'two-pools-parameterized-read-traffic',
    peers: 1,
    max: 2,
    transactions: 4,
    samePoolReads: 4,
    parameterized: true,
  },
  { name: 'direct-pglite-transactions-and-reads', peers: 0, max: 1, direct: true },
];
function observe(engine, host, trace) {
  const owners = new WeakMap();
  let sequence = 0;
  const record = (entry) => {
    if (trace.length < 5000) trace.push({ sequence: sequence++, ...entry });
  };
  const queue = host.queryQueue;
  const enqueue = queue.enqueue;
  queue.enqueue = function (handlerId, message, ...rest) {
    owners.set(message, handlerId);
    return enqueue.call(this, handlerId, message, ...rest);
  };
  const execute = engine.execProtocolRawStream;
  engine.execProtocolRawStream = function (message, options) {
    const bytes = Buffer.from(message);
    const type = bytes[0] === 0 ? 'Startup' : String.fromCharCode(bytes[0]);
    const frontend = { direction: 'frontend', handler: owners.get(message), type };
    if (type === 'P') {
      const end = bytes.indexOf(0, 5);
      frontend.statement = bytes.toString('utf8', 5, end);
      frontend.sql = bytes.toString('utf8', end + 1, bytes.indexOf(0, end + 1));
    }
    if (type === 'B') {
      const portalEnd = bytes.indexOf(0, 5);
      const statementEnd = bytes.indexOf(0, portalEnd + 1);
      frontend.portal = bytes.toString('utf8', 5, portalEnd);
      frontend.statement = bytes.toString('utf8', portalEnd + 1, statementEnd);
      const formatCount = bytes.readUInt16BE(statementEnd + 1);
      frontend.parameterCount = bytes.readUInt16BE(statementEnd + 3 + formatCount * 2);
    }
    if (type === 'Q') frontend.sql = bytes.toString('utf8', 5, bytes.length - 1);
    record(frontend);
    let pending = Buffer.alloc(0);
    return execute.call(this, message, {
      ...options,
      onRawData(data) {
        pending = Buffer.concat([pending, data]);
        while (pending.length >= 5 && pending.length >= 1 + pending.readUInt32BE(1)) {
          const length = 1 + pending.readUInt32BE(1);
          const packet = pending.subarray(0, length);
          pending = pending.subarray(length);
          const type = String.fromCharCode(packet[0]);
          const entry = { direction: 'backend', handler: frontend.handler, type };
          if (type === 'Z') entry.status = String.fromCharCode(packet[5]);
          if (type === 'E') {
            let offset = 5;
            while (packet[offset]) {
              const field = String.fromCharCode(packet[offset++]);
              const end = packet.indexOf(0, offset);
              if (field === 'C') entry.code = packet.toString('utf8', offset, end);
              if (field === 'M') entry.message = packet.toString('utf8', offset, end);
              offset = end + 1;
            }
          }
          record(entry);
        }
        return options.onRawData(data);
      },
    });
  };
}
const report = {
  versions: { pglite: '0.5.11', socket: '0.2.14', postgres: '3.4.9', drizzle: '0.45.4' },
  cases: [],
};
for (const scenario of cases.filter(
  (item) => !process.env.DIAGNOSTIC_CASE || item.name === process.env.DIAGNOSTIC_CASE,
)) {
  asynchronousErrors.length = 0;
  const engine = await PGlite.create();
  const host = new PGLiteSocketServer({
    db: engine,
    host: '127.0.0.1',
    port: 0,
    maxConnections: 8,
  });
  const trace = [];
  if (process.env.DIAGNOSTIC_TRACE === '1') observe(engine, host, trace);
  await host.start();
  const url = `postgresql://postgres:postgres@${host.getServerConn()}/postgres`;
  const clients = Array.from({ length: scenario.peers + 1 }, () =>
    postgres(url, { max: scenario.max, ssl: false, onnotice: () => {} }),
  );
  const dbs = clients.map((client) => drizzle(client));
  const results = [];
  try {
    await Promise.all(clients.map((client) => client`select 1`));
    for (let round = 0; round < 20; round++) {
      const work = scenario.direct
        ? [
            engine.transaction(async (tx) => {
              await tx.query('set transaction isolation level repeatable read read only');
              return (await tx.query('select 1 as value')).rows;
            }),
            engine.query('select 2 as value').then((result) => result.rows),
          ]
        : Array.from({ length: scenario.transactions ?? 1 }, () =>
            dbs[0].transaction(async (tx) => tx.execute(sql`select 1 as value`), config),
          );
      for (let index = 0; index < (scenario.samePoolReads ?? 0); index++)
        work.push(
          dbs[0].execute(
            scenario.parameterized ? sql`select ${3}::int as value` : sql`select 3 as value`,
          ),
        );
      for (let index = 1; index < dbs.length; index++)
        work.push(
          dbs[index].execute(
            scenario.parameterized
              ? sql`select ${2}::int + ${4}::int as value`
              : sql`select 2 as value`,
          ),
        );
      let timer;
      const outcomes = await Promise.race([
        Promise.allSettled(work),
        new Promise((resolve) => {
          timer = setTimeout(
            () =>
              resolve([
                {
                  status: 'rejected',
                  reason: {
                    code: 'DIAGNOSTIC_TIMEOUT',
                    message: 'round did not settle within 3 seconds',
                  },
                },
              ]),
            3000,
          );
        }),
      ]);
      clearTimeout(timer);
      results.push({
        round,
        outcomes: outcomes.map((outcome) => {
          if (outcome.status === 'fulfilled')
            return { status: 'fulfilled', rows: [...outcome.value] };
          const error = outcome.reason.cause ?? outcome.reason;
          return { status: 'rejected', code: error.code, message: error.message };
        }),
      });
      if (
        outcomes.some(
          (outcome) =>
            outcome.status === 'rejected' && outcome.reason.code === 'DIAGNOSTIC_TIMEOUT',
        )
      )
        break;
    }
  } finally {
    await Promise.allSettled(clients.map((client) => client.end({ timeout: 1 })));
    await host.stop();
    await engine.close();
  }
  const errors = results.flatMap((round) =>
    round.outcomes.filter((outcome) => outcome.status === 'rejected'),
  );
  const result = {
    ...scenario,
    rounds: results.length,
    exact25001: errors.some((error) => error.code === '25001'),
    asynchronousErrors: [...asynchronousErrors],
    results,
    trace,
  };
  report.cases.push(result);
  console.log(
    JSON.stringify({ scenario: scenario.name, rounds: results.length, errors, asynchronousErrors }),
  );
}
await mkdir(new URL('evidence/', import.meta.url), { recursive: true });
const evidenceName = process.env.DIAGNOSTIC_CASE ?? 'baseline';
if (!cases.some((item) => item.name === evidenceName) && evidenceName !== 'baseline')
  throw new Error('Unknown case');
await writeFile(
  new URL(
    `evidence/${evidenceName}${process.env.DIAGNOSTIC_TRACE === '1' ? '-traced' : ''}.json`,
    import.meta.url,
  ),
  JSON.stringify(report, null, 2) + '\n',
);
if (report.cases.some((scenario) => scenario.exact25001)) process.exitCode = 1;
else if (
  report.cases.some(
    (scenario) =>
      scenario.asynchronousErrors.length ||
      scenario.results.some((round) =>
        round.outcomes.some((outcome) => outcome.status === 'rejected'),
      ),
  )
)
  process.exitCode = 2;
