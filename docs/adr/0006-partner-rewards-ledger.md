---
status: proposed
---

# Partner Rewards ledger

Partner Schools earn Partner Points on School Supply List orders. Main has no partner, rate, or reward records; its orders are mutable, money is `decimal(10,2)` mapped through JS `Number()`, and it has whole-order `cancelled`/`refunded` transitions that develop lacks. `develop` (reference only) built an exact, append-only reward ledger but reverses rewards only through manual Finance corrections. We adopt develop's arithmetic and ledger shape, hook it into the Order Acceptance seam from ADR-0005, and drive reversals automatically from main's status transitions. The research file lives on branch `research/partner-rewards-attribution`, not on main.

Depends on ADR-0003 (`business_partners`), ADR-0004 (Partner School on lists), and ADR-0005 (Order Acceptance, `transitionOrderStatus`, per-order attribution).

## Decisions

**Scope: ledger only.** Accrue, earn, reverse, adjust, and a computed statement. Settlement/payout (bank accounts, available balance, debt policy) is a separate decision; a `settlement` event kind was reserved here, but ADR-0009 dropped it and keeps settlements in their own table.

**Rates.** Append-only `reward_rates` rows per Business Partner (current = latest), each carrying `pointsPerEgp` (`numeric(12,6)`) and `egpPerPoint` (`numeric(12,4)`), configured independently. The Quote reads the current rate `FOR SHARE` and both values are snapshotted onto the order and covered by the `confirmation` digest, so a rate change between quote and accept forces reconfirmation. No rate configured: the order is still accepted and attributed, with no entitlement.

**Arithmetic.** Money in integer piasters (`bigint`), exact decimal/BigInt math, never JS `number`. Points = floor(charged line total × `pointsPerEgp`), where the charged line total is the Quote's post-discount line total, delivery excluded. EGP value = points × `egpPerPoint`, half-up to a piaster. Both are computed once at acceptance and stored; nothing is ever recomputed from a later rate. Zero-point entitlements are not stored.

**Ledger shape.** One `reward_entitlements` row per attributed `order_items` row (keyed on `order_items.id`), plus append-only `reward_events` (`accepted | paid | cancellation | reversal | adjustment`; the `settlement` kind reserved here was dropped by ADR-0009). Triggers forbid UPDATE/DELETE on rates, entitlements, and events. Unique indexes allow at most one `accepted`, one `paid`, and one `reversal`/`cancellation` per entitlement. The Reward Statement (pending / earned / reversed, in points and EGP) is computed on read.

**Placement.** A new `partner-rewards` backend feature with tables in a new `rewards` Postgres schema. Its writes take the ADR-0005 transaction and are called by `checkout` (at acceptance) and by the order transition functions.

**Lifecycle, all in the transition's transaction:**

- Acceptance writes entitlements + `accepted` events (pending).
- Earning fires when an order is `delivered` **and** `paymentStatus = paid` with the paid amount equal to the snapshotted total, checked after whichever of the two transitions completes the pair. Payment status changes go through a single `transitionPaymentStatus` alongside `transitionOrderStatus`.
- `cancelled` appends `cancellation` (voids pending). `refunded` (status or payment) voids pending if not yet earned, else appends `reversal` of the earned points; the per-entitlement unique index makes the second refund transition a no-op.
- Manual `adjustment` events need the `rewards.adjust` Staff permission, a reason, and an idempotency key. Rates need `rewards.rates.manage`. Both are FindEg-Staff surfaces in `frontend/dashboard`; Partners never write to the ledger.

**Concurrency.** Every reward write is scoped to one order: lock the `orders` row `FOR UPDATE` (already held by `transitionOrderStatus`), rely on the unique event indexes, read rates `FOR SHARE`. No partner-wide advisory locks until settlement spends a partner balance.

## Considered options

- **Manual-only reversals (develop)**: develop had no cancel/return states. Main does, and a single transition function makes automatic reversal cheap and consistent. Manual adjustments remain for everything else.
- **Partner-wide advisory locks (develop)**: needed for balance-spending operations, not for per-order writes. Deferred to settlement.
- **Tables in `identity` beside `business_partners` (develop)**: couples money to auth. Rejected for a dedicated `rewards` schema.
- **Block list checkout when no rate exists**: punishes the Customer for missing Finance configuration. Rejected.

## Consequences

- Partial refunds don't exist on main, so develop's proportional correction allocation is not built; adding partial refunds later must add it.
- The price source for List lines directly changes points. ADR-0007 settles it: List lines are charged at the live catalog price, minus any List Offer.
