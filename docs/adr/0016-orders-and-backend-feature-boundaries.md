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

At the time this ADR is introduced, Orders is still implemented at `backend/src/features/order`. Its current public Backend entry and internal imports are a temporary bridge while the dependent extraction issues land. The lint rule allows the existing Orders implementation to reference Backend internals and allows current Backend sources to use relative imports into the legacy Order tree during this phase; consumer deep imports remain rejected. Once #366 extracts Orders, the package owner is checked strictly and both bridge allowances are removed. The checked-in compatibility baseline may contain unrelated pre-existing Backend feature violations only; it must not contain Orders violations at completion. No unrelated features are migrated as part of #364.

## Consequences

- Consumers have three intentional Orders imports, with every other package path rejected.
- Relative paths cannot bypass package exports and reach Orders implementation files.
- Orders dependency changes remain acyclic across production, test, and type-check graphs.
- Backend's other feature entries remain governed by ADR-0001 and stay usable during the incremental migration.
