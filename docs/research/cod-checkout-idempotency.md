# Research: develop's atomic COD checkout + idempotency vs main's `order` + `cart` features

Part of #146. Answers #156. Feeds #157 (COD checkout design decision).

Method: read-only comparison via `git show origin/develop:<path>` (develop at the tip fetched on 2026-09-23) and main at `287f04b1`. No code ported; `develop` is reference-only per #146. Line numbers are for those revisions.

## Sources

- Issue #50: user stories 10-12 (guest checkout, guest order access, COD), 26 (atomic acceptance), 27 (retry replays original outcome), 28 (no double sale of the final unit), 30 (durable outbox). Implementation decisions: "For Order acceptance, atomically commit..." / "Persist idempotency keys, request fingerprints, and outcomes..." / "Record required notifications in a transactional outbox...".
- develop PRs/commits: #78 / `0624f8ca` "Complete bilingual Guest Cash-on-Delivery checkout (#58)"; `bc409f67` "feat: deliver checkout notifications through durable outbox (#59)" (direct commit, no PR); #79 "Add dedicated school supply list selections" (list checkout path); #85 (production readiness, outbox cleanup runbook).
- develop application: `backend/src/application/checkout.ts`, `backend/src/application/list-commerce.ts`, `backend/src/application/transactions.ts`, `backend/src/application/__tests__/checkout.test.ts`.
- develop modules: `backend/src/modules/commerce/{contracts,public}.ts`, `backend/src/modules/commerce/infrastructure/persistence.ts`, `backend/src/modules/inventory/infrastructure/persistence.ts`, `backend/src/modules/catalog/infrastructure/persistence.ts`, `backend/src/modules/partner-rewards/infrastructure/persistence.ts`.
- develop runtime/db: `runtime/src/{transactions,checkout-outbox,outbox-delivery,worker,config,index}.ts`, `db/src/runtime/{transactions,outbox}.ts`, `db/src/modules/runtime/schema.ts`, `db/migrations/0005_guest_checkout.sql`, `db/migrations/0006_outbox_delivery.sql`.
- develop HTTP/web: `frontend/web/src/server/guest-cart.ts`, `frontend/web/src/app/api/v1/commerce/checkout/route.ts`.
- develop tests/docs: `tests/guest-checkout.test.mjs`, `tests/outbox-delivery.test.mjs`, `docs/operations/guest-checkout.md`, `docs/operations/outbox-delivery.md`, `docs/operations/production-readiness.md`.
- main: `backend/src/features/order/**`, `backend/src/features/cart/**`, `backend/src/features/administration/application/services/AdminOrderService.ts`, `db/src/schema/sales/orders.ts`, `db/src/schema/inventory/inventory.ts`, `db/src/queries/sales/orders.ts`, `db/src/queries/catalog/inventory.ts`, `frontend/storefront/src/app/[locale]/(storefront)/checkout/**`.
- Decided context: ADR-0004 (`origin/worktree-wayfinder-150-supply-list-adr`, `docs/adr/0004-school-supply-list-lifecycle-and-vocabulary.md`), ADR-0003 (`origin/docs/adr-0003-partner-membership-model`).

## 1. Transaction boundary (develop)

One database transaction per application operation, provided through a port:

- `TransactionRunner<Adapters>.run(operation)` (`backend/src/application/transactions.ts:10-14`). Contract (`:5-9`): adapters are bound to one transaction for the callback only; no network effects inside; success commits, a business rejection (`{ok:false}`) or exception rolls back.
- Concrete runner (`runtime/src/transactions.ts:9-39`): wraps `drizzle.transaction`, binds every store to the same `transaction` handle (`:27`), and turns `{ok:false}` into a thrown per-run `BusinessRejection` so Drizzle rolls back, then returns the outcome (`:20-33`).
- All stores used by checkout (commerce, inventory, catalog, reservations, outbox, rewards, selections, lists) are bound per-transaction in `runtime/src/index.ts:48-67`.
- `createStorefrontCommerce.run` (`backend/src/application/checkout.ts:41-51`) maps any status outside `quoted|accepted|available|verified` to a rejection, so e.g. `insufficient-stock`, `reconfirmation-required`, `idempotency-conflict` all roll back every write done so far.

Inside the single transaction, `acceptCheckout` (`checkout.ts:102-139`) does, in order:

1. Lock the Cart row: `readCart` upserts then `SELECT ... FOR UPDATE` (`commerce/infrastructure/persistence.ts:103-114`). Comment at `checkout.ts:108`: this lock serializes retries for the same guest across processes.
2. Idempotency lookup (`checkout.ts:110-115`), see §3.
3. Re-quote authoritatively (`checkout.ts:116`, `checkoutQuote` at `:60-77`): delivery zone read `FOR SHARE` (`commerce/.../persistence.ts:32-39`), eligible variants read `FOR SHARE` (`catalog/infrastructure/persistence.ts:13-35`), availability summed from `inventory_balances` (`inventory/.../persistence.ts:117-134`, no lock; the reservation step re-checks under lock).
4. Price confirmation: the quote carries `confirmation = digest(JSON.stringify(terms))` (`checkout.ts:72-76`); a mismatch with the client's `confirmation` returns `reconfirmation-required` (`:118-120`). Any change in items, prices, zone or fee therefore forces re-review.
5. `acceptOrder` (`checkout.ts:172-211`): insert immutable Order snapshot + idempotency outcome + guest access row (`:190-193`), reserve stock (`:194-195`), enqueue two outbox rows (`:196-204`).
6. Clear the Cart (`checkout.ts:136`).

Network effects (email/SMS) never happen in this transaction; the web process only inserts outbox rows (`docs/operations/outbox-delivery.md:3-6`).

Tested against real PostgreSQL: outbox insert failure after reservation rolls back Order, reservation, outcome and keeps the Cart, and a retry then succeeds (`tests/guest-checkout.test.mjs:283-309`); a stock loss injected after the Order insert yields `insufficient-stock` with zero Orders/outcomes/reservations left and balances unchanged (`:311-353`).

## 2. Stock strategy (develop)

Reservation, not decrement, at acceptance. Decrement happens at delivery.

- Schema: `inventory.inventory_balances(on_hand, reserved)` gains `CHECK (on_hand >= reserved AND reserved >= 0)` (`db/migrations/0005_guest_checkout.sql:35`), a DB-level oversell backstop.
- Per-order reservation rows: `inventory.order_reservations(order_reference, variant_id, warehouse_id, quantity > 0)`, PK `(order_reference, variant_id, warehouse_id)`, FK to `sales.accepted_orders` (`0005_guest_checkout.sql:37-44`), made immutable by trigger (`:60`).
- `reserve(reference, items)` (`inventory/infrastructure/persistence.ts:18-62`):
  - Items are aggregated per variant and sorted by `variantId` (`checkout.ts:213-220`; again at `persistence.ts:19`) so locks are acquired in a global order (deadlock avoidance).
  - For each variant, `SELECT ... FOR UPDATE` all balances in active warehouses ordered by warehouse id (`:20-28`); if the summed `on_hand - reserved` is below demand, return `false` -> `insufficient-stock` -> rollback (`:29-34`, `checkout.ts:194-195`).
  - Otherwise fill greedily across warehouses: `reserved += q`, insert an `order_reservations` row and an append-only `stock_movements` row (`movement_type 'order-reservation'`, negative quantity, `reference_type 'accepted-order'`) (`:35-59`).
- At delivery, `bindInventoryFulfillment.deliver` (`persistence.ts:146-195`) inserts an idempotency marker into `order_fulfillments` (`ON CONFLICT DO NOTHING`, `:147-152`), then for each reservation locks the balance and decrements both `on_hand` and `reserved` with an `order-delivery` stock movement (`:159-193`).
- Manual adjustments cannot push `on_hand` below `reserved` (`persistence.ts:100-101`).
- No reservation release/expiry/cancellation path exists on develop (reservation rows are immutable; no cancel operation found).
- Tested: two buyers on two runtime instances contesting the final unit -> exactly one `accepted`, one `insufficient-stock`, `reserved = 1` (`tests/guest-checkout.test.mjs:190-218`).

## 3. Idempotency (develop)

- **Key**: client-generated, part of the JSON body (`CheckoutInput.key`, `commerce/contracts.ts:59-65`), validated `^[a-zA-Z0-9_-]{16,128}$` (`commerce/public.ts:40`). Not an HTTP header. The UI keeps an uncertain request (same key and body) in tab `sessionStorage` for retry/reload (`docs/operations/guest-checkout.md:12-13`).
- **Scope**: `(owner_digest, key)` where `owner_digest` is SHA-256 of the guest-cart cookie token (`frontend/web/src/server/guest-cart.ts:4-22`). For List Selection checkout the scope is `digest("list-selection:" + owner + ":" + publicCode)` (`backend/src/application/list-commerce.ts:158`), so each List has its own key namespace separate from the ordinary Cart.
- **Fingerprint**: `digest(JSON.stringify(validatedInput))` (`checkout.ts:106`; `list-commerce.ts:159`); input is normalized first (trimmed, lower-cased email, whitelisted keys; `commerce/public.ts:32-78`). It covers key, confirmation, address, payment/delivery method; items/prices are covered indirectly through `confirmation`.
- **Storage**: `sales.checkout_outcomes(owner_digest, key, fingerprint, order_reference -> accepted_orders)`, PK `(owner_digest, key)` (`0005_guest_checkout.sql:19-25`), immutable by trigger (`:58`). Written in the same transaction as the Order (`commerce/.../persistence.ts:50-64`). Only successful outcomes are stored; rejections roll back and leave no row, so a rejected key can be retried.
- **TTL**: none. Outcomes live as long as the Order (`docs/operations/guest-checkout.md:22-24`; #50 "retain them for the lifetime of the related commercial record"). The cleanup runbook forbids deleting them (`docs/operations/production-readiness.md`, "Completed outbox cleanup": "Never delete ... commercial idempotency outcomes").
- **Replay**: lookup joins outcome to the Order snapshot (`commerce/.../persistence.ts:40-49`). Same fingerprint -> the original receipt `{status:'accepted', reference, accessReference, total}` rebuilt from the snapshot (`checkout.ts:79-86, 111-113`), before any re-quote, so it works after the Cart is cleared or prices changed. HTTP returns `201` for both first acceptance and replay (`api/v1/commerce/checkout/route.ts:16`; test at `tests/guest-checkout.test.mjs:117-158`).
- **Mismatch**: different fingerprint under the same key -> `{status:'idempotency-conflict'}` -> HTTP `409` (`checkout.ts:112-114`, `route.ts:16`).
- **Concurrency**: simultaneous retries are serialized by the Cart row lock (List path: the List row `FOR UPDATE` in `school-supply-lists/.../persistence.ts:190-195` and the List Selection row `FOR UPDATE` in `commerce/.../persistence.ts:139-148`, locked "in the same order used by reads", `list-commerce.ts:161-164`). The loser waits, then sees the committed outcome and replays; PK is the last-resort guard. Tested across two runtime instances: identical receipts, one reservation, two outbox rows (`tests/guest-checkout.test.mjs:220-247`).
- Unit tests (fake stores): replay and conflict (`backend/src/application/__tests__/checkout.test.ts:61-73`).
- Related pattern for staff lifecycle ops (delivery/payment): `order_lifecycle_outcomes` keyed `(actorId, operation, key)` with a `pg_advisory_xact_lock` on the triple instead of a row lock (`commerce/.../persistence.ts:183-203`) — i.e. develop scopes keys by caller + operation there, matching #50's "caller, operation, and input match".

## 4. Guest vs signed-in checkout (develop)

- Guest-only. The Cart owner is an opaque 30-day `findeg_guest_cart` HttpOnly/Secure/SameSite=Lax cookie; only its hash is stored (`guest-cart.ts:4-22`; `docs/operations/guest-checkout.md:9-11`). No `userId` on `AcceptedOrder` (`commerce/contracts.ts:44-57`); no signed-in Customer checkout or cart merge exists on develop. #50 story 10 only requires Guest Checkout.
- Guest Order Access: `sales.guest_order_access(reference, order_reference, code_hash, expires_at, used_at)` (`0005_guest_checkout.sql:27-33`). Acceptance generates a random access reference and a 6-digit code, stores only its digest with a 15-minute expiry (`checkout.ts:187-193`). Verification locks the row, requires unused and unexpired, marks `used_at` (one-time) (`commerce/.../persistence.ts:72-102`). The plaintext code travels only in the `guest-order-code` outbox payload (`checkout.ts:200-204`).
- Order data model is new and separate from legacy tables: `sales.accepted_orders(reference text PK, snapshot jsonb)` with an immutability trigger (`0005_guest_checkout.sql:13-17, 53-56`). Status changes are append-only `order_lifecycle_events`, projected into `OrderState` (`commerce/.../persistence.ts:222-240`). Payment is `cash-on-delivery`/`unpaid` at acceptance (`checkout.ts:180-188`).

## 5. List Selection and partner attribution at acceptance (develop)

`createListCommerce.acceptCheckout` (`backend/src/application/list-commerce.ts:155-204`) reuses `acceptOrder` and adds, in the same transaction:

- Revalidation inside the transaction: list must be `published` and not replaced (`:99-100`), selection non-empty and every choice an allowed alternative (`:77-82, 101-102`), stock pre-check (`:105-110`), active reward rate for the list's Business Partner (`:111-118`). List Completeness is advisory and does not block (`commerce/public.ts:214-252`, #50 story 8).
- Attribution is captured on each order line in the immutable snapshot: `PricedItem.attribution = {listId, businessPartnerId, listItemId, specification, defaultVariantId, alternative, catalogUnitPrice, offerBasisPoints, discountAmount}` and `PricedItem.reward = {rateId, pointsPerEgp, egpPerPoint, points, rewardValue}` (`commerce/contracts.ts:7-22, 120-130`; built in `commerce/public.ts:221-247` and `list-commerce.ts:113-118`). The List Offer discount is applied per line, rounded half-up once (`commerce/public.ts:200-226`).
- Pending Partner Points: `rewards.recordPending(reference, lines)` inserts `partner_reward_entitlements` + an `accepted` `partner_reward_events` row per line (`list-commerce.ts:189-197`; `partner-rewards/infrastructure/persistence.ts:203-223`).
- The List Selection is emptied (keeping `setCount`) after acceptance (`list-commerce.ts:198-201`), not the ordinary Cart. List Selection never merges into the Cart (consistent with ADR-0004's discarding of `ParentListService.addListToCart`).
- The outbox payloads carry no attribution (`checkout.ts:196-204`); attribution lives only in the Order snapshot and reward tables.

## 6. Outbox (develop)

Write side (inside the acceptance transaction):

- Table `system.checkout_outbox(id text PK, kind, payload jsonb, created_at)` (`0005_guest_checkout.sql:46-51`), extended with `status pending|processing|delivered|exhausted`, `attempts`, `next_attempt_at`, `lease_token uuid`, `lease_until`, `last_error`, `delivered_at` and a due index (`0006_outbox_delivery.sql:1-12`; Drizzle mapping `db/src/modules/runtime/schema.ts:9-25`).
- Port on `CheckoutStores.outbox.enqueue(id, kind, payload)` with `kind: 'order-accepted' | 'guest-order-code'` (`checkout.ts:22-28`); adapter is a plain insert on the transaction handle (`runtime/src/checkout-outbox.ts:5-11`).
- Stable IDs derived from the business fact: `order:<orderRef>` and `guest-access:<accessRef>` (`checkout.ts:196, 200`). The PK makes duplicate enqueue impossible; replay does not re-enqueue (only 2 rows after replays, `tests/guest-checkout.test.mjs:173-174, 240-242`).
- The table is checkout-specific by name and kind union; no other workflow on develop enqueues to it.

Delivery side (worker process, separate from web):

- `createOutboxPersistence` (`db/src/runtime/outbox.ts:23-95`), each call its own short transaction, and delivery happens after the claim commits (`:22`).
  - `claim`: first marks expired leases at max attempts `exhausted` (`:28-32`); then picks one due row (`pending` and due, or `processing` with expired lease, and `attempts < max`) `ORDER BY created_at, id FOR UPDATE SKIP LOCKED LIMIT 1`, sets `processing`, `attempts+1`, a fresh `lease_token`, `lease_until = now()+60s` (`:33-48`).
  - `delivered` / `failed` update only where `id` and `lease_token` match and status is `processing` (`:50-73`), so a stale worker cannot overwrite a newer attempt. `failed` sets `exhausted` at max attempts, else `pending` with `next_attempt_at` delay.
  - `sink`: dev/test adapter inserting into `system.notification_sink` `ON CONFLICT (id) DO NOTHING` (`:74-81`; table `0006_outbox_delivery.sql:14-19`).
  - `status`: counts per state for readiness (`:82-92`).
- Loop `createOutboxDelivery.deliverNext` (`runtime/src/outbox-delivery.ts:22-56`): per-attempt timeout via `AbortController`, error categorized as `delivery-timeout` / `delivery-failed` (provider text not stored), exponential backoff `OUTBOX_RETRY_MS * 2^(attempts-1)` capped at 1h (`:46-49`). The adapter receives the outbox ID as the provider dedup key (`:5`).
- Worker polls every `OUTBOX_POLL_MS` (`runtime/src/worker.ts:88-100`); defaults: 5 attempts, 1 s poll, 5 s initial retry, 10 s timeout (`docs/operations/outbox-delivery.md:23-28`). Graceful `SIGTERM` waits for the active attempt (`:46-48`).
- Production fails closed: `DELIVERY_ADAPTER` is `z.enum(['sink'])` and production startup throws (`runtime/src/config.ts:43, 58-61`). No real email/SMS provider exists on develop.
- Semantics: at-least-once; duplicates possible if a provider lacks dedup (`outbox-delivery.md:39-44`). Exhausted rows are retained, `/health/ready` returns 503 when any exist (`:52-57`); manual reset SQL provided (`:68-77`). Delivery retry does not extend the 15-minute guest code validity (`:79-81`). Cleanup of delivered rows only, under an approved retention window (`production-readiness.md`, "Completed outbox cleanup").
- Sensitive data: payloads hold Customer email and the plaintext guest code (`guest-checkout.md:32-36`; `outbox-delivery.md:12-14`).

## 7. What main has today

| Concern                 | main                                                                                                                                                                                                                                                                                                                                                                                 | Evidence                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Checkout API            | None. Storefront posts to `/api/v1/checkout/validate` and `/api/v1/checkout/order` with an `X-Guest-Id` header, but no such routes exist in the repo (only dashboard `api/v1/{auth/me,cart,notifications}` routes).                                                                                                                                                                  | `frontend/storefront/src/app/[locale]/(storefront)/checkout/CheckoutClient/CheckoutClient.tsx:102-116`; `git ls-files \| grep route.ts`                                                    |
| Checkout schemas        | `CheckoutOrderSchema {address, paymentMethod, guestEmail?}` and `CheckoutValidateSchema {address, paymentMethod}`; no idempotency key, no price confirmation, no delivery zone. Exported but unused by any route.                                                                                                                                                                    | `backend/src/features/order/domain/schemas/CheckoutOrder.ts:11-15`, `CheckoutValidate.ts:9-12`                                                                                             |
| Order creation          | `orderQueries.create` wraps order + items insert in its own `db.transaction`, but nothing calls it (callers use only read/status queries). `OrderService` is read-only; `IOrderRepository.create` has no implementation. README's pipeline diagram ("dispatch(SubtractInventory)", "Drizzle nested transactions") is aspirational.                                                   | `db/src/queries/sales/orders.ts:273-340`; `backend/src/features/order/application/services/OrderService.ts:13-118`; `IOrderRepository.ts:22`; `backend/src/features/order/README.md:23-48` |
| Order table             | Mutable `sales.orders` (serial id, `userId?`, `guestEmail?`, `status`, `paymentStatus`, `paymentMethod 'cod'\|'card'`, `shippingAddressSnapshot`), `order_items` with price/name/sku/variant snapshots and `cartKitId`. No immutability trigger, no reference token.                                                                                                                 | `db/src/schema/sales/orders.ts:23-96`                                                                                                                                                      |
| Cart                    | Process-local `Map` on `globalThis`; not persisted, not shared across instances, lost on restart. README describes a guest->user merge that is not implemented.                                                                                                                                                                                                                      | `backend/src/features/cart/application/services/CartService.ts:8-21, 67-80`; `backend/src/features/cart/README.md:7-8, 22-39`                                                              |
| Stock                   | Same `inventory_balances(on_hand, reserved)` + `stock_movements` shape as develop, but no `CHECK` constraint and no per-order reservation table. `reserveStock(variant, warehouse, qty, orderId)` does `FOR UPDATE` + conditional increment of `reserved` inside its own transaction; it is not called anywhere and cannot join an order transaction. `releaseReservation` likewise. | `db/src/schema/inventory/inventory.ts:41-111`; `db/src/queries/catalog/inventory.ts:91-200`; no `CHECK` in `db/migrations/0000_little_chimera.sql`                                         |
| Transaction composition | Every query function opens its own `db.transaction`; no port for passing one transaction across features.                                                                                                                                                                                                                                                                            | `db/src/queries/catalog/inventory.ts:96, 137`; `db/src/queries/sales/orders.ts:298`                                                                                                        |
| Idempotency             | None anywhere in backend/db.                                                                                                                                                                                                                                                                                                                                                         | `git grep -i idempot` (no hits in `backend/`, `db/`)                                                                                                                                       |
| Outbox / notifications  | No outbox. `AdminOrderService` sends status emails inline after the DB write, errors swallowed with `console.error`.                                                                                                                                                                                                                                                                 | `backend/src/features/administration/application/services/AdminOrderService.ts:129-146`                                                                                                    |
| Guest access to order   | `orders.guestEmail` only; no opaque reference or one-time code.                                                                                                                                                                                                                                                                                                                      | `db/src/schema/sales/orders.ts:28`                                                                                                                                                         |
| List attribution        | `order_items.cartKitId` -> `school_engine.cart_kits` (to be dropped/reworked by ADR-0004). No partner/reward attribution.                                                                                                                                                                                                                                                            | `db/src/schema/sales/orders.ts:73`; `db/src/schema/sales/cart-kits.ts:12-18`                                                                                                               |

## 8. Gaps main would need to close to match develop's guarantees

1. A way for one transaction to span order, inventory, rewards, list-selection and outbox writes (develop: `TransactionRunner` port + per-transaction store binding). Main's per-query `db.transaction` style cannot compose; ADR-0001 feature barrels would need an equivalent seam.
2. A persisted Cart keyed by an opaque owner (develop: `sales.storefront_carts`) that can be row-locked to serialize retries.
3. Idempotency outcome table with fingerprint and replay/conflict semantics, key in the request body (or header — open), no TTL.
4. Authoritative in-transaction re-quote with `FOR SHARE` on variants/zones and a price-confirmation digest; delivery zones (develop's `sales.delivery_zones`) do not exist on main.
5. Reservation rows per order + `CHECK (on_hand >= reserved AND reserved >= 0)`, sorted lock order, multi-warehouse fill; decrement at delivery.
6. Immutable accepted-order snapshot (trigger) vs main's mutable `sales.orders` + status columns.
7. Guest Order Access (reference + hashed one-time code).
8. Transactional outbox table + worker (main has no worker process; two Next.js apps only).
9. For List checkout: attribution + pending reward writes, which depend on ADR-0003 (`business_partners`) and ADR-0004 (`school_supply_lists`, `list_selections`, deferred List Offer).

## Open questions for #157

1. **Order table**: evolve main's mutable `sales.orders`/`order_items` (add immutability trigger on snapshot columns + lifecycle events) or add develop-style `accepted_orders(snapshot jsonb)` alongside? The Dashboard's order screens read `sales.orders` today.
2. **Transaction seam under ADR-0001**: introduce a cross-feature `TransactionRunner`-like port (who owns it: a `checkout` application feature? `backend/db`, which must stay framework-agnostic?), or let the `order` feature own a single repository that writes inventory/reward/outbox rows directly?
3. **Signed-in checkout**: develop is guest-only. Main has `orders.userId` and a Current Session model. Does a signed-in Customer get a server-side Cart keyed by user, a guest->user cart merge, and idempotency scope `userId` instead of cookie digest? Is Guest Order Access still issued for signed-in orders?
4. **Idempotency key transport and scope**: body field (develop) vs `Idempotency-Key` header; scope per owner only (develop Cart path) vs owner + operation (develop List path, lifecycle ops). Replay status code (develop: 201 again).
5. **Reservation lifecycle**: develop has no release on cancellation/non-delivery (reservation rows immutable). Main has `order_status` values beyond accepted/delivered; how do cancelled/returned COD orders release `reserved` (append-only compensating movement?).
6. **Warehouse allocation**: keep develop's greedy lowest-warehouse-id fill, or single-warehouse for phase one?
7. **Price confirmation**: adopt the terms-digest "reconfirmation-required" handshake (requires a quote endpoint returning `confirmation`)?
8. **List Offer and discounts**: ADR-0004 deferred List Offer to this ticket; develop applies `offerBasisPoints` per line, half-up. Interaction with main's `sales.discount_rules`?

### Bearing on the Transactional outbox fog

9. **Scope of the outbox**: develop's table is `system.checkout_outbox` with a closed `kind` union; should main's be a general `system.outbox` that also serves `AdminOrderService` status emails (today inline, best-effort) and future Partner invitations?
10. **Worker host**: develop runs a separate supervised worker process. Main has only two Next.js apps; where does the delivery loop run (new Node worker package, cron route, or queue service)?
11. **Payload sensitivity**: develop stores the plaintext guest code and Customer email in the outbox payload. Store a reference and render at delivery instead, or encrypt?
12. **Provider and dedup**: develop fails closed in production with only a Sink. The provider choice (see `origin/research/transactional-messaging-providers`) determines whether the outbox ID can be a provider dedup key; otherwise delivery is at-least-once with possible duplicates.
13. **Code expiry vs retry**: a 15-minute guest code can expire before retries succeed (backoff 5 s -> capped 1 h, 5 attempts). Need reissue or a longer TTL?
14. **Retention**: delivered-row cleanup policy (develop: none by default, runbook-only) and whether exhausted rows block readiness.
