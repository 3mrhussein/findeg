# Disposable query-state diagnosis

Question: does the shared PGlite Socket host execute one client's unnamed Parse between another client's Parse and Bind, causing the observed `08P01`?

Context: [Choose how to preserve concurrent Drizzle queries after the shared PGlite Socket failure](https://github.com/3mrhussein/findeg/issues/526), within [Map: Fast local development without Docker](https://github.com/3mrhussein/findeg/issues/518). Checked 2026-10-25, Africa/Cairo. Application baseline: `a4574376f34ad362487f89d2789b0504dbb9b9f4`. Dependencies are pinned in this directory's manifest and lockfile and installed only as `devDependencies`.

## Result

**The observed engine-execution order establishes the unnamed-statement collision for this reproduction.** This extends the prior source-supported inference with an instrumented execution trace. It does not establish the separate Dashboard `25001` cause, validate an upstream fix, select final storage or prove all workflows compatible.

| Probe | Result |
| --- | --- |
| Uninstrumented concurrent Drizzle pair, two clients each `max: 1` | First pair fails `08P01`: client A supplies one parameter to the statement requiring two |
| Same pair with observational tracing | Same error; engine trace identifies the intervening client B Parse |
| Reverse query invocation order | First pair fails in the opposite direction: client B supplies two parameters to the statement requiring one |
| Identical queries issued serially, with tracing | All 10 rounds return the expected 11 and 22 |
| Production-only isolated installation | All four diagnostic packages absent |
| Copied script without installed diagnostic packages; production/test/unset runtime | Exit 2 with the runtime guard, before dependency loading |

The relevant actual engine-execution sequence is:

```text
handler A: Parse unnamed "select $1::int as value"
handler A: Describe / Flush
handler B: Parse unnamed "select $1::int + $2::int as value"
handler B: Describe / Flush
handler A: Bind unnamed, 1 parameter
engine -> A: ErrorResponse 08P01, statement requires 2 parameters
handler A: Execute / Sync -> ReadyForQuery idle
handler B: Bind unnamed, 2 parameters / Execute / Sync -> value 22
```

Both Bind frames have the expected parameter counts for their own original SQL. Reversing the order reverses the collision, while serial execution passes. Together these controls support cross-client unnamed-state replacement rather than an intrinsically invalid query or miscounted Bind frame. They do not prove the absence of other transport defects.

The PostgreSQL protocol specifies that a subsequent unnamed Parse replaces the unnamed prepared statement. The released Socket queue holds exclusivity around individual messages, rather than a complete extended-query exchange. [PostgreSQL 18 extended-query protocol](https://www.postgresql.org/docs/18/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY), [released Socket source](https://unpkg.com/@electric-sql/pglite-socket@0.2.14/src/index.ts).

## Reproduce

From this directory:

```sh
pnpm install --ignore-workspace --ignore-scripts --prod=false --frozen-lockfile
NODE_ENV=development node trace.mjs
NODE_ENV=development node trace.mjs --trace
NODE_ENV=development node trace.mjs --serial --trace
NODE_ENV=development node trace.mjs --reverse --trace
```

Concurrent commands intentionally exit 1 on the reproduced incompatibility. The serial command exits 0. A 15-second watchdog bounds the diagnostic process; this watchdog is not a production recovery implementation. Each run uses a fresh in-memory engine and synthetic SELECTs, opens only loopback ephemeral ports, and closes clients, host and engine. It neither reads application credentials nor modifies an existing database.

Tracing observes the version-pinned queue's enqueue/log methods and the engine's protocol execution entry, forwarding the original calls without adding scheduling waits or changing transport ownership. Startup recording is disabled; recorded SQL and errors concern only the synthetic statements. Backend response chunks are decoded only when complete; a partial frame is explicitly labelled. The archived failure trace contains complete relevant error/status frames. Private field access is deliberately confined to this disposable diagnostic and is not an application interface proposal.

Machine-readable snapshots are in [evidence](evidence/). The serial snapshot retains result assertions rather than its repetitive trace. Dependency source hashes and versions are archived. Working output and installed modules are ignored.

## Development runtime and packaging

The runtime guard runs before dynamic imports of every diagnostic package. The manifest contains no production `dependencies`; PGlite, Socket, postgres-js and Drizzle are all `devDependencies` of this isolated harness. The latter two remain production dependencies in the actual application where they are genuinely needed; their classification here applies only to this standalone diagnostic.

The packaging check copied the manifest, lockfile and script into a temporary directory outside the repository, ran a pinned pnpm 11.24.0 production-only installation, verified all four packages were absent, and invoked the script with production, test and unset runtimes. All were rejected with the expected guard before package loading. [Recorded checks](evidence/runtime-packaging-checks.json).

This verifies the diagnostic harness's packaging and guard only. It does not verify either application's final production build or deployed artifact. The selected experiment must retain the development-only constraint throughout app composition and prove final production exclusion separately.

## Limits and next decision

No upstream patch or driver change was applied. No application code, production manifests, schema, business rules or transaction settings changed. The earlier known-passing storage checks remain evidence, not a waiver of real two-app workflows and recovery. This run did not rerun the local PostgreSQL control; the [prior exact control](https://github.com/3mrhussein/findeg/blob/b5193f9219bf5ad3bd0523bf8b197a5773c0c983/db/prototype-pglite/README.md) remains separately identified evidence.

The human selected a bounded evaluation of the inspected upstream isolation patch and allowed externally bounded automatic owner restart subject to committed-data durability, uncommitted-work rollback, visible request failure, explicit uncertain outcomes and no blind retries of non-idempotent writes. That evaluation is a separate experiment ticket, not a completed result of these diagnostics. The separate `25001`, additional statement/session state, real workflows, recovery and aggregate RAM/startup remain required proof gates.
