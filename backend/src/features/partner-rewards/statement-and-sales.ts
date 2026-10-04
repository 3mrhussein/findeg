import {
  getAvailableRewardBalance,
  getFirstRewardEventMonth,
  getPartnerAvailableRewardBalance,
  getPartnerFirstRewardEventMonth,
  getPartnerPendingRewardTotals,
  getPartnerRewardMovementsByMonth,
  getPartnerRewardSalesRows,
  getPendingRewardTotals,
  getRewardMovementsByMonth,
  getRewardSalesRows,
  type RewardMovementRow,
  type RewardSalesRow,
  type RewardsExecutor,
} from '@findeg/db/queries/rewards';
import {
  buildMonthlyStatement,
  type MonthlyStatementView,
  type RewardAmount,
} from './monthly-statement';
import { cairoMonthOf, monthsBetween, REWARDS_TIME_ZONE } from './months';
import { toSalesRowView, type ReportLocale, type SalesRowView } from './sales-table';

/**
 * The shared figures of the statement-and-sales read (ADR-0010): every money number any
 * projection shows. The Staff projection adds detail around it and a Partner projection limits
 * it, so no projection computes money of its own and the two cannot disagree.
 */
export interface StatementAndSales {
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

/**
 * Where the shared figures are read from. The Staff source reads the ledger tables; the Partner
 * source reads only Partner-safe views (ADR-0010). Both return the same shapes, so the money
 * math below is written once.
 */
export interface StatementAndSalesSource {
  movementsByMonth(
    tx: RewardsExecutor,
    businessPartnerId: number,
    timeZone: string,
  ): Promise<RewardMovementRow[]>;
  firstEventMonth(
    tx: RewardsExecutor,
    businessPartnerId: number,
    timeZone: string,
  ): Promise<string | null>;
  pendingTotals(
    tx: RewardsExecutor,
    businessPartnerId: number,
  ): Promise<{ points: bigint; egpValuePiasters: bigint }>;
  availableBalance(tx: RewardsExecutor, businessPartnerId: number): Promise<bigint>;
  salesRows(
    tx: RewardsExecutor,
    businessPartnerId: number,
    month: string,
    timeZone: string,
  ): Promise<RewardSalesRow[]>;
}

export const staffSource: StatementAndSalesSource = {
  movementsByMonth: getRewardMovementsByMonth,
  firstEventMonth: getFirstRewardEventMonth,
  pendingTotals: getPendingRewardTotals,
  availableBalance: getAvailableRewardBalance,
  salesRows: getRewardSalesRows,
};

export const partnerSource: StatementAndSalesSource = {
  movementsByMonth: getPartnerRewardMovementsByMonth,
  firstEventMonth: getPartnerFirstRewardEventMonth,
  pendingTotals: getPartnerPendingRewardTotals,
  availableBalance: getPartnerAvailableRewardBalance,
  salesRows: getPartnerRewardSalesRows,
};

export interface StatementAndSalesInput {
  /** `YYYY-MM` in Cairo time, within the picker range. Defaults to the current month. */
  readonly month?: string;
  readonly locale: ReportLocale;
  readonly asOf: Date;
}

/**
 * Reads the shared figures for one Business Partner. Callers authorize first and pass a
 * transaction opened for a consistent snapshot. Returns `undefined` for a month outside the
 * picker range.
 */
export async function readStatementAndSales(
  tx: RewardsExecutor,
  businessPartnerId: number,
  input: StatementAndSalesInput,
  source: StatementAndSalesSource = staffSource,
): Promise<StatementAndSales | undefined> {
  const currentMonth = cairoMonthOf(input.asOf);
  const [movements, firstMonth, pending, availableBalance] = await Promise.all([
    source.movementsByMonth(tx, businessPartnerId, REWARDS_TIME_ZONE),
    source.firstEventMonth(tx, businessPartnerId, REWARDS_TIME_ZONE),
    source.pendingTotals(tx, businessPartnerId),
    source.availableBalance(tx, businessPartnerId),
  ]);
  const months = firstMonth ? monthsBetween(firstMonth, currentMonth) : [];
  const month = input.month ?? currentMonth;
  if (months.length > 0 ? !months.includes(month) : month !== currentMonth) return undefined;

  const salesRows = await source.salesRows(tx, businessPartnerId, month, REWARDS_TIME_ZONE);
  return {
    asOf: input.asOf,
    months,
    statement: buildMonthlyStatement(movements, month),
    pending: { points: pending.points, egpPiasters: pending.egpValuePiasters },
    availableBalanceEgpPiasters: availableBalance,
    sales: salesRows.map((row) => toSalesRowView(row, input.locale)),
  };
}
