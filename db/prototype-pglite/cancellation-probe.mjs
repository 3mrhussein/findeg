// PROTOTYPE: separate client process so the host cannot delay this client's timers.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';

const dbRequire = createRequire(new URL('../package.json', import.meta.url));
const postgres = dbRequire('postgres');
const options = { max: 1, ssl: false, connect_timeout: 5, onnotice: () => {} };
const client = postgres(process.env.DATABASE_URL, options);
const peer = postgres(process.env.DATABASE_URL, options);
const result = {};
try {
  await client`select 1`;
  await peer`select 1`;
  const started = performance.now();
  const query = client`select pg_sleep(0.5)`;
  const pending = query.then(
    () => 'completed',
    (error) => error.code,
  );
  await delay(50);
  result.cancelRequestedAtMs = Math.round(performance.now() - started);
  const cancellation = Promise.resolve(query.cancel());
  const progress = peer`select 1 as usable`.then(() => Math.round(performance.now() - started));
  result.cancelOutcome = await pending;
  result.cancelDurationMs = Math.round(performance.now() - started);
  result.cancelRequest = await Promise.race([
    cancellation.then(
      () => 'returned',
      (error) => error.code,
    ),
    delay(1_000).then(() => 'no acknowledgement within 1s'),
  ]);
  result.peerProgressAtMs = await progress;
  const timeoutStart = performance.now();
  result.statementTimeoutOutcome = await client
    .begin(async (tx) => {
      await tx`set local statement_timeout = '50ms'`;
      const [{ statement_timeout: configured }] = await tx`show statement_timeout`;
      result.configuredStatementTimeout = configured;
      return tx`select pg_sleep(0.5)`.then(
        () => 'completed',
        (error) => error.code,
      );
    })
    .catch((error) => error.code);
  result.statementDurationMs = Math.round(performance.now() - timeoutStart);
  result.recovered = (await peer`select 1 as usable`)[0].usable === 1;
  console.log(JSON.stringify(result));
  if (!process.argv.includes('--record-accepted-limitation')) {
    assert.equal(
      result.statementTimeoutOutcome,
      '57014',
      '50ms statement_timeout did not interrupt the 500ms statement',
    );
  }
} finally {
  await Promise.all([client.end({ timeout: 1 }), peer.end({ timeout: 1 })]);
}
