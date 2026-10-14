# Orders

`createOrders({ db?, now? })` owns Order reads and Staff lifecycle commands. Construction is connection-free. Injected operations use only the supplied database; a default first operation loads `@findeg/db/connection` lazily.

- `get`, `list`, `listForCustomer`, `recent`, `detail` and `latestShippingAddress` return historical Order data. Reads are ungated here; apps authenticate and enforce Customer ownership at their edges.
- `changeStatus`, `changePaymentStatus` and `refund` authorize and validate before database resolution. Each locks the Order and commits its metadata, stock effects, durable notification and actor audit together. Reapplying the current status changes nothing.
- Order and line amounts are bigint piasters from canonical stored decimals. Deleted products retain a null product ID and their historical snapshots.
- `getStats({ from?, to?, trendDays?, topProductsLimit? })` returns exact accepted-value revenue across all statuses, zero-filled Cairo calendar trends and current catalog top products from historical line totals. Inclusive date keys use PostgreSQL DST conversion. Options validate before database resolution; all aggregates share one read-only repeatable-read snapshot. Defaults are 30 trend days and five top products.

Public entries are `@findeg/orders` (factory, errors, permission, input schemas and notification protocol) and `@findeg/orders/types` (types only). Area, schema, event, helper and source subpaths do not resolve. The root loads without application configuration. Client validation facades derive schemas from Domain values; server app queries enforce their boundary with `server-only`. Notification rendering and delivery remain in Backend Outbox; Checkout owns Acceptance. See ADR-0016 for dependency direction. Backend and both apps consume these public entries directly; there are no Backend Order adapters.

Unit tests run here, in local `__tests__` directories beside each feature. Database-bound features run against a scripted, test-only client injected through the factory, so this package measures without PostgreSQL. Real PostgreSQL tests live in Backend and use the public factory, keeping the integration harness outside this package.

Business status values and rules come from `@findeg/domain`; this package exports no status lists, transition tables or display labels. Source is organised as `src/` with root `index.ts`, `types.ts`, `helpers.ts` and named modules directly under `features/` (see `configs/eslint/rollout.md`, #443). The public entries are `.` and `./types`.

Cancelling a shipped Order requires `parcelBackInWarehouse: true` in the status input. Payment becomes paid only after delivery. `refund(actor, id)` atomically refunds a delivered, paid Order and its payment, records Staff, and sends no Customer email. Ordinary status changes to `refunded` use the same atomic Refund rule. Repeated Refund and same-status Order/payment changes preserve metadata, timestamps, history and the Outbox.
