import {
  getCurrentRewardRate,
  insertAcceptedRewardEntitlement,
  type RewardsExecutor,
} from '@findeg/db/queries/rewards';
import { calculateReward } from './valuation';

/** The Reward Rate in force for a Business Partner, as snapshotted into a Quote. */
export interface RewardRateSnapshot {
  readonly id: number;
  readonly pointsPerEgp: string;
  readonly egpPerPoint: string;
}

export interface AcceptedRewardLine {
  readonly orderItemId: number;
  /** Post-discount line total in piasters, delivery excluded. */
  readonly chargedLineTotalPiasters: bigint;
}

export interface AcceptedRewardsInput {
  readonly businessPartnerId: number | null | undefined;
  readonly rate: RewardRateSnapshot | null | undefined;
  readonly lines: readonly AcceptedRewardLine[];
}

/** Reads the partner's current rate with a share lock, for the Quote and the acceptance re-quote. */
export async function readRewardRateSnapshot(
  executor: RewardsExecutor,
  businessPartnerId: number,
): Promise<RewardRateSnapshot | null> {
  const row = await getCurrentRewardRate(executor, businessPartnerId);
  return row ? { id: row.id, pointsPerEgp: row.pointsPerEgp, egpPerPoint: row.egpPerPoint } : null;
}

/**
 * Order Acceptance hook (ADR-0006). Runs inside the acceptance transaction and writes one pending
 * entitlement plus an `accepted` event per attributed line. No partner, no rate, or a zero-point
 * line earns nothing and is not an error. Any write failure propagates and rolls back the Order.
 */
export async function recordAcceptedRewards(
  tx: RewardsExecutor,
  input: AcceptedRewardsInput,
): Promise<void> {
  const { businessPartnerId, rate } = input;
  if (!businessPartnerId || !rate) return;

  for (const line of input.lines) {
    const { points, egpValuePiasters } = calculateReward({
      chargedLineTotalPiasters: line.chargedLineTotalPiasters,
      pointsPerEgp: rate.pointsPerEgp,
      egpPerPoint: rate.egpPerPoint,
    });
    if (points === 0n) continue;

    await insertAcceptedRewardEntitlement(tx, {
      businessPartnerId,
      orderItemId: line.orderItemId,
      rewardRateId: rate.id,
      chargedLineTotalPiasters: line.chargedLineTotalPiasters,
      points,
      egpValuePiasters,
    });
  }
}
