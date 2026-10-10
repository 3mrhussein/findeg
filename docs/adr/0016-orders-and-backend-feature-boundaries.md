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

## Completed migration

#366 extracts the implementation to `packages/orders`; #367 migrates Dashboard and complete Cairo statistics; #368 removes Backend Order adapters, `createOrderServices`, numeric aliases and Administration forwarding services. Storefront authenticates Customers and checks ownership before exposing detail, lists by the trusted session Customer ID, and composes current Identity profile contacts with Order-owned latest shipping address. Orders has no Identity/session dependency.

The factory resolves its default DB lazily; an injected DB never loads the default connection. Stock settlement uses a narrow DB producer entry with lazy optional-transaction plumbing, and Outbox enqueue uses the connection-free producer entry. Commands atomically lock and commit stock effects, deduplicated enqueue, metadata and actor audit. Same-status calls are complete no-ops. One mapper reads canonical decimal snapshots as bigint piasters, preserving nullable product IDs. Order Acceptance stores the net subtotal; displays add the snapshotted discount back for a gross subtotal before displaying the discount separately.

Cross-domain PostgreSQL suites remain in Backend (`src/testing/orders`); Acceptance/stock primitives remain at Checkout. Actual Orders export maps resolve tests and app types without Orders source aliases. Unrelated pre-existing Backend source aliases remain for other feature migration; lint and explicit null Backend Order exports reject the removed entries.

Both app build scripts inspect source-mapped client module identities, reject Orders server implementation and environment/DB infrastructure, then remove browser maps before startup. Next bundles TypeScript workspace server entries rather than externalizing raw package source; pure schemas/events and exact Money are safe client imports.

## Consequences

- Consumers have three intentional Orders imports, with every other package path rejected.
- Relative paths cannot bypass package exports and reach Orders implementation files.
- Orders dependency changes remain acyclic across production, test, and type-check graphs.
- Backend's other feature entries remain governed by ADR-0001 and stay usable during the incremental migration.
