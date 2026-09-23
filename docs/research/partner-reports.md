# Partner Reports: develop's views vs main's rewards and settlement design

Research for issue #162, part of #146. It answers what `develop` built for Partner Reports and how that fits main's proposed ADR-0003 (Partner Membership), ADR-0005 (Order Acceptance), ADR-0006 (rewards ledger) and ADR-0009 (settlement).

Sources: `origin/develop` (reference implementation), issue #50 (the phase-one spec), the ADR branches `origin/docs/adr-000{3,5,6,9}-*`, and `docs/research/partner-rewards-attribution.md` on `origin/research/partner-rewards-attribution`. All `path:line` citations point into `origin/develop` unless marked otherwise.

## Summary

Develop's Partner Reports are one read operation, `GET /api/v1/partner/{partnerId}/reports?period=YYYY-MM`. It returns two things:

- a cumulative Reward Statement (pending, earned, reversed, settled and available, in points and in EGP), and
- a monthly table of paid Attributed Sales, grouped by day, list, list item and Product Variant, with rows under three distinct Orders suppressed.

The report shows no Order References and no Customer data. Partner Administrators and Report Viewers see exactly the same report. Freshness is "live views", with no enforced lag. Settlements appear only as a `settled` total and a clamped `available` total.

Most of this carries over to main. The main conflicts are:

- Develop clamps `available` at zero. ADR-0009 shows it signed.
- Develop stores settlements as events. ADR-0009 stores them in a separate table.
- Develop's sales view counts later-refunded Orders.
- Develop's SQL depends on a JSON snapshot table and on `identity`-schema tables that main will not have.

## 1. What develop's Partner Reports expose

### Database views

Develop has two read-only views. Both are in the `identity` schema and were created by migration 0011.

**`identity.partner_report_events`** (`db/migrations/0011_partner_report_views.sql:2-9`, redefined in `db/migrations/0013_reward_event_values.sql:4-12`). One row per ledger event, with these columns:

- `id`, `business_partner_id`, `order_reference`, `event_type`
- `points`, `pending_points`, `earned_points`, `created_at`
- a derived `value`: the event's stored EGP value if present, otherwise the entitlement's `reward_value` for `accepted`/`paid` events, otherwise `points × conversion_rate`

The view deliberately leaves out these ledger columns: `conversion_rate`, `fulfillment`, `verified_bank_account_id`, `settlement_reference`, `reason` and actor (see the ledger columns at `db/migrations/0008_partner_reward_events.sql:1-18`). `DISTINCT` is there only to make the view non-updatable (`0011:1`).

This view is order-level: it includes `order_reference`. That column never reaches the API.

**`identity.partner_report_sales`** (`0011:12-25`). This view reads three sources:

- the paid entitlements, from `partner_reward_entitlements`
- the immutable Order snapshot, `sales.accepted_orders.snapshot`, where it gets the line's `listId`, `listItemId` and `variantId`
- the Order's `paid` lifecycle event, which supplies the `day` (the UTC date of payment)

It then groups by `(business_partner_id, day, list_id, list_item_id, variant_id)` and outputs `count(DISTINCT order_reference)` and `sum(eligible_subtotal)`. It is an aggregate with "no customer columns" (`0011:11`).

The Drizzle definitions of both views are in `db/src/modules/partner-reports/schema.ts:4-27`.

### The adapter and the operation

The adapter reads the views filtered by partner:

- `eventsThrough(partnerId, before)` returns events created before the end of the month (`backend/src/modules/partner-reports/infrastructure/persistence.ts:9-21`).
- `salesDuring(partnerId, start, end)` returns sales rows for days inside the month (`persistence.ts:22-46`).

`readPartnerStatement` combines the two results (`backend/src/modules/partner-reports/public.ts:83-101`):

- The events are folded with `summarizeRewardStatement` into cumulative balances through the end of the selected UTC month.
- If any event lacks a valid EGP value, the EGP column becomes `null` instead of being computed from a rate (`backend/src/modules/partner-rewards/accounting.ts:117-128`; `docs/package-guidance.md:142-144`).

### API response

The response shape is `{partnerId, period, statement: {points, value}, sales: [{day, listId, listItemId, variantId, count, subtotal}], suppressed}`. It is defined in `backend/src/modules/partner-reports/contracts.ts:22-36` and `docs/contracts/openapi/v1.yaml:2032-2093`. The contract declares `count` with `minimum: 3` (`v1.yaml:2087-2089`).

### Order-level detail vs aggregates

The API returns aggregates only. Two things show this:

- The DB-backed integration test asserts that the response contains neither the Customer's email nor the Order Reference (`tests/reward-acceptance.test.mjs:372-373`).
- It also asserts that sales rows have exactly the six aggregate keys (`tests/reward-acceptance.test.mjs:394-401`).

The Partner can see no event list and no per-Order drill-down.

### Hidden Customer data

Customer name, email, phone, delivery address and the raw Order snapshot never reach the adapter (`docs/package-guidance.md:139-141`; `v1.yaml:2038-2039`). There is also an older, unused in-memory helper, `sanitizePartnerReportRow`, which removes `customerName/email/phone/delivery*` from a row (`partner-reports/public.ts:11-20`; `contracts.ts:1-11`; `__tests__/public.test.ts:9-53`). The real protection is structural: neither view contains those columns.

### UI

`frontend/web/src/components/partner-report.tsx` has three parts:

- a month picker labeled "Month (UTC)" (`:47-60`)
- a five-row balance table with Points and EGP columns, captioned "Cumulative balances through the end of the selected month". When the EGP value is null it shows "Unknown historical value" (`:66-92`).
- a "Paid attributed sales this month" table, with a privacy notice when `suppressed` is true (`:93-125`)

The list, list item and variant appear as raw numeric IDs, not names (`:117-119`). The UI is bilingual (EN/AR).

## 2. Which Partner Roles can read what, and how it is enforced

**Who can read.** Only `partner-administrator` and `report-viewer` can read the report. `list-manager` and `collection-staff` cannot. Both allowed roles get an identical report; nothing in it varies by role.

**How the operation enforces it.** The check sits inside the application operation (`backend/src/application/partner-reports.ts:20-47`). The steps are:

1. Resolve the Current Session. Without one, the result is `authentication-required` (`:21-25`).
2. Validate `partnerId` and `period` (`:26-31`).
3. Resolve the Partner Workspace for that `partnerId` (`:32-36`). `workspace()` needs a verified email and an eligible membership (`backend/src/modules/partner-management/public.ts:81-110`). Eligible means the membership is `active` and its Business Partner is `active` (`backend/src/modules/partner-management/infrastructure/persistence.ts:55-70`).
4. Check that the membership's roles include `partner-administrator` or `report-viewer` (`partner-reports.ts:37-42`). If not, the result is `authorization-denied` and the Current Session is preserved.

The route maps these outcomes to 401 and 403 (`frontend/web/src/app/api/v1/partner/[partnerId]/reports/route.ts:4-14`; `frontend/web/src/server/partner-api.ts:6-9`).

**Page-level check.** The Workspace page repeats the role check before it renders `<PartnerReport>` (`frontend/web/src/app/[locale]/partner/(protected)/[partnerId]/page.tsx:41-43`).

**Tenant scope.** Every query filters on `business_partner_id` before suppression. Another partner's rows affect neither the returned rows nor the `suppressed` flag (`persistence.ts:15,35`; `docs/package-guidance.md:173-175`). The test inserts events for another partner, then checks that reading that partner's report is denied (`tests/reward-acceptance.test.mjs:346-367`).

**No database-level enforcement.** The views have no row-level security and no grants (grep of `db/migrations/*.sql`). Isolation relies on the adapter always filtering.

**No FindEg Staff view.** Staff have no report read path. The Back Office has reward-rates and reward-workflows routes, but no statement or report route (`frontend/web/src/app/api/v1/back-office/partners/[partnerId]/`).

## 3. Reporting lag, freshness and anonymity thresholds

**Lag.** Issue #50 requires "a maximum fifteen-minute reporting lag". Develop meets it trivially: the views are plain, live SQL views, "so their reporting lag is below fifteen minutes" (`docs/package-guidance.md:149-150`). No materialized view, refresh job or as-of timestamp exists, and the response does not report freshness.

**Minimum count.** Develop hides sales rows whose `count` of distinct paid Orders is below 3. It drops them rather than rolling them up, and sets `suppressed: true` (`partner-reports/public.ts:97-99`; `docs/package-guidance.md:146-148`).

- The threshold is hard-coded to 3 in `readPartnerStatement`.
- The unused `buildPartnerReports` helper makes it configurable, with a default of 3 (`public.ts:31-41,60-65`).
- The integration test checks both sides of the threshold. With 2 paid Orders, `sales = []` and `suppressed` is true. With 3, one row with `count = 3` is returned (`tests/reward-acceptance.test.mjs:362-363,386-393`).

**Weaknesses in the suppression:**

1. **The balances are never suppressed.** A monthly change in `earned` or `pending` can reveal a single Order's value, for example when a school has one Order in a month.
2. **Suppression applies only at the finest grain.** It is checked per (day, list item, variant). Hidden rows are not added back as an "other" bucket, so the sales table does not reconcile with the statement.
3. **Refunded or cancelled Orders still count.** The sales view counts every Order with a `paid` lifecycle event and has no join to reversals (`0011:21`). A refunded Order keeps its count and its subtotal.

**Time zone.** Days and months are UTC (`0011:15`; `partner-reports/public.ts:88-91`; UI label). An Egyptian school's day boundary at 00:00 Cairo time falls at 22:00 or 21:00 UTC, so late-evening sales are dated to the wrong day and, at month end, to the wrong month.

## 4. How settlements and balances appear to Partners

**Settlements.** In develop, a settlement is a `settlement` ledger event. It needs a Finance-verified opaque bank-account ID, a settlement reference and a label `orderReference` (`backend/src/modules/partner-rewards/contracts.ts:1-2,52-61`; `backend/src/application/partner-rewards.ts:57-85`). Finance with `finance.manage` records it in the Back Office (`partner-rewards.ts:121-133`).

**Balances.** Partners see only two cumulative figures: `settled`, the sum of settlement events, and `available`. Both come from `accounting.ts:36-82`:

- `available = floor(earned − settled)`, clamped at 0 (`:81`).
- `earned` already has refunds, reversals and cancellations netted out, also with a zero floor (`:78`; `docs/package-guidance.md:165-171`).

**What Partners do not see.** They see no individual settlements, transfer references, paid-at dates, bank identifiers or reasons, because the events view excludes those columns (`0011:3-4`). They also see no pending-payout state and cannot request a payout.

## 5. Mapping onto main's design

This section follows the questions in order. Each point states what carries over and what conflicts.

**Roles and routes (ADR-0003).** These fit directly.

- ADR-0003 keeps develop's four roles. It checks `membership.roles` directly, not through `PermissionService`, and selects the partner with the route segment `/partner/[partnerId]` in `frontend/storefront` (ADR-0003:18-22). Develop's role check and page gating port as-is.
- **Difference:** ADR-0003 validates "an active `PartnerMembership`" (ADR-0003:22). Develop also requires the Business Partner itself to be `active` (`persistence.ts:64`). The Partner Reports ticket should decide whether a suspended or closed partner can still read its historical statement.
- `partner_access_history` exists "ahead of" Reports (ADR-0003:33). Develop does not audit report reads.

**Ledger and statement (ADR-0006).** Main's ledger lives in a new `rewards` schema (ADR-0006:21). It has one `reward_entitlements` row per `order_items` row and `reward_events` rows of `accepted | paid | cancellation | reversal | adjustment` (ADR-0006:19). Develop's views point at `identity.partner_reward_*` and at `sales.accepted_orders.snapshot` JSON (`0011:8-9,16-20`). Main does not have that snapshot table: ADR-0005 freezes snapshot columns on `sales.orders`/`order_items`, and records the per-line list item and the per-order `businessPartnerId` there (ADR-0005:13,29).

The sales view therefore has to be rewritten against `order_items`, joined to `reward_entitlements`. The rewrite is simpler: no JSON path lookups and no `line_index`.

Two more mapping points:

- **Day of a sale.** Main earns when an Order is both `delivered` and `paid` (ADR-0006:26). Develop dates a sale by the `paid` event's time. The natural equivalent in main is the entitlement's `paid` event time.
- **Refunds.** Main reverses rewards automatically on `cancelled`/`refunded` (ADR-0006:27). That makes weakness 3 above easy to fix: exclude entitlements that have a `reversal`/`cancellation` event, or report net figures.

**Settlement and Available Balance (ADR-0009).** This is where the conflicts are.

1. **Clamp vs signed.** Develop floors `available` (and `earned`) at 0 (`accounting.ts:36,78-82`). ADR-0009 makes Available Balance EGP-only and signed, and says a negative balance "must [be rendered] clearly" in any future Partner view (ADR-0009:15-17,47). Develop's UI has no negative state, and its points column would no longer match: under ADR-0009, points "never limit a settlement" and stay for display only (ADR-0009:15).
2. **Settlements are no longer events.** ADR-0009 keeps settlements in `rewards.reward_settlements` rows (amount, transfer reference, paid-at, actor, notes, idempotency key), with void rows. The `settlement` event kind is removed (ADR-0009:19-21). A settled total must therefore sum settlements plus their voids from a second source. It can no longer be folded from one event stream.
3. **Which settlement fields Partners see.** Transfer reference and notes are kept forever as financial records. ADR-0009 explicitly leaves "which Partner Roles see them, and at what detail" to Partner Reports (ADR-0009:23,31). Develop showed only the total.
4. **No bank data to hide.** ADR-0009 drops verified-bank-account IDs (ADR-0009:23), so develop's column exclusion for them is no longer needed.
5. **Points in the Available Balance.** ADR-0009 defines Available Balance in EGP only. Develop computes `available` for both points and EGP, and the design ticket must decide whether a points "available" figure is still shown.

**Order References and guest access (ADR-0005, ADR-0008).** In main, the Order Reference is public and not secret (ADR-0005:27). Guest Order Access asks for the reference and the email, then sends a one-time code (CONTEXT, Guest Order Access on `origin/docs/adr-0009-partner-rewards-settlement`). A Partner who knows a parent's email could combine it with a leaked reference to trigger code emails. That makes develop's rule of never exposing Order References to Partners worth keeping. The rule is enforced today only by a test (`tests/reward-acceptance.test.mjs:373`); no view excludes the column.

**Apps and placement.** Main keeps separate `frontend/storefront` (Partner Workspace, per ADR-0003) and `frontend/dashboard` (Staff, per ADR-0009:27) apps. Develop had one `frontend/web`. The Partner report page goes in the storefront. The Staff statement view that ADR-0009 promises goes in the dashboard; develop has no equivalent.

**Lag and freshness.** Live views on the shared database satisfy the fifteen-minute requirement from issue #50 on main too. Nothing in ADR-0005/0006/0009 introduces asynchronous projections that would change this.

## 6. Open questions for the Partner Reports design ticket

1. **Negative Available Balance.** How does the Partner Workspace show a negative balance (label, explanation, whether a points "available" figure is shown at all)? Should `earned` keep develop's zero floor, or show signed net values too?
2. **Settlement detail.** Should Partners see a settlement history (amount, paid-at date, transfer reference, voids) or only the `settled` total? Are Staff notes always hidden from Partners?
3. **Role split.** Should Report Viewers and Partner Administrators keep seeing the same report, or should financial settlement detail be admin-only?
4. **Partner status.** Can members of a suspended or closed Business Partner still read historical statements?
5. **Statement period.** Should the statement stay cumulative "through month end", or show monthly movements (opening balance, earned, reversed, settled, closing balance) so it reconciles with the sales table?
6. **Balance suppression.** Should minimum-count suppression also cover monthly balance changes, or accept that balance totals can reveal a single Order? Should suppressed rows roll up into an "other" row so totals reconcile?
7. **Threshold.** Is the minimum count a constant 3, or configurable? Is it counted in distinct Orders (develop) or distinct Customers?
8. **Net vs gross sales.** Should the sales table count only unreversed entitlements, or show gross and reversed sales separately?
9. **Time zone.** Should day and month boundaries use Africa/Cairo instead of UTC?
10. **Names instead of IDs.** Should rows show list, list item and Product Variant names (in the Partner's locale), and does that need a join to catalog tables?
11. **Database-level isolation.** Should views live in the `rewards` schema with enforced column exclusion (no `order_reference`), and should partner isolation get a DB-level guard such as a partner-parameterized function, or stay adapter-only?
12. **Audit.** Should report reads be written to `partner_access_history`?
13. **Staff statement.** Should the Staff statement view in `frontend/dashboard` reuse the same operation, with Order-level detail allowed for Staff?
