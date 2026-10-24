# Disposable PGlite transaction-state diagnosis

**The separate Dashboard `25001` failure remains unexplained.** This diagnostic did not reproduce it. Canonical Drizzle repeatable-read/read-only transactions passed the bounded synthetic cases below. Increasing traffic to parameterized queries exposed different protocol-state failures; those are evidence of additional incompatibility, not an explanation of the Dashboard error.

Context: [Choose how to preserve concurrent Drizzle queries after the shared PGlite Socket failure](https://github.com/3mrhussein/findeg/issues/526), within [Map: Fast local development without Docker](https://github.com/3mrhussein/findeg/issues/518). This is temporary diagnostic evidence, not a transport repair or a fast-mode implementation. Application baseline: `a4574376f34ad362487f89d2789b0504dbb9b9f4`.

## Reproduce

```sh
cd db/diagnostics-pglite-transaction
pnpm install --ignore-workspace --ignore-scripts --prod=false --frozen-lockfile
NODE_ENV=development node diagnose.mjs
```

The full run exits `2` because the expanded traffic encounters other failures. Exit `1` is reserved for an observed exact `25001`; exit `0` means no rejected requests, asynchronous errors or round timeouts in the selected cases. An exit `0` does not establish application compatibility. `NODE_ENV=production node diagnose.mjs` must refuse before importing diagnostic dependencies; this refusal was verified. All four pinned packages are declared only in `devDependencies`, in a nested non-workspace manifest. No app or production module was changed.

To inspect a bounded trace or one case:

```sh
NODE_ENV=development DIAGNOSTIC_CASE=single-client DIAGNOSTIC_TRACE=1 node diagnose.mjs
NODE_ENV=development DIAGNOSTIC_CASE=two-pools-parameterized-read-traffic DIAGNOSTIC_TRACE=1 node diagnose.mjs
NODE_ENV=development DIAGNOSTIC_CASE=direct-pglite-transactions-and-reads node diagnose.mjs
```

The harness uses a fresh in-memory engine per case, synthetic reads, no fixtures, no application imports and no external database URL. Packages: PGlite `0.5.11`, Socket `0.2.14`, postgres-js `3.4.9`, Drizzle `0.45.4`; Node `24.21.0`, macOS x64. The install reused the local pnpm content-addressable cache. No credentials or environment files are read or archived. PostgreSQL control was **unrun**: this diagnostic did not have an explicitly provided control endpoint and did not provision or discover one.

## Results

See [baseline evidence](evidence/baseline.json); each case permits at most 20 rounds and each round has a three-second observation deadline.

| Case | Result |
| --- | --- |
| One postgres-js client, pool maximum one | 20/20 canonical transactions completed without `25001` |
| Two clients, each pool maximum one, concurrent reads | 20/20 rounds completed without `25001` |
| One pool, maximum two, four competing same-pool simple reads | 20/20 rounds completed without `25001` |
| Two pools, maximum two, competing reads | 20/20 rounds completed without `25001` |
| Two pools, maximum two, four parallel canonical transactions and four simple reads | 20/20 rounds completed without `25001` |
| Same traffic with parameterized same-pool and peer reads | Other errors: `26000` missing prepared statement and `34000` missing unnamed portal; an unhandled rejection was observed, and a subsequent round did not settle within three seconds. No `25001` |
| Direct PGlite transaction plus concurrent direct read | 20/20 rounds completed without `25001` |

The parameterized scenario repeated with and without instrumentation and produced the same error classes and unsettled-round observation. Its diagnostic `unhandledRejection` listener records the otherwise process-terminating rejection; it is an observer used only in this disposable harness, not an application recovery solution. The deadline marks an unsettled round; it does not cancel engine execution or claim bounded recovery. Cleanup closes clients, socket host and in-memory engine.

## What the traces establish

The [single-client trace](evidence/single-client-traced.json) records the canonical sequence on one handler: simple-query `BEGIN`, `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`, then `SELECT`, followed by commit. The configured path itself works in this reduction. The canonical configuration is required by [Orders statistics](../../packages/orders/src/features/order-statistics/helpers.ts) in the application; equivalent snapshot settings exist for School Supply List reading and Partner Reports. The installed [Drizzle implementation](https://unpkg.com/drizzle-orm@0.45.4/postgres-js/session.js) invokes `begin`, sets transaction configuration before calling user transaction code, and uses postgres-js `unsafe` for ordinary query execution. PostgreSQL requires isolation configuration before the transaction's first query; this explains the meaning of `25001`, not why the actual Dashboard reached it. [PostgreSQL SET TRANSACTION](https://www.postgresql.org/docs/18/sql-set-transaction.html).

The [expanded-traffic trace](evidence/two-pools-parameterized-read-traffic-traced.json) records actual execution of a peer's unnamed Parse, another client's simple queries and a new connection startup before the peer's Bind. It then records backend `26000` for the missing unnamed statement, followed by `34000` for the missing unnamed portal, and later `26000` involving a named startup statement. The shared protocol state is being interleaved across handler identities. The observations do not isolate which intervening message destroyed each statement, nor prove this sequence caused the historical Dashboard `25001`. PostgreSQL defines unnamed prepared-statement replacement and destruction by simple-query messages; transaction/session state must not be inferred from one successful SQL query. [PostgreSQL extended-query flow](https://www.postgresql.org/docs/18/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY).

Instrumentation wraps the existing queue `enqueue` and engine `execProtocolRawStream` methods in memory, preserving their original calls/return promises and the raw-data callback. It records only synthetic SQL, handler identities, frontend message types/parameter counts, backend SQLSTATE/message, and ReadyForQuery status, capped at 5,000 events per case. It does not edit Socket code, change the queue, insert awaits or delays, or log startup credentials/backend key payloads. The released [Socket source](https://unpkg.com/@electric-sql/pglite-socket@0.2.14/src/index.ts) executes individual messages against one engine and prioritizes the last handler while an engine transaction is active.

## Limits and next evidence

The requested exact-symptom loop is **not yet established** for `25001`; the diagnostic therefore stops before ranking or testing causal explanations for that error. No source-supported hypothesis is promoted to a root-cause conclusion. The next useful evidence is an observational trace of the actual failing Dashboard workload, preserving its query text, pool behavior, process multiplicity and connection churn. That capture should establish what executes between its `BEGIN` and `SET TRANSACTION`, including engine/handler transaction identity and protocol state. It must retain existing snapshot/isolation requirements and real business operations.

The existing prototype's successful migration/seed/value/constraint/savepoint/disconnect/restart checks are neither invalidated nor re-established here. No workflows, real-app recovery, interrupted in-flight writes, durable restart behavior or resource/startup benchmark were tested in this diagnostic. No dependency versions, transport code or production architecture were repaired or selected. This diagnostic supplies facts for the human decision and does not resolve it.
