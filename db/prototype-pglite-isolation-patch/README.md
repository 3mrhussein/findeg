# Disposable pinned PGlite Socket isolation experiment

**Measured result: the selected patch repairs the reduced concurrent unnamed-query collision, but fails the required persistent statement/session isolation gate. Recommend accepting this failed candidate and returning to architecture. Human evaluation is pending; the ticket remains open.**

Question: can the exact bounded upstream repair preserve FindEg's existing postgres-js/Drizzle seam without session virtualization or another semantic repair?

Context: [Evaluate the pinned PGlite Socket isolation patch against both apps](https://github.com/3mrhussein/findeg/issues/527), within [Map: Fast local development without Docker](https://github.com/3mrhussein/findeg/issues/518). Checked 2026-10-25, Africa/Cairo. Application baseline: `a4574376f34ad362487f89d2789b0504dbb9b9f4`. This directory is disposable evidence, not application implementation. No business code, production manifest, schema, pool setting or transaction configuration changed.

## Exact candidate

- Released control: PGlite `0.5.11`, Socket `0.2.14`, postgres-js `3.4.9`, Drizzle `0.45.4`.
- Candidate: only the implementation diff of upstream commit `bb4e8b0797adb8a63e19ac66c423ae46c0d306fa`, mechanically applied to released Socket source with `patch --fuzz=0`. [Original commit](https://github.com/electric-sql/pglite/commit/bb4e8b0797adb8a63e19ac66c423ae46c0d306fa), [archived port](upstream/released-to-candidate.diff), [source/build hashes](evidence/hashes.json).
- The full older pinned file is archived for comparison, but **is not the candidate**: replacing the whole release with it would remove unrelated SSL/CancelRequest/listen fixes. The queue/parser implementation diff applied without rejected hunks. No additional semantic repair was made.
- Its private `@electric-sql/pg-protocol` `0.0.4` workspace package is not published to npm. The exact pinned source is archived under `upstream/pg-protocol/src/`; a local development dependency builds it with pinned `@typescript/typescript6@6.0.2` (compiler reports `6.0.3`), erases types and supplies Node ESM extensions. This is dependency packaging, not a replacement parser. Original manifest and Apache license are retained.
- Fresh real PostgreSQL control: `16.14`, from development-only `@embedded-postgres/darwin-x64@16.14.0-beta.17`, running as a separate loopback server. This differs from the earlier historical PostgreSQL `16.15` control and is independently identified. All current control scenarios passed.

Primary-source analysis and current upstream status are in [source research](SOURCE-RESEARCH.md). The patch remains an unmerged evaluation candidate. No shipping fork or upstream contribution was selected.

## Reproduce

On this experiment's macOS x64 machine, Node `24.21.0`, pnpm `11.24.0`:

```sh
cd db/prototype-pglite-isolation-patch
pnpm install --ignore-workspace --ignore-scripts --prod=false --frozen-lockfile
NODE_ENV=development node prepare.mjs
NODE_ENV=development node run.mjs released patched
NODE_ENV=development node control.mjs
NODE_ENV=development node packaging.mjs
```

The local candidate matrix intentionally exits **1**, because compatibility assertions fail; that is the measured result. `control.mjs` and `packaging.mjs` exit **0**. The built candidate and parser output are generated/ignored; `prepare.mjs` checks its mechanical port against the archived candidate source before building. Upstream sources are intentionally not reformatted.

Each synthetic candidate worker uses a fresh in-memory engine and ephemeral loopback port. The parent enforces a declared **15-second process deadline per scenario**, including engine startup and cleanup. No scenario reached it. This bounds diagnostics only; it is not an automatic recovery implementation. Timings in evidence include process/WASM initialization and are not comparative startup/RAM evidence.

`control.mjs` creates a fresh, unmistakably disposable PostgreSQL cluster, probes it, stops it, and removes only its generated scratch directory. It restores the pinned binary package's normal relative-library symlinks because installation disables lifecycle scripts. PostgreSQL needed sandbox permission for system shared memory. No configured database or application data was changed. The configured local PostgreSQL endpoint and Docker daemon were unavailable; the fresh control avoids treating them as passing checks.

## Measured matrix

| Probe                                                                    | Released Socket                    | Patched Socket                        | PostgreSQL control                    |
| ------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------- | ------------------------------------- |
| Exact two-client Drizzle unnamed pair                                    | First round `08P01`                | 10/10 correct values                  | 10/10 correct values                  |
| Same pair, reversed invocation                                           | First round reverse `08P01`        | 10/10 correct values                  | 10/10 correct values                  |
| Parameterized traffic, two pools each max 10                             | First round `08P01`                | 10/10 rounds, all ten results correct | 10/10 rounds, all ten results correct |
| Named statement belongs to one frontend                                  | Failed: other frontend executes it | Failed: other frontend executes it    | Passed: `26000`                       |
| Independent frontends use same statement name                            | Failed: `42P05`                    | Failed: `42P05`                       | Passed, independent values 11/22      |
| Independent session timezone                                             | Failed: both read UTC              | Failed: both read UTC                 | Passed: Europe/Paris and UTC          |
| Concurrent read-only repeatable-read transactions, including a savepoint | 10/10 correct pairs                | 10/10 correct pairs                   | 10/10 correct pairs                   |

The named probe uses **identical raw Parse/Bind/Execute/Sync frames** against all three servers, including the real PostgreSQL control. The minimal frontend is for synthetic trust-auth endpoints only. Specifically:

1. Frontend A parses named statement `wf_same` as `select 11::int as value`, then Sync returns idle.
2. Frontend B binds/executes `wf_same` without having parsed it. Both Socket variants return **11 from A's statement**. PostgreSQL correctly returns `26000` (statement does not exist in B's session).
3. B parses its own `wf_same` as `select 22::int as value`. Both Socket variants reject it with `42P05` because A's statement occupies the shared engine's namespace. PostgreSQL accepts it; A then returns 11 and B returns 22 independently.

This is synthetic protocol state leakage, not a claim that a specific business workflow returned another user's rows. The conflicting-name/session checks are explicit gates in the selected experiment; no application-specific workaround was introduced to evade them. Likewise, timezone is a synthetic session-isolation control, not a claim that FindEg currently sets different timezones per client. The helper intentionally does not run any business query after the gate failure.

The result is consistent with source scope: ownership through idle ReadyForQuery protects one extended exchange, while persistent named statements and session settings remain on the one engine. Correcting that persistence would exceed the authorized queue/parser patch and cross the forbidden session-virtualization scope. This is the reason to return to architecture; it does not show that every PGlite integration seam fails.

## Validation and limits

- [Evidence](evidence/) archives all eighteen scenario results, synthetic protocol responses, exact expected/actual assertions, versions, durations and deadline status. The PostgreSQL control passed all six scenarios. Both Socket matrices intentionally fail the two state-isolation scenarios; only the released matrix also fails the three unnamed-query scenarios.
- All setup/control/compiler packages are this harness's `devDependencies`. An isolated production-only install omitted every one of them; all five executable entrypoints rejected production, test and unset runtimes before loading setup packages. [Packaging checks](evidence/packaging.json). This validates only the isolated harness, not either application's production composition/artifact.
- Harness JavaScript syntax, formatting and staged whitespace checks passed. The whitespace check excludes the two verbatim `.patch`/`.diff` artifacts, whose blank context lines retain their required leading space. The commit's automatic Prettier hook is skipped to preserve exact upstream source bytes; the authored harness/docs were checked explicitly. An initial missing private parser package and missing native-library symlinks were harness setup errors, corrected before the archived candidate/control runs; neither is classified as a candidate compatibility failure.
- **Stopped at the first compatibility gate.** The historical actual Dashboard `25001` remains unexplained; neither actual app was run in this experiment. The passing synthetic snapshot case does not explain or waive it. Original failed application/storage evidence remains untouched on its prior branch.
- Unrun here: actual app pools/startup/reconnect journeys; broader portals/failed-state/protocol/executor/disconnect probes; automatic restart and durable recovery; migration/seed/storage reruns; the complete two-app workflow/local Outbox/offline-image/restart matrix; application production-artifact exclusion; PostgreSQL integration/contention suites; whole-stack RAM/startup comparison. No lower-memory or faster-startup claim is made.

Under the ticket's stop condition, these failures are evidence for human evaluation before closing the experiment. Final storage/process selection remains blocked until the failed outcome is accepted and the next architectural route is charted. No broader transport repair, new driver, business-operation RPC or final architecture was implemented in this session.
