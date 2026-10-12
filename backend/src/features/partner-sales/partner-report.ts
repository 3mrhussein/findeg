import { getActiveMembershipRoles, getBusinessPartnerById } from '@findeg/db/queries/partners';
import {
  BUSINESS_TIME_ZONE,
  businessMonthOf,
  canReadPartnerReport,
  LIVE_ORDER_STATUSES,
  money,
  PARTNER_REPORT_MIN_ORDERS,
  PARTNER_REPORT_ROLES as DOMAIN_PARTNER_REPORT_ROLES,
  rollUpPartnerReport,
  type PartnerRole,
} from '@findeg/domain';
import {
  getFirstAttributedOrderMonth,
  listAttributedSalesRows,
  type AttributedSalesRow,
  type PartnerSalesDatabase,
  type PartnerSalesExecutor,
} from '@findeg/db/queries/partner-sales';
import {
  canViewPartnerReports,
  fail,
  ok,
  READ_SNAPSHOT,
  type PartnerSalesResult,
  type PartnerSalesStaffActor,
} from './access';
import type { AttributedPaymentStatus } from './attributed-orders';
import { isMonthKey, monthRange, monthsBetween } from './time';

/** A sales row is shown to a Partner only when at least this many distinct Orders contributed. */
export const MIN_DISTINCT_ORDERS_PER_SALES_ROW = PARTNER_REPORT_MIN_ORDERS;

/** The Partner Roles that read Partner Reports. `list-manager` and `collection-staff` do not. */
export const PARTNER_REPORT_ROLES: readonly PartnerRole[] = DOMAIN_PARTNER_REPORT_ROLES;

/** Whether a member holding `roles` reads Partner Reports (ADR-0010, delegated to the domain). */
export const canReadPartnerReports = (roles: readonly PartnerRole[]) =>
  canReadPartnerReport({ status: 'active', roles });

/**
 * Payment statuses a Partner Report counts alongside live Order statuses (`LIVE_ORDER_STATUSES`).
 * A delivered Order whose payment was refunded stays out of the report.
 */
export const REPORTED_PAYMENT_STATUSES: readonly AttributedPaymentStatus[] = ['unpaid', 'paid'];

export type ReportLocale = 'en' | 'ar';

/**
 * One row of the sales table: a list × list item × variant within the month, with the units sold
 * and the charged amount. Names are live in the viewer's locale, falling back to the other
 * locale and then to the `order_items` snapshot when the catalog row is gone.
 */
export interface SalesRowView {
  readonly listId: number | null;
  readonly listName: string | null;
  readonly listItemId: number | null;
  readonly listItemLabel: string | null;
  readonly variantId: number | null;
  readonly productName: string | null;
  readonly variantLabel: string | null;
  readonly quantity: number;
  /** Post-discount line totals in piasters, without shipping. */
  readonly chargedPiasters: bigint;
  /** Distinct Orders that contributed. Never an Order Reference. */
  readonly orderCount: number;
}

/** The monthly sales read both projections share, so they cannot disagree. */
export interface MonthlySalesView {
  /** When the figures were read. Everything is computed live. */
  readonly asOf: Date;
  /** The month picker: first Attributed Order month through the current month, empty before any. */
  readonly months: readonly string[];
  /** `YYYY-MM` in Cairo time. */
  readonly month: string;
  readonly sales: readonly SalesRowView[];
}

/** A sales row as a Partner sees it: no Order count and no ids. */
export type PartnerSalesRowView = Pick<
  SalesRowView,
  'listName' | 'listItemLabel' | 'productName' | 'variantLabel' | 'quantity' | 'chargedPiasters'
>;

/** Rows under the Order threshold, rolled up. */
export interface OtherItemsView {
  readonly quantity: number;
  readonly chargedPiasters: bigint;
}

/** The Partner projection: small rows rolled into "Other items", no counts or ids. */
export interface PartnerReportView extends Omit<MonthlySalesView, 'sales'> {
  readonly sales: readonly PartnerSalesRowView[];
  readonly otherItems: OtherItemsView | null;
}

/** The Staff projection: every row, with ids and Order counts, unsuppressed. */
export type StaffPartnerReportView = MonthlySalesView;

export interface PartnerReportOptions {
  /** `YYYY-MM` in Cairo time, within `months`. Defaults to the current month. */
  readonly month?: string;
  /** Language of list, item, product and variant names. Defaults to `en`. */
  readonly locale?: ReportLocale;
}

/** An active membership implies the Business Partner exists, so there is no `not-found`. */
export type PartnerReportError = 'forbidden' | 'invalid-input';
export type StaffPartnerReportError = 'forbidden' | 'invalid-input' | 'not-found';

function localized(
  map: { en?: string; ar?: string } | null,
  locale: ReportLocale,
  snapshot: string | null = null,
) {
  const other = locale === 'en' ? 'ar' : 'en';
  return map?.[locale]?.trim() || map?.[other]?.trim() || snapshot;
}

export function toSalesRowView(row: AttributedSalesRow, locale: ReportLocale): SalesRowView {
  return {
    listId: row.listId,
    listName: localized(row.listTitle, locale),
    listItemId: row.listItemId,
    listItemLabel: localized(row.listItemLabel, locale),
    variantId: row.variantId,
    productName: localized(row.productName, locale, row.productNameSnapshot),
    variantLabel:
      localized(row.variantLabel, locale) ?? localized(row.variantLabelSnapshot, locale),
    quantity: row.quantity,
    chargedPiasters: row.chargedPiasters,
    orderCount: row.orderCount,
  };
}

/**
 * Applies the suppression threshold and the "Other items" roll-up (ADR-0010) with the domain's
 * `rollUpPartnerReport`, so totals still add up. Shown rows lose their ids and Order counts.
 */
export function projectPartnerSales(sales: readonly SalesRowView[]) {
  const { rows, otherItems } = rollUpPartnerReport(
    sales.map((row) => ({
      ...row,
      distinctOrders: row.orderCount,
      quantity: row.quantity,
      charged: money(row.chargedPiasters),
    })),
  );
  const shown: PartnerSalesRowView[] = rows.map((row) => ({
    listName: row.listName,
    listItemLabel: row.listItemLabel,
    productName: row.productName,
    variantLabel: row.variantLabel,
    quantity: row.quantity,
    chargedPiasters: row.charged,
  }));
  const other: OtherItemsView | null = otherItems && {
    quantity: otherItems.quantity,
    chargedPiasters: otherItems.charged,
  };
  return { sales: shown, otherItems: other };
}

/**
 * Reads one Business Partner's monthly sales. Callers authorize first and pass a transaction
 * opened for a consistent snapshot. Returns `undefined` for a month outside the picker range.
 */
async function readMonthlySales(
  tx: PartnerSalesExecutor,
  businessPartnerId: number,
  input: { month?: string; locale: ReportLocale; asOf: Date },
): Promise<MonthlySalesView | undefined> {
  const currentMonth = businessMonthOf(input.asOf);
  const firstMonth = await getFirstAttributedOrderMonth(tx, businessPartnerId, BUSINESS_TIME_ZONE);
  const months =
    firstMonth && firstMonth <= currentMonth ? monthsBetween(firstMonth, currentMonth) : [];
  const month = input.month ?? currentMonth;
  if (months.length > 0 ? !months.includes(month) : month !== currentMonth) return undefined;

  const rows = await listAttributedSalesRows(tx, {
    businessPartnerId,
    ...monthRange(month),
    timeZone: BUSINESS_TIME_ZONE,
    orderStatuses: LIVE_ORDER_STATUSES,
    paymentStatuses: REPORTED_PAYMENT_STATUSES,
  });
  return {
    asOf: input.asOf,
    months,
    month,
    sales: rows.map((row) => toSalesRowView(row, input.locale)),
  };
}

export interface IPartnerReportService {
  /**
   * Monthly sales for a member of the Business Partner holding `partner-administrator` or
   * `report-viewer`, whatever the Business Partner's status (ADR-0010, ADR-0012).
   */
  getPartnerReport(
    actor: { readonly userId: number },
    businessPartnerId: number,
    options?: PartnerReportOptions,
  ): Promise<PartnerSalesResult<PartnerReportView, PartnerReportError>>;
  /** The same monthly sales, unsuppressed, for Staff holding `partner.reports.view`. */
  getStaffReport(
    actor: PartnerSalesStaffActor,
    businessPartnerId: number,
    options?: PartnerReportOptions,
  ): Promise<PartnerSalesResult<StaffPartnerReportView, StaffPartnerReportError>>;
}

export class PartnerReportService implements IPartnerReportService {
  constructor(
    private readonly getDb: () => Promise<PartnerSalesDatabase>,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getPartnerReport(
    actor: { readonly userId: number },
    businessPartnerId: number,
    options: PartnerReportOptions = {},
  ) {
    if (options.month !== undefined && !isMonthKey(options.month)) return fail('invalid-input');

    const db = await this.getDb();
    const roles = await getActiveMembershipRoles(db, businessPartnerId, actor.userId);
    if (!roles || !canReadPartnerReports(roles)) return fail('forbidden');

    const shared = await this.read(db, businessPartnerId, options);
    return shared ? ok({ ...shared, ...projectPartnerSales(shared.sales) }) : fail('invalid-input');
  }

  async getStaffReport(
    actor: PartnerSalesStaffActor,
    businessPartnerId: number,
    options: PartnerReportOptions = {},
  ) {
    if (!canViewPartnerReports(actor)) return fail('forbidden');
    if (options.month !== undefined && !isMonthKey(options.month)) return fail('invalid-input');

    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');

    const shared = await this.read(db, businessPartnerId, options);
    return shared ? ok(shared) : fail('invalid-input');
  }

  private read(db: PartnerSalesDatabase, businessPartnerId: number, options: PartnerReportOptions) {
    const input = { month: options.month, locale: options.locale ?? 'en', asOf: this.now() };
    return db.transaction((tx) => readMonthlySales(tx, businessPartnerId, input), READ_SNAPSHOT);
  }
}
