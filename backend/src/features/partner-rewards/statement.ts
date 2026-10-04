import {
  getAvailableRewardBalance,
  getFirstRewardEventMonth,
  getPendingRewardTotals,
  getRewardMovementsByMonth,
  getRewardSalesRows,
  type RewardsDatabase,
} from '@findeg/db/queries/rewards';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import { PERMISSION_CODES } from '@findeg/db';
import {
  buildMonthlyStatement,
  type MonthlyStatementView,
  type RewardAmount,
} from './monthly-statement';
import { readStaffReportDetail, type StaffReportDetail } from './staff-report';
import { toSalesRowView, type ReportLocale, type SalesRowView } from './sales-table';
import { cairoMonthOf, isMonthKey, monthsBetween, REWARDS_TIME_ZONE } from './months';
import {
  canViewRewards,
  fail,
  hasPermission,
  ok,
  type RewardRateResult,
  type RewardsStaffActor,
} from './staff-access';

export interface AvailableBalanceView {
  /** Signed EGP in piasters: earned − reversed ± adjustments. Pending never counts. */
  readonly egpPiasters: bigint;
}

export interface StaffRewardReportOptions {
  /** `YYYY-MM` in Cairo time, within `months`. Defaults to the current month. */
  readonly month?: string;
  /** Language of list, item, product and variant names. Defaults to `en`. */
  readonly locale?: ReportLocale;
}

/**
 * The Staff projection of the statement-and-sales read (ADR-0010). Every money figure comes from
 * one computation, so any Partner projection built on it cannot disagree.
 */
export interface StaffRewardReportView extends StaffReportDetail {
  /** When the figures were read. Everything is computed live, never from a projection. */
  readonly asOf: Date;
  /** The month picker: first Reward Event month through the current month, empty before any. */
  readonly months: readonly string[];
  readonly statement: MonthlyStatementView;
  /** Point-in-time, never part of a month's movements or the balance. */
  readonly pending: RewardAmount;
  /** Live signed Available Balance. Equals the current month's closing balance. */
  readonly availableBalanceEgpPiasters: bigint;
  /** The selected month's sales. Earned and reversed totals equal the statement's movements. */
  readonly sales: readonly SalesRowView[];
}

export type StaffRewardReportError = 'forbidden' | 'invalid-input' | 'not-found';

export interface IRewardStatementService {
  /** Monthly Reward Statement and sales for Staff holding `rewards.view`. */
  getStaffReport(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    options?: StaffRewardReportOptions,
  ): Promise<RewardRateResult<StaffRewardReportView, StaffRewardReportError>>;
  getAvailableBalance(
    actor: RewardsStaffActor,
    businessPartnerId: number,
  ): Promise<RewardRateResult<AvailableBalanceView, 'forbidden' | 'not-found'>>;
}

export class RewardStatementService implements IRewardStatementService {
  constructor(
    private readonly getDb: () => Promise<RewardsDatabase>,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getStaffReport(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    options: StaffRewardReportOptions = {},
  ) {
    if (!hasPermission(actor, PERMISSION_CODES.REWARDS_VIEW)) return fail('forbidden');
    if (options.month !== undefined && !isMonthKey(options.month)) return fail('invalid-input');

    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');

    const asOf = this.now();
    const currentMonth = cairoMonthOf(asOf);
    // One snapshot, so the statement, pending figure and live balance cannot straddle a write.
    return db.transaction(
      async (tx) => {
        const [movements, firstMonth, pending, availableBalance] = await Promise.all([
          getRewardMovementsByMonth(tx, businessPartnerId, REWARDS_TIME_ZONE),
          getFirstRewardEventMonth(tx, businessPartnerId, REWARDS_TIME_ZONE),
          getPendingRewardTotals(tx, businessPartnerId),
          getAvailableRewardBalance(tx, businessPartnerId),
        ]);
        const months = firstMonth ? monthsBetween(firstMonth, currentMonth) : [];
        const month = options.month ?? currentMonth;
        if (months.length > 0 ? !months.includes(month) : month !== currentMonth) {
          return fail('invalid-input');
        }
        const salesRows = await getRewardSalesRows(tx, businessPartnerId, month, REWARDS_TIME_ZONE);
        const detail = await readStaffReportDetail(tx, businessPartnerId, month, REWARDS_TIME_ZONE);
        return ok({
          ...detail,
          asOf,
          months,
          statement: buildMonthlyStatement(movements, month),
          pending: { points: pending.points, egpPiasters: pending.egpValuePiasters },
          availableBalanceEgpPiasters: availableBalance,
          sales: salesRows.map((row) => toSalesRowView(row, options.locale ?? 'en')),
        });
      },
      { isolationLevel: 'repeatable read', accessMode: 'read only' },
    );
  }

  async getAvailableBalance(actor: RewardsStaffActor, businessPartnerId: number) {
    if (!canViewRewards(actor)) return fail('forbidden');
    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');
    return ok({ egpPiasters: await getAvailableRewardBalance(db, businessPartnerId) });
  }
}
