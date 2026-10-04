---
status: accepted
---

# Atomic COD Order Acceptance

> **Amended by ADR-0013:** Order Acceptance writes no rewards (no rate, valuation or entitlement); only the attribution snapshot remains. ADR-0012: acceptance never checks Business Partner Status.

> **Amended (pre-delivery refunds):** `refunded` follows only `delivered`; an Order stopped before delivery is `cancelled`, including after `shipped`, and releases its reservation. See the Amendment below.

Main has no working checkout: the storefront calls `/api/v1/checkout/{validate,order}` routes that don't exist, the Cart is an in-process `Map`, cart totals use client-held prices, and `orderQueries.create`/`reserveStock` each open their own transaction so they cannot be combined. `develop` (reference only) accepts COD orders in one transaction through a `TransactionRunner` port, a separate immutable `accepted_orders` snapshot, guest-only checkout, and a cart-row lock for idempotency. We adopt develop's _guarantees_ (one transaction, re-quote under locks, reserve-at-accept, idempotent replay) but build them on main's existing order, inventory, and session model rather than lifting develop's structure. The research file lives on branch `research/cod-checkout-idempotency`, not on main.

This ADR fixes the **Order Acceptance seam** that the Partner Rewards design (next ADR) hooks into.

## Decisions

**One order model.** `sales.orders`/`order_items` evolve in place rather than gaining a parallel `accepted_orders` table: snapshot columns (unit price, line total, currency, discounts, shipping cost, attribution) are written at acceptance and frozen by a service check backstopped by a Postgres trigger (the ADR-0004 pattern). `status`/`paymentStatus` remain the mutable lifecycle. The Dashboard's order screens keep reading one table.

**Transaction seam: tx-aware queries plus a thin `checkout` feature.** `backend/db` query functions that participate in acceptance (`orderQueries.create`, `reserveStock`, idempotency, later rewards) take an optional `tx` argument. A new `checkout` feature opens `db.transaction` and threads it through `order`, inventory, and (later) rewards writes. No `TransactionRunner` port for now; one orchestrator doesn't justify the abstraction, and it can be promoted later if a second appears. `backend/db` stays framework-agnostic.

**Stateless, re-quoted checkout for guests and signed-in Customers.** The client posts its cart lines; the server re-quotes under `FOR SHARE` locks on variants and never trusts client prices. No persistent server cart is built for this. Signed-in orders set `userId`; guest orders set `guestEmail`.

**Quote and Confirmation.** `/checkout/validate` returns a Quote: lines, unit prices, discounts, shipping cost, total, currency, and a `confirmation` digest over all of them. Acceptance re-quotes; if the digest differs it returns 409 `reconfirmation-required`. The re-quote is the single place discounts are computed. Phase-one shipping is a flat configured fee (no delivery zones).

**Idempotency.** Key in the `Idempotency-Key` header. A `sales.checkout_idempotency` row with unique `(scope, key)`, where scope is `user:<id>` or `guest:<guestId>` (main's existing guest token), extended with the list's public code for List checkouts. The row is inserted first inside the acceptance transaction, so the unique constraint serializes concurrent retries; on rollback it vanishes and a retry proceeds. The fingerprint covers normalized lines, address, payment method, delivery method, and `confirmation`. The saved outcome is checked **before** re-quoting: a match replays the stored receipt (Order Reference, status, totals) with 201; a fingerprint mismatch returns 409 `idempotency-conflict`. Only successful outcomes persist; rows are retained 24h.

**Stock: reserve at acceptance, consume at delivery.** Balances are locked `FOR UPDATE` in deterministic variant→warehouse order and filled greedily across warehouses; each allocation writes an immutable per-order reservation row `(order, variant, warehouse)` plus a `stock_movements` row. `CHECK (on_hand >= reserved AND reserved >= 0)` is the database backstop. Insufficient stock rolls the whole order back with 409 `insufficient-stock` (affected variants and available quantities); no partial acceptance, no backorder.

**Status transitions own stock effects.** Every status change, including Dashboard bulk actions, goes through one `transitionOrderStatus` in the `order` feature with an explicit allowed-transitions table (e.g. nothing returns to `pending`). `delivered` consumes the reservation (`on_hand -= n`, `reserved -= n`); `cancelled` before delivery releases it (`reserved -= n`); `refunded` has no automatic stock effect (physical restock is a manual inventory adjustment). Effects are append-only movements in the same transaction, idempotent per (order, transition). Accepted orders enter as `pending`; Order Acceptance is the atomic moment, not a status value.

**Order Reference.** Every order gets a public, opaque, human-readable reference (`FE-` plus 6 characters, e.g. `FE-7K3Q9M`, unique index), read aloud to couriers and support. It is not a secret; guest order access will require a separate code.

**List checkout.** An order is either ordinary or from exactly one School Supply List, never mixed. Attribution is per order: list id, `publicCode`, the published list version, and the Partner School's `businessPartnerId` are snapshotted on the order; each line records its list item and whether it was the exact item or a specification-eligible substitute. Acceptance verifies the list is `published` and each variant eligible per ADR-0004. Reward rate and valuation are written at this same point by the Partner Rewards design.

**No side effects inside the transaction except rows.** Confirmation and admin status emails stay post-commit best-effort until a transactional outbox is designed; that design (and guest order access, which depends on emailing a code) is a separate decision.

## Considered options

- **develop's separate `accepted_orders(snapshot jsonb)`**: clean immutability, but two order models and a Dashboard rewrite. Rejected for evolving `sales.orders` with a freeze trigger.
- **`TransactionRunner` port (develop)** or **one `order` repository writing every table**: the first is premature with a single orchestrator; the second makes `order` own inventory and rewards tables. Rejected for tx-threaded queries.
- **Persistent server cart as the lock target (develop)**: requires building a durable cart only for atomicity. Rejected; the idempotency row serializes retries instead.
- **Decrement `on_hand` at acceptance**: simpler, but COD orders often fail at the door, which would make the physical count wrong until re-incremented. Rejected.
- **Idempotency keys kept forever (develop)**: the order is the durable record; the key is only a retry guard.

## Consequences

- `reserveStock` and `orderQueries.create` change signature to accept a transaction; existing callers (none today) are unaffected.
- `AdminOrderService` status updates must be rerouted through `transitionOrderStatus`, or they will bypass stock release/consumption.
- `sales.orders` and `sales.order_items` freeze triggers permit foreign key `ON DELETE SET NULL` transitions (`user_id -> NULL` on user account deletion, `product_id/variant_id -> NULL` on catalog item purge), while strictly freezing all snapshot and price data. Orders and order items are permanent append-only records; deletion of orders (with or without child items) and order items is strictly forbidden at the table level by `freeze_order_snapshots` and `freeze_order_items`.
- Idempotency tracking via the `Idempotency-Key` header and replay verification is implemented by issue #239 ("Idempotent Order Acceptance"). Guest orders sent without an `X-Guest-Id` token (direct API callers) fall back to scope `guest:<guestEmail>`.
- List Offer pricing, delivery zones, the transactional outbox, and guest order access are left open; each adds an input to the Quote or a row to the acceptance transaction without changing this seam.

## Amendment: no refund before delivery

The allowed-transitions table let `processing` and `shipped` move to `refunded`, which has no stock effect, so an Order refunded before delivery kept its Stock Reservation forever. `shipped` also had no path to `cancelled`, so a parcel refused at the door could only end as `refunded`.

- **`refunded` only follows `delivered`.** Phase one is cash on delivery, so before delivery no money has been collected and there is nothing to refund. Stopping an Order before delivery is always a Cancellation. Since ADR-0013, rewards no longer tell the two statuses apart, so a pre-delivery `refunded` would only be a mislabelled `cancelled`.
- **`shipped → cancelled` is allowed** and releases the reservation (`reserved -= n`) like any pre-delivery cancel. Staff cancel a shipped Order only once the parcel is back in the warehouse, so the released units really are available. There is no `returning` status. A parcel that never comes back is still cancelled, and its loss is recorded as a manual inventory adjustment.
- **`delivered → refunded` is unchanged:** no automatic stock effect, physical restock stays a manual adjustment.
- **`paymentStatus` is untouched:** it has no stock effect, and nothing ties it to delivery.

The resulting table: `pending → confirmed | cancelled`, `confirmed → processing | cancelled`, `processing → shipped | cancelled`, `shipped → delivered | cancelled`, `delivered → refunded`; `cancelled` and `refunded` are terminal. Phase-one checkout is not live, so no existing Order sits in `refunded` without delivery and no data migration is needed.

Alternatives rejected: having a pre-delivery `refunded` release stock (two statuses with the same meaning, and the stock effect would depend on the source status), and leaving the reservation held for a manual fix (the current leak).
