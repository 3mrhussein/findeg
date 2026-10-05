# Partner Sales Feature

Reads over Attributed Orders: the Orders placed from a Business Partner's School Supply Lists. See
[ADR-0013](../../../../docs/adr/0013-partner-rewards-deferred-to-attributed-order-reads.md),
[ADR-0010](../../../../docs/adr/0010-partner-reports.md) and the terms in `CONTEXT.md`. Nothing here
writes; checkout and order transitions never call into this feature.

## Public interface (barrel)

`createPartnerSalesServices({ db?, now? })` returns `{ attributedOrders, partnerReports }`. `now`
(default: system time) places the current Cairo month in tests.

- `attributedOrders.getAttributedOrders(actor, partnerId, { from, to, orderStatuses?, paymentStatuses? })`:
  Staff holding `partner.reports.view` (or `system_admin`). Returns the Business Partner's Attributed Orders
  accepted between two Cairo calendar days (both inclusive), oldest first, with totals. Money is in
  piasters: gross, discount and charged (gross minus discount, without shipping). No Customer field
  is returned. There is no UI on it yet.
- `partnerReports.getPartnerReport({ userId }, partnerId, { month?, locale? })`: an active member
  holding `partner-administrator` or `report-viewer`, in every Business Partner status. Monthly sales
  by list item × variant (units and charged amount); rows from fewer than
  `MIN_DISTINCT_ORDERS_PER_SALES_ROW` distinct Orders roll up into `otherItems`. No Order Reference,
  Order count, id or Customer field.
- `partnerReports.getStaffReport(actor, partnerId, { month?, locale? })`: the same rows for Staff
  holding `partner.reports.view`, unsuppressed, with ids and Order counts.

## Rules

- Every day and month boundary is `Africa/Cairo` (`PARTNER_SALES_TIME_ZONE`), summer time included.
  An Order belongs to the day and month it was accepted.
- Partner Reports count Attributed Orders that are not cancelled or refunded
  (`REPORTED_ORDER_STATUSES`, `REPORTED_PAYMENT_STATUSES`). A later cancellation or refund removes the
  Order from its month. Figures are computed on read.
- Variant names come from the live catalog, falling back to the localized label checkout snapshots
  into `order_items.variant_snapshot`.
