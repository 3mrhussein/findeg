---
status: proposed
---

# List Selection and List Completeness

Issue #50's stories 4, 5, 6 and 8 need a Customer to fill one School Supply List without it mixing into the Cart or any other list, to pick a Specification-eligible substitute knowing what changes, and to see whether the list is complete without being blocked by it. Main has nothing working: `cart_kits` and `order_items.cart_kit_id` have no writers, `ParentListService` and `school_list_parent_sessions` are stubs, and the list page is a placeholder behind a login wall. The Cart itself is an in-process `Map`. `develop` (reference only, per the parent map) persists each selection server-side as `sales.list_selections(owner_digest, list_id)` behind a guest cookie, and its list checkout reads that saved row. ADR-0004 planned to adopt that table. ADR-0005 then chose a stateless checkout where the client posts its lines and the server re-quotes them. We keep ADR-0005's model for lists too.

Depends on ADR-0004 (lifecycle, `publicCode`, `exactItem` + `specification`), ADR-0005 (Quote, Confirmation, list attribution, idempotency scope) and ADR-0007 (List Offer). Amends ADR-0004's migration plan.

## Decisions

**A List Selection is held on the client.** It lives in localStorage under `findeg:list-selection:<publicCode>` as `{ v: 1, lines: [{ listItemId, variantId, quantity }] }`, with one line per list item. It is seeded from the server's defaults on first visit: required items at their default variant and prescribed quantity, optional items off. Guests and signed-in Customers behave identically. Nothing is synced to the account, and nothing is cleared on sign-in or sign-out. It resets to the defaults after a successful Order Acceptance, and unreadable or wrong-version data is reseeded. ADR-0004's `list_selections` table is not built.

**Guests can use lists.** The page-level login requirement (`SchoolAuthWall`) is removed. Possession of the `publicCode` is the only gate. Deleting the ACL tables stays in its own cleanup ticket.

**Scope is one published version.** The route is `/lists/[publicCode]`, and each published version has its own code, so a selection belongs to exactly one version. An archived list's link stays readable but view-only, with a banner linking to its replacement and checkout disabled. A selection is never carried into a replacement: the replacement starts from its own defaults, and the stale local entry is discarded.

**The list read is live.** A server read by `publicCode` returns:

- the list, its Partner School and status, and the replacement's `publicCode` when archived;
- each item's `required`, prescribed quantity, `exactItem`, specification attributes and default variant;
- per item, the eligible variants with price, brand, the attributes that differ from the default, and an in-stock flag;
- the active List Offer.

It is uncached or short-lived, because eligibility and stock follow the live catalog. Its prices are informational; the Quote remains authoritative.

**Eligibility has one implementation.** The School Supply List feature exports `eligibleVariants(item, candidates)`. For an Exact Item, or an item with no specification (which fails closed), only the default variant is eligible. Otherwise a variant is eligible when its category matches and it has every specified attribute value. The list read and the `checkout` feature both call it; checkout calls it inside the acceptance transaction, with candidates read `FOR SHARE`. The client never decides eligibility.

**Substitutes are compared against the default.** Each item shows its default variant. A non-Exact item has a "Change" control that lists the eligible variants. Each option shows its price, a signed difference from the default's price, its brand, and only the attributes that differ. Out-of-stock options are shown but disabled. An Exact Item has no Change control and says so. The List Offer is shown once for the whole list, not per option, since it applies to every line alike.

**Stale choices are flagged, never auto-substituted.** Each time the page loads, it reconciles the local selection against the list read. A line whose variant is no longer eligible is kept and flagged "Unavailable, choose again", and checkout is disabled while any line is flagged. A line whose `listItemId` is unknown is dropped.

**List Completeness is client-side and advisory.** A selection is complete when every required item's chosen quantity, for any eligible variant, is at least its prescribed quantity. Optional items never count. There is no set count: a Customer buying for two children raises the quantities. Completeness is computed only on the client, from the list read and the local selection. It is shown on the list page as a progress count with the missing items listed, and repeated as one advisory line on the checkout review. It never blocks checkout and is never stored on the Order.

**Checkout takes a discriminated source.** `/checkout/validate` and Order Acceptance accept one of two shapes:

- `{ source: 'cart', lines: [{ variantId, quantity }] }`;
- `{ source: 'list', publicCode, lines: [{ listItemId, variantId, quantity }] }`.

For a list, the server checks the following before quoting:

- the list is `published`, or it returns 409 `list-unavailable`;
- each `listItemId` belongs to the list and appears once;
- each variant is eligible;
- quantities are between 1 and 999;
- the selection is not empty.

Line failures return 422 `selection-invalid` naming the offending `listItemId`s. Quantities may exceed the prescription, and optional items are included only when posted. The List Offer applies per ADR-0007, attribution is snapshotted per ADR-0005, and the idempotency scope carries the `publicCode`.

**The Cart and List Selections never merge.** The Cart drawer holds ordinary items only. It has a separate "Your school lists" section that links each in-progress selection back to its list page. There is no "add list to Cart" path: `SchoolListResults`' add-to-cart and add-bundle buttons are removed. Each list page has its own checkout button into the shared checkout page with `source=list`, and pending-checkout state is kept per source, so a list checkout and a Cart checkout never overwrite each other.

**The dead scaffolding goes.** `school_engine.cart_kits`, `order_items.cart_kit_id`, `CartItem.cartKitId` and the CartDrawer kit grouping and locking are dropped, along with `school_list_parent_sessions`, `sessionQueries` and `ParentListService`. ADR-0005's order-level list attribution and per-line list item and substitute flag replace them. There is no data to migrate.

## Considered options

- **Server-persisted selection (develop, and ADR-0004's plan).** This gives cross-device continuity for signed-in Customers and a lockable row for checkout. Rejected: it needs a table, a guest owner cookie and digest, and an inactivity reset, and it gives list checkout a second path alongside ADR-0005's posted lines. ADR-0005 already rejected a persistent server cart for the same reasons. A list is filled about once a term, so losing cross-device continuity costs little.
- **A set count (develop's `setCount`).** This scales the completeness target by the number of children. Rejected as an extra concept for a rare case that quantity edits already cover.
- **Carrying a selection into a list's replacement.** This would be convenient, but items, specifications and eligibility may all have changed. Mapping choices across versions risks silently buying something the school no longer asks for.
- **Auto-substituting an ineligible choice with the default.** Rejected, because silently changing a parent's pick is worse than asking them to choose again.
- **Merging the list into the Cart as a kit (main's `addListToCart` sketch).** Rejected, because it contradicts the rule that a List Selection never merges with the Cart.

## Consequences

- ADR-0004's migration no longer creates `list_selections`. Its greenfield drops also cover `cart_kits`, `order_items.cart_kit_id` and `school_list_parent_sessions`.
- ADR-0005's checkout request body gains the `source` discriminator. Cart checkout is otherwise unchanged.
- A Customer who clears storage or switches devices loses an in-progress selection and starts again from the defaults.
- Server-side persistence can be added later behind the same posted-lines checkout, without changing the Quote or Order Acceptance.
