# Orders

`createOrders({ db?, now? })` owns Order reads, activity, statistics and authorized Staff transitions. The default database is resolved on first use; an injected database does not initialize the default connection or require application environment configuration.

```ts
const orders = createOrders({ db: testDatabase });
const detail = await orders.detail(orderId);
await orders.changeStatus(actor, orderId, { status: 'shipped', trackingNumber: 'TRACK-1' });
```

The interface exposes `get`, `list`, `listForCustomer`, `recent`, `detail`, `latestShippingAddress`, `getStats`, `changeStatus` and `changePaymentStatus`. Customer/session authorization stays at the app edge; Orders checks Staff write permission before database access or locking. The Storefront combines the latest shipping snapshot with its authenticated profile.

A lifecycle command locks the Order and performs stock settlement, the update, notification enqueueing and audit insertion in one transaction. Payment commands use the same Order lock and atomic audit. Unknown statuses are rejected. Reapplying the current status is a complete no-op, including supplied tracking or notes. Cancellation releases reservations, delivery consumes them, and refund does not restock (ADR-0005). Outbox delivery remains at least once with provider deduplication (ADR-0008).

All Order amounts are bigint piasters from canonical stored snapshots, including line discounts and charged line totals. Migration 0015 backfilled historic price fields; zero-valued prices are valid. Pure conversions are available through `@findeg/backend/features/core/money`. UI values/schemas use the client-safe `order/schemas` entry point.

Statistics expose Order totals, counts by status, today's totals, daily trends and top products. `from`/`to` are inclusive Cairo calendar dates; list filters use the same calendar contract. Defaults are lifetime totals and the latest 30 calendar days of trends. Monetary aggregates remain exact. “Revenue” preserves the existing accepted Order value across all statuses, including cancelled/refunded Orders; it is not realized revenue. Top products retain the current catalog-name/inner-join projection, excluding deleted products. The system's Order currency is EGP.

Checkout continues to own Order Acceptance. Its lower-level database/stock transaction tests remain because the Orders interface does not expose acceptance. Cross-feature imports use public entries under ADR-0016; the legacy administration Order implementation and duplicate mappers have been removed. Extracting packages is a later step after this interface is established.
