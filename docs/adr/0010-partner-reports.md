---
status: proposed
---

# Partner Reports

Partner Schools need to see what they have earned and been paid, without learning anything about the Customers who bought from their lists. `develop` (reference only) shipped one Partner report. It had a cumulative Reward Statement with `available` clamped at 0, and a daily table of paid sales in UTC, grouped by list item and variant with raw IDs. Groups under 3 Orders were dropped. Balances were never suppressed, refunded Orders were still counted, and the sales table did not reconcile with the statement. The research file lives on branch `docs/research-partner-reports`, not on main.

Depends on ADR-0003 (Partner Membership, `/partner/[code]` in `frontend/storefront`), ADR-0006 (ledger), ADR-0008 (Guest Order Access) and ADR-0009 (settlements, signed Available Balance).

## Decisions

**Aggregates only.** No Order Reference and no Customer field reaches the Partner read path, and there is no per-Order drill-down. In main an Order Reference plus an email starts Guest Order Access (ADR-0008), so a Partner must never hold references.

**Access.** Only `partner-administrator` and `report-viewer` read the report, and both see all of it. `list-manager` and `collection-staff` have no access. The only requirement is an active `PartnerMembership`, whatever the Business Partner's status, so a suspended or closed school can still see what it is owed or owes. Suspended or ended memberships never read. Reads are not logged to `partner_access_history`, which stays an audit of membership and role changes.

**Monthly movement statement.** For a selected month the Reward Statement shows an opening Available Balance, then earned, reversed, adjustments and settled, then the closing Available Balance. Pending appears as a separate point-in-time figure. The current month's closing balance is the live Available Balance. The first month opens at 0. Before a partner's first Reward Event the Workspace shows an empty state, and after it the month picker runs from the first event's month to the current month.

**Cairo time.** Every day and month boundary uses `Africa/Cairo`, a single constant. Each movement is placed by the time it was recorded, never by a date Staff enter. A settlement is placed by its recorded-at time, and its `paid-at` date appears only on its history row. A void is placed in the month it was recorded. A past month's statement therefore never changes.

**Negative balance.** The Available Balance is shown signed in EGP, for example "−120.00 EGP", with a fixed EN/AR explanation: reversals after the last payout exceeded the balance, and future earnings offset this first. Points appear only on the pending, earned and reversed lines. There is no points "available" figure and no points on settlements.

**Settlements and adjustments.** Partners see a settlement history with amount, `paid-at` date and transfer reference. A void appears as a negative line marked "Voided" against the original. Staff notes, the Staff actor and void reasons are never shown. Adjustments, including debt forgiveness, appear only as one monthly total, with no individual rows or reasons.

**Sales table.** The sales table has one row per month × list × list item × Product Variant, with an earned column and a reversed column. Each is placed by its own Reward Event in Cairo time. Pending entitlements are not in the table. Rows are grouped by ID and show live names: the list name, the list item label, the product's `localizedName` in the viewer's locale and the variant label. When the catalog row is gone, the name falls back to the `order_items` snapshot.

**Suppression.** A sales row is shown only if at least 3 distinct Orders contributed to it. The threshold is a code constant. Suppressed rows roll up into a single "Other items" row, so the table's totals equal the statement's earned and reversed movements. The statement's movement lines are never suppressed: they are the Partner's own money and are needed to reconcile payouts. The accepted cost is that a month with one Order shows that Order's reward value, though never who placed it.

**Freshness.** Everything is computed on read from live tables and views, with no projections or refresh jobs. That meets issue #50's 15-minute lag requirement. The response carries an as-of timestamp for the UI to display.

**One operation, two projections.** A single statement-and-sales read in the `partner-rewards` feature holds the money math. The Partner route calls it with the Partner projection, which applies the limits above. The Staff dashboard calls it with a Staff projection, which adds Order References, per-entitlement events, settlement notes, actor and void reasons, with no suppression. Staff read access needs a new read-only `rewards.view` permission, separate from `rewards.adjust`, `rewards.rates.manage` and `rewards.settle`.

**Isolation.** The Partner projection reads only Partner-safe views in the `rewards` schema. These views have no `order_reference` column and no Customer columns, so the privacy rule holds by construction. Every adapter function requires `partnerId`, and an integration test proves another partner's rows never leak. There is no RLS, since main uses none.

## Considered options

- **Cumulative statement only (develop)**: never reconciles with a month's sales. Rejected for monthly movements.
- **Day grain with drop-only suppression (develop)**: a small school's table is mostly hidden, and the totals don't add up. Rejected for month grain with an "Other items" roll-up.
- **Suppressing statement movements too**: hides the Partner's own money and breaks payout reconciliation. Rejected.
- **Counting distinct Customers**: guest Customers can't be de-duplicated reliably. Rejected for distinct Orders.
- **Gross paid sales (develop)**: keeps refunded Orders. Rejected for separate earned and reversed columns.
- **Clamping available at 0, and points "available" (develop)**: contradicts ADR-0009's signed, EGP-only balance.
- **Settlement total only (develop)**: the school can't match payouts to its bank statement. **Showing void reasons**: they are Staff free text, like notes. Both rejected.
- **Financial detail admin-only**: `report-viewer` exists for staff like a bursar who reconciles payouts. Rejected.
- **Active Business Partner required (develop)**: locks a suspended or closed school out of its final statement. Rejected.
- **Placing settlements by `paid-at`**: backdating would rewrite a month the Partner has already seen. Rejected.
- **Postgres RLS**: it would be the first use in main and needs connection-level session state. **Adapter queries without views**: the privacy rule would be true only by test. Both rejected.
- **Materialized views**: unnecessary at phase-one volume.
- **Logging report reads**: no Customer data to protect and no consumer. Rejected.

## Consequences

- ADR-0003 expected `partner_access_history` to serve Reports. It doesn't, and the table stays a membership audit.
- Partner and Staff totals share one computation, so they cannot disagree. Any new money figure has to be added to that shared read, not to one projection.
- CSV export is not built. It is additive to the same operation if schools ask for it.
