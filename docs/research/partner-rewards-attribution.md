# Research: develop's Order attribution and Partner Rewards accounting vs extending main's `order` feature

Ticket: #154 (child of Wayfinder map #146; feeds decision ticket #155). Fact-finding only; no recommendation is locked here.

Sources: `origin/develop` read with `git show`/`git archive` at the fetch of 2026-09-23; `origin/main` at `287f04b1`. Citations are `path:line` on the branch named in each section. Context decisions: ADR-0003 (parallel `PartnerMembership`, `business_partners` table re-created under main's `identity` schema; branch `docs/adr-0003-partner-membership-model`) and ADR-0004 (School becomes a Partner School via `school_supply_lists.businessPartnerId`; `draft → published → archived`; `list_selections`; List Offer deferred; branch `worktree-wayfinder-150-supply-list-adr`).

## TL;DR

- **Attribution path on develop:** List `publicCode` → `school_supply_lists.businessPartnerId` → every priced line of that List Selection checkout. Ordinary Cart checkout is never attributed. There is no Partner-School-profile hop: the list row itself carries the Business Partner.
- **Snapshot point:** inside the checkout *quote*. The partner's latest rate is read under an advisory lock, each line is valued, and the valuation goes into the confirmation digest. At accept, the quote is recomputed in the same transaction; a changed rate yields `reconfirmation-required`. The accepted Order snapshot, the per-line `partner_reward_entitlements` rows and an `accepted` ledger event are all written in that one transaction.
- **Arithmetic:** exact decimal strings and `BigInt`. There is no floating point and no basis-point rate. Money is piasters (scale 2). `pointsPerEgp` is a decimal at scale 6 and `egpPerPoint` a decimal at scale 4. Points are **floored** from the discounted line total. The EGP value is rounded **half-up to a piaster**. Basis points appear only in the List Offer discount (0–10000).
- **Ledger:** an append-only `partner_reward_events` table (event types `accepted | paid | refund | cancellation | reversal | adjustment | settlement`) plus immutable `partner_reward_entitlements`, `partner_reward_rates`, verified bank accounts and idempotency outcomes. Postgres triggers reject every UPDATE and DELETE. The statement is computed on read (pending / earned / reversed / settled / available, in both points and EGP). There is no stored balance.
- **Reversals:** none happen automatically. Develop's Order lifecycle has only `delivered` and `paid`. Cancellation, refund, reversal, adjustment and settlement are manual Finance corrections, each with a caller-supplied idempotency key. Each correction is valued from the *recorded* balance by proportional allocation, never from the current rate.
- **Main today:** a mutable `sales.orders`/`order_items` pair with `decimal(10,2)`, in-place status updates and `Number()` mapping. There are no Business Partner, rate or reward records. The only link from an order to a list is `order_items.cartKitId → cart_kits → school_lists`. There is also **no server route for placing an order**: the storefront POSTs to `/api/v1/checkout/order`, but nothing on main handles it.

## 1. Attribution path (develop)

1. List Selection checkout is its own flow, separate from Cart checkout. `createListCommerce` loads the list by `publicCode`, and the store locks the list row `FOR UPDATE` and rejects drafts (`backend/src/modules/school-supply-lists/infrastructure/persistence.ts:190-196`; `backend/src/application/list-commerce.ts:57`).
2. The Business Partner is simply `list.businessPartnerId`. The rate lookup uses it (`list-commerce.ts:111`), and so do the pending lines written at accept (`list-commerce.ts:189-197`). Pricing stamps an `attribution` object on each line: `listId`, `businessPartnerId`, `listItemId`, `specification`, `defaultVariantId`, `alternative`, `catalogUnitPrice`, `offerBasisPoints`, `discountAmount` (`backend/src/modules/commerce/public.ts:235-245`; type at `modules/commerce/contracts.ts:7-22`).
3. Ordinary Cart checkout (`backend/src/application/checkout.ts:102-139`) calls the shared `acceptOrder` (`checkout.ts:172-211`) with no reward or attribution fields. Issue #93 states "Ordinary Cart checkout remains unattributed."
4. The attribution lives inside the immutable Order snapshot. `sales.accepted_orders(reference text PK, snapshot jsonb)` is trigger-protected (`db/migrations/0005_guest_checkout.sql:13-17,53-56`). Partner Reports read it back through `snapshot->'items'->line_index->'attribution'` (`db/migrations/0011_partner_report_views.sql:12-25`).
5. Granularity: one Business Partner per order in practice, because checkout covers a single list. The schema would still allow several, since entitlements are keyed `(order_reference, line_index)` and each row carries its own `business_partner_id` (`db/migrations/0009_reward_entitlements.sql:14-26`), and `earnDeliveredOrder` loops over distinct partners in sorted order (`modules/partner-rewards/infrastructure/persistence.ts:120-129`).
6. The rate is **per Business Partner**, not per list or per school (`partner_reward_rates.business_partner_id`, `0009_reward_entitlements.sql:1-12`).

Observation: develop prices list lines from the **live** catalog price (`variants` from `listCatalog.readEligible()`, `list-commerce.ts:72`; `unit = egpMinor(variant.price)`, `commerce/public.ts:224`). It does not use the unit price frozen onto the list item at publish. ADR-0004 snapshots the unit price at publish, so which price feeds the reward basis is an open question (Q3).

## 2. When things are snapshotted

| Fact | Where captured | Cite |
|---|---|---|
| Rate lookup | `rateForPartner` takes `pg_advisory_xact_lock(93001, partnerId)`, then reads the latest row by `id DESC` | `partner-rewards/infrastructure/persistence.ts:32-33,161-170` |
| Missing rate | Quote fails with `reward-rate-unavailable`, so a list checkout cannot be accepted for a partner with no rate | `list-commerce.ts:111-117` |
| Per-line valuation | `valueRewardLine(rate, item.lineTotal)` during quote | `list-commerce.ts:113-118` |
| Confirmation | The terms, including each line's `reward` and `rateId`, are digested into `confirmation` | `list-commerce.ts:119-131` |
| Accept | Recomputes the quote in the same transaction; a digest mismatch returns `reconfirmation-required` | `list-commerce.ts:170-173` |
| Persistence | `acceptOrder` writes the order snapshot, reservations and outbox; then `recordPending` writes entitlements and the `accepted` events | `checkout.ts:180-204`; `list-commerce.ts:174-197`; `persistence.ts:203-228` |
| Atomicity | `run()` commits only on `found/quoted/accepted`, and every other status rolls back all writes | `list-commerce.ts:38-48` |

The snapshot is stored three times: in the order snapshot (`items[].reward`), in the `partner_reward_entitlements` row (`rate_id`, `eligible_subtotal`, `points`, `reward_value`), and on the `accepted` event (`value`, `conversion_rate`).

Rate history is immutable. `configureRate` always inserts a new row, is idempotent on `(actor_id, request_key)` and returns `idempotency-conflict` when the same key arrives with different values (`persistence.ts:171-202`). Rates, entitlements and events all carry the `preserve_reward_history` trigger (`0009_reward_entitlements.sql:31-38`). The entitlement FK `(rate_id, business_partner_id)` stops an entitlement from pointing at another partner's rate (`0009_reward_entitlements.sql:10,24`). Configuring a rate needs Staff `finance.manage` and an active partner (`backend/src/application/reward-rates.ts:17-31`).

## 3. EGP arithmetic

- **Money:** `egpMinor` parses `^\d{1,12}(\.\d{1,2})?$` into `BigInt` piasters, and `formatEgp` renders the value back (`commerce/public.ts:80-89`). The signed formatter used for ledger values is in `partner-rewards/accounting.ts:103-107`.
- **List Offer (the only basis-points usage):** `paid = (gross × (10000 − bp) + 5000) / 10000` gives one half-up rounding to the piaster per line (`commerce/public.ts:201,226`). The column is `sales.list_offers.basis_points integer CHECK 0..10000` (`db/migrations/0007_list_selections.sql:9-15`). ADR-0004 defers List Offer on main.
- **Rates:** `pointsPerEgp` is a decimal with at most 10 integer digits and 6 decimals. `egpPerPoint` is a decimal with at most 8 integer digits and 4 decimals. Both must be > 0, and `1e2`, numbers, negatives and 7-decimal inputs are rejected (`partner-rewards/valuation.ts:3-28`; tests `__tests__/valuation.test.ts:24-39`). The DB columns are `numeric(16,6)` / `numeric(12,4)` with `> 0` checks (`db/src/modules/partner-rewards/schema.ts:57-75`). The contracts comment reads "six decimal points per EGP, four decimal EGP per point" (`contracts.ts:78`).
- **Points:** `points = floor(piasters × pointsPerEgp_micro / 10^8)`, which floors on the **discounted line total** (after the List Offer, before delivery). The result is capped at int32 because the column is `integer` (`valuation.ts:39-40`).
- **Value:** `piasters = (points × egpPerPoint_1e-4 + 50) / 100`, which rounds half-up to a piaster and is capped at 10^18 (`valuation.ts:41-49`). Worked example from the test: 10.00 EGP × 1.25 gives 12 points, and 12 × 0.0125 = 0.15 EGP (`valuation.test.ts:4-23`).
- **Allocation for partial movements:** `allocateRewardValue(value, points, total)` returns `round_half_up(value × points / total)`, computed as `(v·p·2 + t) / 2t` (`corrections.ts:32-37`). Each correction draws from the *current* balance of the relevant bucket (`corrections.ts:39-73`), so the last draw receives the exact remainder. Tests cover partial settlement, a cancellation split across pending and earned, and a proportional adjustment (`__tests__/corrections.test.ts:37,75,112`). End to end, a mixed-rate settlement reconciles to the last piaster (`tests/reward-acceptance.test.mjs:639-690`).
- **Statement values** are decimal strings, "exact totals beyond JavaScript's safe integer range" (`contracts.ts:108-120`). If any event lacks a value, the EGP statement is `null` rather than guessed from today's rate (`accounting.ts:117-128`; `contracts.ts:118`).

## 4. Ledger shape (entitlement → events → statement)

Tables, all in develop's `identity` schema (`db/src/modules/partner-rewards/schema.ts`):

- `partner_reward_rates`: an append-only rate history per partner, with an idempotency key (`schema.ts:57-75`; `0009:1-12`).
- `partner_reward_entitlements`: one row per attributed order line, `UNIQUE(order_reference, line_index)`, FK to `sales.accepted_orders(reference)` and to the rate (`schema.ts:77-103`; `0009:14-26`).
- `partner_reward_events`: the ledger. It has `points` (signed), `pending_points`, `earned_points`, `value numeric(30,2)` (added in 0013), `conversion_rate`, `fulfillment`, `fulfillment_completed`, `verified_bank_account_id`, `settlement_reference`, `reason`, `actor_id` (added in 0010) and `entitlement_id`. A partial unique index `(entitlement_id, event_type) WHERE event_type IN ('accepted','paid')` makes accepting or earning an entitlement a one-time operation (`schema.ts:18-55`; `0008:1-18`; `0009:27-29`; `0010_cod_lifecycle.sql:25`; `0013:2`).
- `partner_reward_verified_bank_accounts`: opaque, Finance-approved bank account IDs. The bank details themselves are not stored in FindEg (`schema.ts:105-121`; `0012:1-8`).
- `partner_reward_outcomes`: the immutable idempotency record `(actor_id, operation, key) → fingerprint, outcome jsonb` (`schema.ts:123-134`; `0012:9-16`).
- Views `identity.partner_report_events` and `identity.partner_report_sales` expose the privacy-limited projections that Reports consume. The `COALESCE` fallback values legacy events from the entitlement or from `points × conversion_rate` (`0011`; `0013:4-12`).

Statement computation (`accounting.ts:37-83`), in both points and value, runs in event order:

- `accepted` adds to that order's **pending**.
- `paid` moves the amount into **earned** and subtracts it from pending (floored at 0).
- `cancellation` takes from pending first. Anything beyond the remaining pending is taken from earned. The full amount counts as **reversed**.
- `refund` / `reversal` take from earned and add to reversed.
- `adjustment` changes earned by a signed amount.
- `settlement` adds to **settled**.
- **available** = earned − settled.

Earning happens when an Order is marked paid. `orderLifecycle.pay` requires Staff `finance.manage`, a prior delivery, `amount === order.total`, and an order not already paid, all under an order `FOR UPDATE` lock. It then calls `earnDeliveredOrder` in the same transaction (`backend/src/application/order-lifecycle.ts:84-105`). `earnDeliveredOrder` locks each partner's ledger (advisory lock `93003`), re-reads the order's **remaining** pending, and writes a `paid` event per entitlement with `min(remaining, entitlement.points)` and the allocated value, using `onConflictDoNothing` (`persistence.ts:112-160`). A cancellation recorded before payment therefore permanently lowers what payment can earn (`tests/reward-acceptance.test.mjs:517,610-638`). Only `fulfillment: 'delivery'` is wired. The `collection` value exists in the contract and CHECK constraint but has no workflow (`persistence.ts:155`; `contracts.ts:12`; issue #94 excludes school collection).

## 5. Reversals and corrections on cancel/return

- Develop's Order lifecycle has only `delivered` and `paid` (`sales.order_lifecycle_events` CHECK, `0010_cod_lifecycle.sql:1-10`). There is **no Order-cancelled or Order-returned state**, and nothing triggers a reward reversal automatically.
- Finance records every correction by hand: `partnerRewards.correct(token, partnerId, {key, action, orderReference, points, reason?, verifiedBankAccountId?, settlementReference?})`. It is authorized with Staff `finance.manage` and needs an active partner (locked). Its input parser is strict: unknown fields are rejected, points must be a safe integer other than 0, and only `adjustment` may be negative. Settlement requires both the bank account ID and a settlement reference, and those fields are forbidden on every other action (`backend/src/application/partner-rewards.ts:30-85,121-133,151-173`).
- Eligibility (`corrections.ts:5-28`):
  - `cancellation` needs an `accepted` event and at most pending + earned for the order.
  - `refund` needs a `paid` event and at most earned.
  - `reversal` needs an `accepted` event and at most earned.
  - `settlement` needs at most the partner-wide available balance **and** a row in `verified_bank_accounts` (read `FOR SHARE`).
  - `adjustment` is always allowed.
- The value is taken from the recorded balance, "never the currently configured conversion rate" (`corrections.ts:39-73`).
- A partner-level settlement still requires an `orderReference` string (`partner-rewards.ts:50`; `persistence.ts:332`), which is only a label when balances are read partner-wide (`persistence.ts:287-290`).
- `createPartnerRewards` in `modules/partner-rewards/public.ts:58-297` is an older in-memory ledger API from PRs #80/#82. Only `__tests__/public.test.ts` uses it. Production wiring uses `bindPartnerRewardStore` together with the application operations (`runtime/src/index.ts:4-6,54,98,106-107`).

## 6. Concurrency and idempotency safeguards (develop)

| Mechanism | Purpose | Cite |
|---|---|---|
| `pg_advisory_xact_lock(93001, partnerId)` | Serializes rate configuration against quotes, including the first configuration when no row exists yet | `persistence.ts:31-33` |
| `(93002, hash(actor:key))` plus `UNIQUE(actor_id, request_key)` | Idempotent rate configuration | `persistence.ts:171-202` |
| `(93003, partnerId)` | Serializes every ledger mutation for a partner (earn, correction, bank verification) | `persistence.ts:34-35,123,262,286` |
| `(93004, hash(actor:op:key))` + `partner_reward_outcomes` | Replay returns the stored outcome; the same key with a different fingerprint returns `idempotency-conflict` | `persistence.ts:36-71,275-285` |
| `(94001, …)` + `order_lifecycle_outcomes`; order `FOR UPDATE` | Idempotent and serialized delivery and payment | `commerce/infrastructure/persistence.ts:172-200`; `order-lifecycle.ts:74-86` |
| List row `FOR UPDATE`, then selection `FOR UPDATE` in a fixed order; `checkout_outcomes(owner_digest,key)` | Idempotent list checkout without deadlocks | `list-commerce.ts:160-169`; `school-supply-lists/infrastructure/persistence.ts:195`; `commerce/infrastructure/persistence.ts:148` |
| Partial unique index `partner_reward_entitlement_once` | A second `accepted`/`paid` event for an entitlement is impossible | `0009:28` |
| `preserve_reward_history` / `preserve_checkout_fact` triggers | Append-only facts | `0009:31-38`; `0012:17-18`; `0010:27-29`; `0005:53-60` |
| Rollback-unless-success `run()` wrappers | Business rejections write nothing | `partner-rewards.ts:101-120`; `order-lifecycle.ts:22-39` |

A concurrent cancellation and payment on the same order cannot restore cancelled points. This is proven against real Postgres (`tests/reward-acceptance.test.mjs:610-638`).

Nuance: rejected corrections (`reward-unavailable`, `bank-account-unverified`) return before `saveOutcome` (`persistence.ts:325-328`) and roll back. Retrying the same key after the balance changes can therefore succeed. Only a success is pinned to its key.

## 7. What main already provides, and where it conflicts

On main (`db/src/schema/sales/orders.ts`, `db/src/queries/sales/orders.ts`, `backend/src/features/order`, `backend/src/features/administration/application/services/AdminOrderService.ts`):

**Provides:**
- `sales.orders` has status, paymentStatus, subtotal, shipping, total, currency default `EGP`, paymentMethod `cod|card`, and a frozen `shippingAddressSnapshot` (`db/src/schema/sales/orders.ts:23-60`).
- `order_items` has product, SKU and unit-price snapshots plus a `variantSnapshot` jsonb (`orders.ts:65-97`).
- `order_items.cartKitId → school_engine.cart_kits.schoolListId → school_lists` is the only link from an order to a list (`orders.ts:72-73`; `db/src/schema/sales/cart-kits.ts:12-27`). ADR-0004 discards the cart-kit merge design, so this link is set to go away.
- The status enum already includes `delivered`, `cancelled` and `refunded`, and paymentStatus includes `refunded` (`db/src/schema/enums.ts:22-32`). There are transition tables (`features/order/application/utils/order-status-transitions.ts:23-31`; `order-payment-status-transitions.ts:19-23`) and audit logging on status change (`AdminOrderService.ts:131-142,179-185`). These are the natural hooks for reward events. Develop does not have them, because it has no cancel or refund lifecycle at all.
- `orderQueries.create` wraps the order and items insert in a transaction (`db/src/queries/sales/orders.ts:273-340`).

**Conflicts / absent:**
- **No order placement endpoint.** `CheckoutClient.tsx:102-116` POSTs to `/api/v1/checkout/validate` and `/api/v1/checkout/order`, but no `route.ts` for either exists on main (the only API routes are `frontend/dashboard/src/app/api/v1/{cart,auth/me,notifications/unread-count}`). `orderQueries.create` has no callers. The atomic acceptance step that develop's rewards attach to would have to be built first on main.
- **Mutable orders.** Status and payment are updated in place (`db/src/queries/sales/orders.ts:345-386`). The service reads, validates the transition, then writes, with no row lock, no transaction around the reads and writes, and no idempotency key (`AdminOrderService.ts:109-129,157-177`). Develop, by contrast, uses an immutable snapshot plus append-only lifecycle events.
- **Float mapping.** `OrderService.mapToDomain` converts money with `Number()` (`features/order/application/services/OrderService.ts:23-25,42-43`). Money columns are `decimal(10,2)`, with a maximum of 99,999,999.99 (`orders.ts:38-42,88-96`). Develop uses `numeric(18,2)` for entitlements and `numeric(30,2)` for event values, handled as `BigInt`.
- **Order identity.** Main uses `serial id`. Develop's reward records key on `order_reference text`, a random token and the PK of `accepted_orders`. A port would either FK to `orders.id` or add a reference column.
- **Payment independent of delivery.** Main's payment transitions don't require `delivered` (`order-payment-status-transitions.ts:19-23`). Develop earns only after delivery **and** exact-amount payment (`order-lifecycle.ts:94-104`).
- **Nothing partner-shaped.** There is no `business_partners` table (ADR-0003 adds it), no `businessPartnerId` on lists (ADR-0004 adds it), and no rate, entitlement, event, bank-account or outcome tables. Main has exactly one `FOR UPDATE` (`db/src/queries/catalog/inventory.ts:148`) and no advisory-lock or idempotency-outcome pattern.
- **Schema drift.** `orderQueries.create` inserts `uomCode` into `order_items` (`db/src/queries/sales/orders.ts:324`), but the Drizzle table has no such column (`orders.ts:65-97`).
- **Migrations.** Main has migrations only through `0001_current_session_authorization_version.sql` (`db/migrations/`). Develop's 0003–0014 do not apply to main as-is, so main's numbering would restart from 0002.

## 8. Gaps to reach parity (if main extends `order` in place)

1. An order-acceptance route or service for both Cart and List Selection, with an idempotency key, a confirmation digest (quote then reconfirm), and a single transaction covering order, items, reservation and pending rewards.
2. Per-line attribution columns on `order_items`, for example `list_id`, `list_item_id`, `business_partner_id`, `alternative`, `offer_basis_points` and `discount_amount`, or a jsonb `attribution` snapshot. These need to be immutable after acceptance, which main's `order_items` currently isn't.
3. A `partner_rewards` feature barrel (ADR-0001) holding rates, entitlements, the event ledger, verified bank accounts and outcomes. Its Drizzle schema would live under main's `db/src/schema/...`, with append-only triggers and the one-time partial unique index.
4. The exact-decimal valuation and allocation functions (`valuation.ts`, `corrections.ts`, `accounting.ts`), which are pure and small (under 260 LOC in total). Main's `Number()` money mapping would need to stay out of the reward path.
5. Lifecycle wiring: earn on delivered + paid. Main also has `cancelled`/`refunded` statuses, so a decision is needed on whether those transitions post reward events automatically. Develop leaves this to Finance.
6. A lock and idempotency discipline for status transitions (a row lock plus an outcome table or keys), so that concurrent payment and cancellation cannot double-earn.
7. Finance-facing operations and routes (rate configuration, corrections, bank verification, settlement) behind Staff `finance.manage`, plus Partner-facing statement and reports gated by `PartnerMembership.roles` (ADR-0003).

## Open questions for #155

1. **Mutable vs immutable Order.** Should main keep mutable `orders` with transition tables and add an append-only reward ledger beside them, or adopt develop's immutable accepted-order snapshot with append-only lifecycle events? The reward ledger's guarantees rest on the second.
2. **Automatic vs manual reversals.** Main already has `cancelled`/`refunded` statuses. Should those transitions post `cancellation`/`refund` events automatically, and with what amount (the full entitlement, or per returned line)? Or should develop's manual Finance-correction model stay?
3. **Price basis.** Should points be computed on the live catalog price at checkout (as on develop) or on the unit price ADR-0004 freezes at publish? And how does the deferred List Offer affect the basis? On develop the basis is the post-discount line total, excluding delivery.
4. **Rate scope.** Per Business Partner (as on develop), or per Partner School/list? And should a missing rate block list checkout (develop's behaviour) or accept the order with zero points?
5. **Order key.** Should main FK rewards to `orders.id` (serial), or introduce an opaque `reference` as develop does? The reference is also used for guest order access.
6. **Schema placement.** Develop puts reward tables in the `identity` schema. ADR-0003 puts `business_partners` in main's `identity` schema. Should rewards join them there or go in a `sales`/`rewards` schema?
7. **Collection fulfillment.** The `collection` value is modeled but not wired on develop. Is it in scope for main's first cut?
8. **Settlement reference.** A settlement requires an `orderReference` even though it is partner-wide. Keep that, or model settlements as partner-level events?
9. **Retry of rejected corrections.** Rejected outcomes are not pinned to their key. Is that the intended semantics?
