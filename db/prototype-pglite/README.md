# Throwaway shared PGlite prototype

**Verdict: the tested shared Socket configuration failed compatibility.** The driving developer accepted this outcome and a return to the architecture decision on 2026-10-25 (Africa/Cairo). This branch is disposable evidence; it is not an implementation of the fast development mode.

Question: can one durable PGlite Socket host preserve FindEg's existing postgres-js/Drizzle operations while Storefront and Dashboard run as separate processes?

Context: [Prototype a shared PGlite host through FindEg's current SQL seam](https://github.com/3mrhussein/findeg/issues/524), within [Map: Fast local development without Docker](https://github.com/3mrhussein/findeg/issues/518). Application baseline: `a4574376f34ad362487f89d2789b0504dbb9b9f4`. Candidate: PGlite `0.5.11`, Socket `0.2.14`, postgres-js `3.4.9`, Drizzle `0.45.4`. Machine: macOS `26.7.1`, x64, Node `24.21.0`, pnpm `11.24.0`.

## Reproduce

From this worktree:

```sh
pnpm prototype:pglite
pnpm prototype:pglite:protocol
```

The first command installs the isolated pinned candidate dependencies and, if needed, database workspace dependencies. It resets only `db/prototype-pglite/.scratch/PROTOTYPE-wipe-me`, runs the actual init/migration/seed entrypoints, and prints each storage check. It refuses to reset data owned by an app helper. `.scratch` is ignored and contains only disposable data/logs.

The second command is the minimal **expected failing** compatibility reproduction: two independent clients, each with pool maximum one, concurrently execute these through the installed Drizzle driver:

```sql
-- Client A, one parameter: expected value 11
select $1::int as value;
-- Client B, two parameters: expected value 22
select $1::int + $2::int as value;
```

PGlite Socket fails the first round with `08P01`: `bind message supplies 1 parameters, but prepared statement "" requires 2`. The candidate reports PostgreSQL engine version `18.6`. The same script and client options against the configured local PostgreSQL `16.15` server passed 10/10 rounds, returning 11 and 22. The script checks both errors and incorrect values. `PROTOTYPE_POSTGRES_URL` explicitly selects an existing PostgreSQL endpoint for this **read-only** control; the artifact never creates or mutates baseline tables. No endpoint or credentials are archived.

`node db/prototype-pglite/protocol-repro.mjs --raw` reproduces the same failure through postgres-js `unsafe`, the interface used by Drizzle's installed session implementation. This reduction contains no app, schema, cache, email-provider, fixture, or transaction code. Limiting each client's pool to one does not resolve it.

To inspect the actual apps after initializing scratch data:

```sh
pnpm prototype:pglite:apps
```

This starts one file-backed host plus Storefront at `http://127.0.0.1:3140/en` and Dashboard at `http://127.0.0.1:3141/en/login`. Both receive the same scratch URL and explicit pool maximum two. Stop the command before rerunning the storage gate. The supervisor owns an exclusive state lock and stops its child apps on failure or shutdown. These are prototype commands, not the final developer interface.

Seeded Customer: `user@findeg.com`; Staff: `admin@findeg.com`; both use the existing seed password `password123`. These are disposable fixture credentials. Prototype signing keys are visibly local-only, and live email credentials are cleared. The local capture provider writes generated messages to ignored scratch storage; its delivery/failure/retry behavior remains unverified because the app compatibility gate failed first.

## Observed results

| Check | Result |
| --- | --- |
| Existing `uuid-ossp` init and historical migrations | Passed all 21 migrations through the existing migrator |
| Actual seed and repeat reset | Passed twice; 8 users, 229 Products, 229 Product Variants, 1 Order |
| Raw numeric/JSONB/arrays and schema Date/Money mapping | Passed, including exact `0.30` and canonical `30n` |
| Managed seed sequences | Allocations advanced beyond existing maxima; empty-table starts checked |
| Unique error and constraint name, frozen Order snapshot, savepoints, outer rollback | Passed |
| Tagged parameterized requests from two clients | Passed 10 rounds; this alone missed Drizzle's unnamed-query failure |
| Transaction-owner disconnect between statements | Owner write rolled back; queued peer continued and committed |
| Host restart | Seeded Products and committed peer edit persisted; aborted owner edit remained absent |
| Query interruption | Unsupported in the observed probes; accepted only for this prototype |
| Real Storefront | Home and login rendered; seeded Customer signed in and My Account appeared |
| Real Dashboard | Login rendered; wrong password rejected; Customer rejected as non-Staff; Staff authenticated |
| Dashboard after Staff sign-in | Failed analytics: `25001` for repeatable-read/read-only transaction configuration, plus `08P01` unnamed prepared-statement parameter mismatch |
| Reduced two-client Drizzle check | Failed `08P01` immediately on a clean in-memory candidate; local PostgreSQL control passed 10/10 |

The reduction establishes a multi-client extended-query incompatibility in this tested version/configuration. It does not prove that every PGlite integration seam fails, nor independently explain the separate `25001` application error.

**Source-supported inference:** Socket's released implementation queues individual protocol messages over one engine. PostgreSQL's unnamed prepared statement is replaced by a later unnamed Parse; Bind must match that statement's parameters. Interference between clients' extended-query state is consistent with the reproduced error. No packet-level instrumentation or upstream fix was attempted. [Released Socket implementation](https://unpkg.com/@electric-sql/pglite-socket@0.2.14/src/index.ts), [PostgreSQL extended-query protocol](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY).

The independent-process interruption probe requested cancellation at approximately 50 ms during a 500 ms statement. The statement completed after approximately 502 ms, and its peer progressed afterwards. A separately configured `statement_timeout=50ms` allowed a 500 ms completion without `57014`. Both finite completion/recovery and absent interruption are recorded. The strict standalone probe still asserts the PostgreSQL timeout contract by default; the storage runner explicitly records the human-accepted capability gap. It does not turn interruption into a passing claim. [Accepted continuation](https://github.com/3mrhussein/findeg/issues/524#issuecomment-6390243003), [PostgreSQL timeout semantics](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-STATEMENT-TIMEOUT).

## Evidence and limits

The archived JSON files in [evidence](evidence/) retain storage checks, independent interruption results, and the reduced PGlite/PostgreSQL comparison. The storage-gate snapshot predates the real-app checks, so its `unrun` list describes that stage. The table above records subsequent app observations. Screenshots show Customer sign-in and the Dashboard error. Neither scratch database files nor generated email messages, tokens, environment files, or credentials are committed.

The only app composition changes are the prototype pool limit, an app-layer cache miss policy, the existing EmailProvider seam selecting local capture, and host/app lifecycle. They contain no alternate business responses. The reduced failure imports none of them, ruling them out as its cause. The temporary cache policy follows the installed Next.js `cacheHandlers` contract and is not a production recommendation.

Remaining journeys were **not run after the material app failure**: Dashboard edits and next-refresh Storefront visibility; profile changes; checkout/reconfirmation/idempotency/stock rollback and Order Status effects; School Supply List lifecycle/checkout; Business Partner invitation/membership/report journeys; English/Arabic search and full analytics; actual local Outbox delivery/failure/timed retry/manual drain; offline sample images; and a structured restart test of either real app. Disconnect during an in-flight statement was not established by the between-statements owner test. No full-workflow compatibility is claimed.

RAM/startup comparison was **unrun**. The human required both lower whole-stack RAM and faster startup against the same baseline. Storage-step timings are diagnostic durations, not evidence for that requirement. Production PostgreSQL integration/contention suites were left unchanged and were not run here; the read-only SQL control is not a substitute for them.

Environment-only validation workarounds: database dependencies installed from the frozen workspace lock; app installation hit unavailable/timeout registry artifacts, so matching already-installed Next/SWC/lucide payloads and workspace dependency links were reused inside this worktree. A writable temporary `SWC_NATIVE_BINDING_CACHE` and filesystem-watcher permissions were needed to run the real Next dev servers. Those settings and generated dependency links are not committed and do not establish clean-machine setup performance.

An initial raw timestamp assertion was corrected against the installed Drizzle driver: raw timestamps are strings; schema-selected timestamps decode to Dates. That harness mistake is excluded from the candidate verdict.

The helper and both app processes were stopped after evidence capture. The next decision must choose whether a bounded, verified transport repair is worth maintaining or a different shared-owner seam is needed. This prototype did not patch the socket/driver, weaken transaction guarantees, or select final storage.
