# Orders

`createOrders({ db?, now? })` owns Order reads and Staff lifecycle commands. Construction is connection-free. Injected operations use only the supplied database; a default first operation loads `@findeg/db/connection` lazily.

- `get`, `list`, `listForCustomer`, `recent`, `detail` and `latestShippingAddress` return historical Order data. Reads are ungated here; apps authenticate and enforce Customer ownership at their edges.
- `changeStatus` and `changePaymentStatus` authorize and validate before database resolution. Each locks the Order and commits its metadata, stock effects, durable notification and actor audit together. Reapplying the current status changes nothing.
- Order and line amounts are bigint piasters from canonical stored decimals. Deleted products retain a null product ID and their historical snapshots.
- `getStats({ from?, to?, trendDays?, topProductsLimit? })` returns exact accepted-value revenue across all statuses, zero-filled Cairo calendar trends and current catalog top products from historical line totals. Inclusive date keys use PostgreSQL DST conversion. Options validate before database resolution; all aggregates share one read-only repeatable-read snapshot. Defaults are 30 trend days and five top products.

Public entries are the server factory/types/errors at `@findeg/orders`, client-safe schemas/options at `@findeg/orders/schemas`, and the pure notification protocol at `@findeg/orders/events`. Notification rendering and delivery remain in Backend Outbox; Checkout owns Acceptance. See ADR-0016 for dependency direction and the temporary Backend adapters removed by #368.

Unit tests run here. Real PostgreSQL tests live in Backend and use the public factory, keeping the integration harness outside this package.
