# PGlite Socket isolation patch: source research

Disposable source evidence for [Evaluate the pinned PGlite Socket isolation patch against both apps](https://github.com/3mrhussein/findeg/issues/527). Checked 2026-10-25, Africa/Cairo. This note reports source inspection, not executable compatibility, recovery or application results.

## Exact candidate and upstream state

[Fix extended-query isolation for pooled postgres.js clients in pglite-socket](https://github.com/electric-sql/pglite/pull/977) remains open and unmerged. GitHub's live API returned head `bb4e8b0797adb8a63e19ac66c423ae46c0d306fa`, one commit, two changed files, 160 additions and 50 deletions. The PR's last-update timestamp was `2026-08-14T09:35:47Z`. This is an unmerged candidate; these observations do not establish that an equivalent fix is absent from every later release. [PR API](https://api.github.com/repos/electric-sql/pglite/pulls/977).

The [pinned commit diff](https://github.com/electric-sql/pglite/commit/bb4e8b0797adb8a63e19ac66c423ae46c0d306fa) changes the queue and adds one postgres-js concurrency test. Its only implementation file is `packages/pglite-socket/src/index.ts`; the implementation changes import the protocol parser, replace last-handler tracking with active ownership, select queued messages from that handler, inspect ReadyForQuery, release on idle status or Terminate, restore queue processing through `finally`, and release/roll back the owning handler during disconnect cleanup. It adds no per-client prepared-state or session-state implementation.

## Porting to the released control

The [released Socket 0.2.14 source](https://unpkg.com/@electric-sql/pglite-socket@0.2.14/src/index.ts) differs from the [whole file at the pinned candidate](https://github.com/electric-sql/pglite/blob/bb4e8b0797adb8a63e19ac66c423ae46c0d306fa/packages/pglite-socket/src/index.ts) outside the candidate diff. In particular, the release includes SSLRequest handling, an explicitly unsupported CancelRequest consumer, a listen-error fix and a corrected maxConnections comment which the older candidate file lacks. Copying the candidate's whole file over the release would remove unrelated released behavior. Apply only the commit's queue/parser change to the released control and record that exact port.

SHA-256 of downloaded UTF-8 source bytes:

| Source                                | SHA-256                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| Released 0.2.14 `src/index.ts`        | `de23b27f5b021cd8caadd0b0993c9f51160a6dc9f5069ac26d9fa7f1fad2a34f` |
| Pinned candidate whole `src/index.ts` | `12a3d5993ea86fc9a2eb946736c965662524f59a74d53e44338175e73bb7d53a` |

The release queues individual frontend frames on one PGlite object. The patch instead holds ownership until ReadyForQuery reports idle; transaction/failed-transaction status retains ownership. Its exception branch rejects the failed queued entry and clears matching ownership, then continues. It does not itself prove the engine has returned to a safe state after an executor exception. Its disconnect cleanup can issue ROLLBACK, but it adds no external watchdog, query interruption or restart supervisor. These are source observations from the linked implementation, not claims about measured outcomes.

## Protocol and session implications

PostgreSQL's unnamed statement is replaced by another unnamed Parse. Named statements persist for the session, while named portals persist for the transaction. Sync yields ReadyForQuery and recovers extended-query errors; it does not close an explicit transaction. Consequently, the candidate's ownership rule addresses interleaved exchanges, but serialization alone does not give multiple frontend connections independent persistent statement names. This is an inference requiring executable conflicting-name and reconnect controls. [PostgreSQL 18 extended-query protocol](https://www.postgresql.org/docs/18/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY).

ReadyForQuery reports `I` for idle, `T` for an active transaction, and `E` for a failed transaction. The candidate's `I` release and retention otherwise align with those distinctions; correct full transaction ownership still requires runtime proof, including errors and disconnects. [PostgreSQL 18 message formats](https://www.postgresql.org/docs/18/protocol-message-formats.html#PROTOCOL-MESSAGE-FORMATS-READYFORQUERY).

Session SET affects only its session and can survive transaction commit; SET LOCAL expires with the transaction. The patch adds no settings capture/restore. Therefore a shared engine needs actual evidence that the app's startup/session settings cannot leak across frontend connections. Serialization through idle ReadyForQuery does not by itself restore a previous session setting. [PostgreSQL 18 SET](https://www.postgresql.org/docs/18/sql-set.html).

## Gate implications and limits

The patch's added regression runs 20 rounds of concurrent `select $1::int as value` and `select current_setting('timezone') as timezone` through one postgres-js pool with maximum ten. It checks the numeric result and that timezone is a string. It does not cover conflicting named statements, independent session settings, portals, abort recovery, owner death, external bounded restart, durable state, either FindEg app or the historical Dashboard `25001`. Those gaps are visible in the [pinned regression source](https://github.com/electric-sql/pglite/blob/bb4e8b0797adb8a63e19ac66c423ae46c0d306fa/packages/pglite-socket/tests/query-with-postgres-js-concurrency.test.ts).

The selected experiment must stop at any material failure rather than adding virtualization or another semantic repair. Nothing in this source review explains the historical Dashboard error, accepts the candidate, establishes production exclusion or measures developer usefulness. No application code or dependency manifests were changed by this research.
