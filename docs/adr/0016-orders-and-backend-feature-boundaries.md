---
status: accepted
---

# Record and enforce the Orders package boundary

> Amended by [ADR-0020](0020-domain-single-source-and-bounded-context-packages.md): the accepted target is bounded-context application packages with root/types exports, derived from Domain, and Backend infrastructure/composition. The historical feature/schema entry contracts below remain transitional until coordinated consumer migration. The client-safe barrel splitting and custom client-boundary checks described below are superseded; Next.js owns the server/client boundary.


ADR-0001 gives other Backend features explicit public entries, but it does not yet describe the extracted Orders package or the dependency direction between Backend features. This decision records the Orders graph from #361 and adds lint enforcement at import sites.

```text
Dashboard / Storefront / Backend -> @findeg/orders
@findeg/orders -> @findeg/domain, @findeg/domain-errors, @findeg/db
@findeg/db -> @findeg/env
Backend Outbox worker -> @findeg/orders, @findeg/db/queries/outbox
```

Orders publishes exactly `@findeg/orders` and `@findeg/orders/types` after #443 phase 2. The root entry owns the server factory, typed errors, permission checks, input schemas and pure Order-status message protocol. The types entry contains no runtime values. Business values, transition tables and rules come from `@findeg/domain` (ADR-0018). Internal directories are never public entries. Orders cannot import Backend, Dashboard, Storefront, UI, or Next, including type-only imports or development dependencies. Backend notification delivery consumes the root protocol exports; Orders does not own delivery.

The shared ESLint policy checks static imports, re-exports, dynamic imports, `require`, and TypeScript import types. It rejects deep package aliases and relative filesystem imports that target Orders internals. The same rule checks both Next.js consumers and Backend. Package `exports` is the runtime/module-resolution backstop; package graph checks include runtime, optional, peer, and development dependencies so type/test edges cannot hide cycles.

## Completed migration

#366 extracts the implementation to `packages/orders`; #367 migrates Dashboard and complete Cairo statistics; #368 removes Backend Order adapters, `createOrderServices`, numeric aliases and Administration forwarding services. Storefront authenticates Customers and checks ownership before exposing detail, lists by the trusted session Customer ID, and composes current Identity profile contacts with Order-owned latest shipping address. Orders has no Identity/session dependency.

The factory resolves its default DB lazily; an injected DB never loads the default connection. Stock settlement uses a narrow DB producer entry with lazy optional-transaction plumbing, and Outbox enqueue uses the connection-free producer entry. Commands atomically lock and commit stock effects, deduplicated enqueue, metadata and actor audit. Same-status calls are complete no-ops. One mapper reads canonical decimal snapshots as domain Money, preserving nullable product IDs. Order Acceptance stores the net subtotal; displays add the snapshotted discount back for a gross subtotal before displaying the discount separately.

Cross-domain PostgreSQL suites remain in Backend (`src/testing/orders`); Acceptance/stock primitives remain at Checkout. Actual Orders export maps resolve tests and app types without Orders source aliases. Unrelated pre-existing Backend source aliases remain for other feature migration; lint and explicit null Backend Order exports reject the removed entries.

Both app build scripts inspect source-mapped client module identities, reject environment/DB infrastructure, then remove browser maps before startup. Next bundles TypeScript workspace server entries rather than externalizing raw package source; Next.js enforces server/client boundaries through app query `server-only` imports. Client validation facades derive schemas from the canonical Domain values so unrelated forms do not reach the Orders factory. Domain rules, Money included, remain pure.

## Consequences

- Consumers use only the root runtime and types entries for Orders and Domain; all former schema, event and bounded-context subpaths are rejected.
- The temporary three-entry contract is superseded by the root/types policy from #434 and the Domain derivation decision in #464. Next.js enforces server/client boundaries in app queries; package root filenames do not determine client safety.
- Relative paths cannot bypass package exports and reach Orders implementation files.
- Orders dependency changes remain acyclic across production, test, and type-check graphs.
- Backend's other feature entries remain governed by ADR-0001 and stay usable during the incremental migration.

## Amendment: the domain edge

Decided in [#402](https://github.com/3mrhussein/findeg/issues/402), alongside ADR-0018.

- **`@findeg/domain` replaces `@findeg/money` in the Orders graph.** The domain owns Money and the pure Order rules: the transition tables, Order Acceptance, the joint Refund, the Stock Reservation effects and the Order Reference. Orders keeps the commands, persistence, Outbox enqueue, Staff access checks, input validation, idempotency and the Confirmation digest.
- **Orders holds input schemas only, now exported from `@findeg/orders`.** Status options, transition helpers and display labels no longer live there: the values and transitions come from the domain, and labels belong to the UI.
- **Same-status calls stay complete no-ops** for Order and payment status. The domain functions report `changed: false`, and Orders then writes, enqueues and audits nothing.
- The #399 switch-over has landed; Orders derives Money and rules from `@findeg/domain`.
