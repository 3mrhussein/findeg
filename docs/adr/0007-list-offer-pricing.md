---
status: proposed
---

# List Offer and School Supply List line pricing

A List Offer is a percentage discount on one School Supply List. ADR-0004 deferred it until checkout existed. ADR-0005 now makes the Quote the single place where discounts are computed, and ADR-0006 computes Partner Points on the Quote's post-discount line total. Before List Offers can be built, we needed to decide what price a List line is charged at and how the offer is applied. Main already has a `sales.discount_rules` coupon table and a `Pricing.applyDiscounts` helper, but nothing uses them; both branches leave them unused. `develop` (reference only) applies a per-list basis-point offer to live catalog prices. We adopt that shape.

Depends on ADR-0004 (lists, Exact Items, Specifications), ADR-0005 (Quote, Confirmation, order snapshot) and ADR-0006 (reward basis). Amends ADR-0004's publish snapshot.

## Decisions

**List lines are priced at the live catalog price.** The re-quote reads each variant's current price `FOR SHARE`, the same way it does for ordinary lines. ADR-0004 froze a unit price onto each List item at publish; that price is dropped from the snapshot. Name and SKU stay frozen. The Confirmation already protects the Customer if the price moves between Quote and Order Acceptance.

**The List Offer is the only discount in phase one.** `discount_rules` and `applyDiscounts` stay unused, and coupons are out of scope. With one discount source, there is no stacking rule to decide. The Quote still represents discounts as per-line entries tagged with their source (for now always `list-offer`), so a later coupon or promotion is an added entry, not a new Quote shape. How discounts stack gets decided when a second source exists.

**Shape.** `sales.list_offers` holds one row per list, keyed by `list_id`, with `basis_points` (0–10000), `starts_at` and `ends_at` (both `timestamptz`, `ends_at` nullable meaning open-ended, CHECK `ends_at > starts_at`). A list with no row has no offer; the table has no default rows. The offer sits outside the list's publish freeze, so it can change without republishing; the order snapshot is what keeps history. Only FindEg Staff can set offers in phase one, from `frontend/dashboard`. When a replacement list is published, it copies the current offer of the list it replaces.

**Application.** An active offer (`starts_at <= acceptance time < ends_at`) applies to every line of the List Selection, whether the line is the Exact Item or a Specification-eligible substitute. Each line total is `gross × (10000 − bps) / 10000`, where `gross` is the unit price × quantity in integer piasters. It is rounded half-up to a piaster once per line, using exact BigInt math. The subtotal is the sum of those line totals. Catalog `decimal(12,2)` prices convert exactly to piasters at the Quote boundary.

**Confirmation.** The re-quote reads the offer `FOR SHARE`. If the offer is created, changed, starts or ends between Quote and Order Acceptance, the Confirmation no longer matches and the Customer gets `409 reconfirmation-required`. The Customer is never charged an offer they were not shown, and never silently loses one.

**Snapshot.** `order_items` gains `unit_price` (the gross catalog price), `discount_amount` and `line_total` (the post-discount total, which is the Partner Points basis). `orders` gains `list_offer_basis_points` and `discount_total`. These columns are frozen by ADR-0005's trigger. No per-source discount breakdown table is built until a second source exists.

## Considered options

- **Frozen publish price (ADR-0004).** This would give a stable price for the list's lifetime. Rejected because Specification-eligible substitutes have no publish-time price, since eligibility is computed at selection time. One order would then mix frozen and live prices, and the Partner Points basis would depend on which kind of line the Customer picked.
- **Apply the offer to Exact Items only.** Rejected because it penalises the Customer exactly when the Exact Item is out of stock and a substitute is needed. The offer belongs to the list, not to particular items.
- **Wire `discount_rules` coupons now and define stacking.** Rejected because nothing uses coupons today, and the table has no scope or stacking model.

## Consequences

- ADR-0004's publish snapshot no longer includes the unit price. List pages show live prices.
- The List Offer changes Partner Points: an offer of _n_ basis points reduces the reward basis by the same proportion.
- Adding a second discount source requires a stacking rule, and probably an `order_item_discounts` breakdown table.
