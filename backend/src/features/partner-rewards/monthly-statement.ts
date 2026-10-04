import type { RewardMovementRow } from '@findeg/db/queries/rewards';

export interface RewardAmount {
  readonly points: bigint;
  readonly egpPiasters: bigint;
}

/**
 * One month of a Business Partner's Reward Statement. Opening + earned − reversed + adjustments −
 * settled = closing. Reversed and settled are shown as positive amounts that subtract; a void
 * recorded in the month reduces settled, which is then negative if it voids an earlier payout.
 */
export interface MonthlyStatementView {
  /** `YYYY-MM` in Cairo time. */
  readonly month: string;
  readonly openingEgpPiasters: bigint;
  readonly earned: RewardAmount;
  readonly reversed: RewardAmount;
  /** Signed. Adjustments and debt forgiveness, never itemised. */
  readonly adjustmentsEgpPiasters: bigint;
  readonly settledEgpPiasters: bigint;
  readonly closingEgpPiasters: bigint;
}

const ZERO: RewardAmount = { points: 0n, egpPiasters: 0n };

function sumCategory(rows: readonly RewardMovementRow[], category: RewardMovementRow['category']) {
  return rows
    .filter((row) => row.category === category)
    .reduce<RewardAmount>(
      (total, row) => ({
        points: total.points + row.points,
        egpPiasters: total.egpPiasters + row.egpPiasters,
      }),
      ZERO,
    );
}

/** The balance change of every movement, signed: earned and adjustments add, the rest subtract. */
function balanceEffect(rows: readonly RewardMovementRow[]) {
  return (
    sumCategory(rows, 'earned').egpPiasters -
    sumCategory(rows, 'reversed').egpPiasters +
    sumCategory(rows, 'adjustment').egpPiasters -
    sumCategory(rows, 'settled').egpPiasters
  );
}

/** Derives one month's statement from the partner's movements. Months compare as `YYYY-MM`. */
export function buildMonthlyStatement(
  movements: readonly RewardMovementRow[],
  month: string,
): MonthlyStatementView {
  const before = movements.filter((row) => row.month < month);
  const inMonth = movements.filter((row) => row.month === month);
  const openingEgpPiasters = balanceEffect(before);
  return {
    month,
    openingEgpPiasters,
    earned: sumCategory(inMonth, 'earned'),
    reversed: sumCategory(inMonth, 'reversed'),
    adjustmentsEgpPiasters: sumCategory(inMonth, 'adjustment').egpPiasters,
    settledEgpPiasters: sumCategory(inMonth, 'settled').egpPiasters,
    closingEgpPiasters: openingEgpPiasters + balanceEffect(inMonth),
  };
}
