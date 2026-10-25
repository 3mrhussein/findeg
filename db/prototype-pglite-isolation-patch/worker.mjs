// DISPOSABLE compatibility probe. Every engine is fresh; no existing table is modified.
if (process.env.NODE_ENV !== 'development') process.exit(2);
const [target, scenario] = process.argv.slice(2);
const [{ PGlite }, { PGLiteSocketServer }, { default: postgres }, { drizzle }, { sql }, { wire }] =
  await Promise.all([
    import('@electric-sql/pglite'),
    target === 'patched' ? import('./candidate.mjs') : import('@electric-sql/pglite-socket'),
    import('postgres'),
    import('drizzle-orm/postgres-js'),
    import('drizzle-orm'),
    import('./wire.mjs'),
  ]);
let engine,
  host,
  clients = [],
  wires = [];
const report = { target, scenario, checks: [] };
function check(name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  report.checks.push({ name, actual, expected, passed });
  if (!passed) process.exitCode = 1;
}
const summary = (outcome) =>
  outcome.status === 'fulfilled'
    ? { status: 'fulfilled', value: outcome.value[0]?.value }
    : {
        status: 'rejected',
        code: (outcome.reason.cause ?? outcome.reason).code,
        message: (outcome.reason.cause ?? outcome.reason).message,
      };
try {
  let options;
  if (target === 'postgres') {
    // Explicit opt-in endpoint; output never contains the endpoint or credentials.
    if (!process.env.PROTOTYPE_POSTGRES_URL) {
      console.log(
        JSON.stringify({ target, scenario, skipped: 'No explicit PROTOTYPE_POSTGRES_URL' }),
      );
      process.exit(2);
    }
    options = process.env.PROTOTYPE_POSTGRES_URL;
  } else {
    engine = await PGlite.create();
    host = new PGLiteSocketServer({ db: engine, host: '127.0.0.1', port: 0, maxConnections: 32 });
    await host.start();
    options = `postgresql://postgres:postgres@${host.getServerConn()}/postgres`;
  }
  clients = [0, 1].map(() =>
    postgres(options, {
      max: scenario === 'pool' ? 10 : 1,
      ssl: false,
      connect_timeout: 3,
      onnotice: () => {},
    }),
  );
  for (const client of clients) await client`select 1`;
  report.serverVersion = (await clients[0]`show server_version`)[0].server_version;
  if (['drizzle', 'reverse', 'pool'].includes(scenario)) {
    const dbs = clients.map((client) => drizzle(client));
    for (let round = 0; round < 10; round++) {
      const calls = [
        () => dbs[0].execute(sql`select ${11}::int as value`),
        () => dbs[1].execute(sql`select ${20}::int + ${2}::int as value`),
      ];
      const order = scenario === 'reverse' ? [1, 0] : [0, 1];
      const pending = order.map((i) => calls[i]());
      if (scenario === 'pool')
        for (let i = 0; i < 8; i++)
          pending.push(dbs[i % 2].execute(sql`select ${i}::int as value`));
      const results = (await Promise.allSettled(pending)).map(summary);
      const values = results.map((r) => (r.status === 'fulfilled' ? r.value : r));
      check(`concurrent round ${round}`, values, [
        ...order.map((i) => [11, 22][i]),
        ...(scenario === 'pool' ? Array.from({ length: 8 }, (_, i) => i) : []),
      ]);
      if (process.exitCode) break;
    }
  } else if (scenario === 'named') {
    // Use identical raw Parse/Bind frames for all three controls. The disposable
    // PostgreSQL control uses trust auth; this minimal frontend has no auth driver.
    const endpoint = new URL(options);
    wires = [
      await wire(endpoint.hostname, Number(endpoint.port) || 5432),
      await wire(endpoint.hostname, Number(endpoint.port) || 5432),
    ];
    const a = await wires[0].parse('wf_same', 'select 11::int as value');
    check(
      'client A Parse succeeds',
      a.some((r) => r.type === 'E'),
      false,
    );
    const foreign = await wires[1].execute('wf_same');
    check(
      'foreign statement absent',
      foreign.find((r) => r.type === 'E')?.code ?? foreign.find((r) => r.type === 'D')?.values,
      '26000',
    );
    const b = await wires[1].parse('wf_same', 'select 22::int as value');
    check('client B same-name Parse succeeds', b.find((r) => r.type === 'E')?.code ?? 'ok', 'ok');
    report.frames = { a, foreign, b };
    if (!b.some((r) => r.type === 'E')) {
      const rows = [await wires[0].execute('wf_same'), await wires[1].execute('wf_same')];
      check(
        'independent named results',
        rows.map((frames) => frames.find((r) => r.type === 'D')?.values),
        [['11'], ['22']],
      );
    }
  } else if (scenario === 'settings') {
    await clients[0].unsafe("set timezone = 'Europe/Paris'", [], { prepare: false });
    await clients[1].unsafe("set timezone = 'UTC'", [], { prepare: false });
    check(
      'independent timezone',
      [
        (await clients[0].unsafe('show timezone'))[0].TimeZone,
        (await clients[1].unsafe('show timezone'))[0].TimeZone,
      ],
      ['Europe/Paris', 'UTC'],
    );
  } else if (scenario === 'transactions') {
    for (let round = 0; round < 10; round++) {
      const outcomes = await Promise.allSettled([
        clients[0].begin('isolation level repeatable read read only', async (tx) => {
          const result = await tx`select ${11}::int as value`;
          await tx.savepoint(async (nested) => {
            await nested`select ${12}::int as value`;
          });
          return result;
        }),
        clients[1].begin(
          'isolation level repeatable read read only',
          (tx) => tx`select ${22}::int as value`,
        ),
      ]);
      check(
        `snapshot transaction ${round}`,
        outcomes.map(summary).map((r) => (r.status === 'fulfilled' ? r.value : r)),
        [11, 22],
      );
      if (process.exitCode) break;
    }
  }
} catch (error) {
  const cause = error.cause ?? error;
  report.error = { code: cause.code, message: cause.message };
  process.exitCode = 1;
} finally {
  for (const frontend of wires) frontend.close();
  await Promise.allSettled(clients.map((client) => client.end({ timeout: 1 })));
  if (host) await host.stop();
  if (engine) await engine.close();
  console.log(JSON.stringify(report));
}
