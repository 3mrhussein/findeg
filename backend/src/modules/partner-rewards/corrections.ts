import { summarizeRewardLedger, summarizeRewardStatement } from './accounting.js';
import type { PartnerRewardEvent, PartnerRewardCorrectionInput } from './contracts.js';

/** Shared correction eligibility for domain callers and transaction-bound persistence. */
export function canCorrectReward(
  prior: readonly PartnerRewardEvent[],
  action: PartnerRewardCorrectionInput['action'],
  points: number,
): boolean {
  if (!Number.isSafeInteger(points) || points === 0 || (action !== 'adjustment' && points < 0))
    return false;
  const summary = summarizeRewardLedger(prior);
  switch (action) {
    case 'adjustment':
      return true;
    case 'settlement':
      return points <= summary.available;
    case 'cancellation':
      return (
        prior.some((event) => event.eventType === 'accepted') &&
        points <= summary.pending + summary.earned
      );
    case 'refund':
      return prior.some((event) => event.eventType === 'paid') && points <= summary.earned;
    case 'reversal':
      return prior.some((event) => event.eventType === 'accepted') && points <= summary.earned;
  }
}

export type ValuedRewardEvent = PartnerRewardEvent & { readonly value: string | null };
const minor = (value: string) => BigInt(value.replace('.', ''));
const format = (value: bigint) => {
  const absolute = value < 0n ? -value : value;
  return `${value < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
};

/** Allocate recorded piasters, rounding half up; the final portion receives the exact remainder. */
export function allocateRewardValue(value: string, points: bigint, totalPoints: bigint): string {
  if (points === 0n) return '0.00';
  if (totalPoints <= 0n || points < 0n) throw new Error('Invalid reward allocation');
  return format((minor(value) * points * 2n + totalPoints) / (2n * totalPoints));
}

/** Corrections use the recorded balance, never the currently configured conversion rate. */
export function correctionValue(
  prior: readonly ValuedRewardEvent[],
  correction: PartnerRewardCorrectionInput,
): string | undefined {
  const statement = summarizeRewardStatement(prior);
  if (!statement.value) return;
  const points = BigInt(correction.points);
  const take = (balance: 'pending' | 'earned' | 'available', amount: bigint) =>
    minor(
      allocateRewardValue(statement.value![balance], amount, BigInt(statement.points[balance])),
    );
  switch (correction.action) {
    case 'settlement':
      return format(take('available', points));
    case 'refund':
    case 'reversal':
      return format(-take('earned', points));
    case 'cancellation': {
      const pending = BigInt(statement.points.pending);
      const cancelledPending = points < pending ? points : pending;
      return format(-take('pending', cancelledPending) - take('earned', points - cancelledPending));
    }
    case 'adjustment': {
      const accepted = prior.filter((event) => event.eventType === 'accepted');
      const totalPoints = accepted.reduce((sum, event) => sum + BigInt(event.points), 0n);
      if (totalPoints <= 0n) return;
      const totalValue = accepted.reduce((sum, event) => sum + minor(event.value!), 0n);
      const amount = minor(
        allocateRewardValue(format(totalValue), points < 0n ? -points : points, totalPoints),
      );
      return format(points < 0n ? -amount : amount);
    }
  }
}
