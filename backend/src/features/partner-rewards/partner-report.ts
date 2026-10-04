import { PARTNER_ADMINISTRATOR, type PartnerRole } from '@findeg/db/schema';
import { getBusinessPartnerById, getActiveMembershipRoles } from '@findeg/db/queries/partners';
import {
  listPartnerSettlementLines,
  type PartnerSettlementLineRow,
  type RewardsDatabase,
} from '@findeg/db/queries/rewards';
import type { RewardAmount } from './monthly-statement';
import { isMonthKey } from './months';
import type { ReportLocale, SalesRowView } from './sales-table';
import {
  partnerSource,
  readStatementAndSales,
  type StatementAndSales,
} from './statement-and-sales';
import { fail, ok, type RewardRateResult } from './staff-access';

/** A sales row is shown only when at least this many distinct Orders contributed (ADR-0010). */
export const MIN_DISTINCT_ORDERS_PER_SALES_ROW = 3;

/** The Partner Roles that read Reports. `list-manager` and `collection-staff` do not. */
const REPORT_ROLES: readonly PartnerRole[] = [PARTNER_ADMINISTRATOR, 'report-viewer'];

/** A sales row as a Partner sees it: no Order count and no ids. */
export type PartnerSalesRowView = Omit<
  SalesRowView,
  'month' | 'listId' | 'listItemId' | 'variantId' | 'orderCount'
>;

export interface PartnerSettlementLineView {
  readonly id: number;
  /** A `void` has a negative amount and is shown as "Voided" against `voidsSettlementId`. */
  readonly kind: PartnerSettlementLineRow['kind'];
  readonly amountPiasters: bigint;
  readonly transferReference: string | null;
  /** `YYYY-MM-DD`. Shown on the history row only; lines are placed by `recordedAt`. */
  readonly paidAt: string | null;
  readonly voidsSettlementId: number | null;
  readonly recordedAt: Date;
}

/**
 * The Partner projection of the statement-and-sales read (ADR-0010). Same money as the Staff
 * projection, limited: aggregated sales with small rows rolled up, settlement history without
 * notes, actors or void reasons, and no per-adjustment detail.
 */
export interface PartnerRewardReportView extends Omit<StatementAndSales, 'sales'> {
  readonly sales: readonly PartnerSalesRowView[];
  /** Suppressed rows rolled up so the table's totals equal the statement's movements. */
  readonly otherItems: { readonly earned: RewardAmount; readonly reversed: RewardAmount } | null;
  readonly settlements: readonly PartnerSettlementLineView[];
}

export interface PartnerRewardReportOptions {
  /** `YYYY-MM` in Cairo time, within `months`. Defaults to the current month. */
  readonly month?: string;
  readonly locale?: ReportLocale;
}

export type PartnerRewardReportError = 'forbidden' | 'invalid-input' | 'not-found';

const addAmount = (a: RewardAmount, b: RewardAmount): RewardAmount => ({
  points: a.points + b.points,
  egpPiasters: a.egpPiasters + b.egpPiasters,
});

/** Applies the suppression threshold and the "Other items" roll-up to the shared sales rows. */
export function projectPartnerSales(sales: readonly SalesRowView[]) {
  const shown: PartnerSalesRowView[] = [];
  const other = {
    earned: { points: 0n, egpPiasters: 0n },
    reversed: { points: 0n, egpPiasters: 0n },
  };
  let suppressed = 0;
  for (const row of sales) {
    if (row.orderCount >= MIN_DISTINCT_ORDERS_PER_SALES_ROW) {
      shown.push({
        listName: row.listName,
        listItemLabel: row.listItemLabel,
        productName: row.productName,
        variantLabel: row.variantLabel,
        earned: row.earned,
        reversed: row.reversed,
      });
      continue;
    }
    suppressed += 1;
    other.earned = addAmount(other.earned, row.earned);
    other.reversed = addAmount(other.reversed, row.reversed);
  }
  return { sales: shown, otherItems: suppressed > 0 ? other : null };
}

export interface IPartnerRewardReportService {
  /**
   * Monthly Reward Statement and sales for a member of the Business Partner holding
   * `partner-administrator` or `report-viewer`, whatever the Business Partner's status.
   */
  getPartnerReport(
    actor: { readonly userId: number },
    businessPartnerId: number,
    options?: PartnerRewardReportOptions,
  ): Promise<RewardRateResult<PartnerRewardReportView, PartnerRewardReportError>>;
}

export class PartnerRewardReportService implements IPartnerRewardReportService {
  constructor(
    private readonly getDb: () => Promise<RewardsDatabase>,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getPartnerReport(
    actor: { readonly userId: number },
    businessPartnerId: number,
    options: PartnerRewardReportOptions = {},
  ) {
    if (options.month !== undefined && !isMonthKey(options.month)) return fail('invalid-input');

    const db = await this.getDb();
    const roles = await getActiveMembershipRoles(db, businessPartnerId, actor.userId);
    if (!roles?.some((role) => REPORT_ROLES.includes(role))) return fail('forbidden');
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');

    const asOf = this.now();
    return db.transaction(
      async (tx) => {
        const shared = await readStatementAndSales(
          tx,
          businessPartnerId,
          { month: options.month, locale: options.locale ?? 'en', asOf },
          partnerSource,
        );
        if (!shared) return fail('invalid-input');
        const settlements = await listPartnerSettlementLines(tx, businessPartnerId);
        return ok({
          ...shared,
          ...projectPartnerSales(shared.sales),
          settlements: settlements.map((row) => ({ ...row })),
        });
      },
      { isolationLevel: 'repeatable read', accessMode: 'read only' },
    );
  }
}
