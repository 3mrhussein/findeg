---
status: accepted
---

# Record and enforce the Orders package boundary

ADR-0001 gives other Backend features explicit public entries, but it does not yet describe the extracted Orders package or the dependency direction between Backend features. This decision records the Orders graph from #361 and adds lint enforcement at import sites.

```text
Dashboard / Storefront / Backend -> @findeg/orders
@findeg/orders -> @findeg/money, @findeg/domain-errors, @findeg/db
@findeg/db -> @findeg/env
Backend Outbox worker -> @findeg/orders/events, @findeg/db/queries/outbox
```

Orders publishes exactly `@findeg/orders`, `@findeg/orders/schemas`, and `@findeg/orders/events`. The root entry owns the server factory, types, and typed errors. `schemas` contains only pure UI-safe schemas and options. `events` contains the pure Order-status message protocol. Internal directories are never public entries. Orders cannot import Backend, Dashboard, Storefront, UI, or Next, including type-only imports or development dependencies. Backend notification delivery consumes the pure `events` entry; Orders does not own delivery.

The shared ESLint policy checks static imports, re-exports, dynamic imports, `require`, and TypeScript import types. It rejects deep package aliases and relative filesystem imports that target Orders internals. The same rule checks both Next.js consumers and Backend. Package `exports` is the runtime/module-resolution backstop; package graph checks include runtime, optional, peer, and development dependencies so type/test edges cannot hide cycles.

## Migration phase

#366 extracts the server implementation to `packages/orders`. Public Backend Order entries and numeric DTO adapters remain temporarily for existing consumers, with one canonical package implementation. #367 migrates Dashboard, and #368 removes the remaining adapters, `createOrderServices`, and legacy types. Cross-feature relative access to the old Order tree is now rejected; callers must use a public entry. Orders has no Backend dependency or boundary exceptions.

The factory resolves its default DB lazily; an injected DB never loads the default connection. Stock settlement uses a narrow DB producer entry with lazy optional-transaction plumbing, and Outbox enqueue uses the connection-free producer entry. Status/payment commands lock the Order and commit stock effects, deduplicated notification enqueue, metadata and actor audit atomically. Same-status calls are complete no-ops. One mapper reads canonical decimal snapshots as bigint piasters, preserving nullable product IDs. Complete Cairo statistics follow in #367.

## Consequences

- Consumers have three intentional Orders imports, with every other package path rejected.
- Relative paths cannot bypass package exports and reach Orders implementation files.
- Orders dependency changes remain acyclic across production, test, and type-check graphs.
- Backend's other feature entries remain governed by ADR-0001 and stay usable during the incremental migration.
