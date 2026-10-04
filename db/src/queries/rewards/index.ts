import { desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { NewRewardRate } from '../../schema';
import { rewardRates } from '../../schema';
import * as schema from '../../schema';

export type RewardsDatabase = PostgresJsDatabase<typeof schema>;
export type RewardsTransaction = Parameters<Parameters<RewardsDatabase['transaction']>[0]>[0];
export type RewardsExecutor = RewardsDatabase | RewardsTransaction;
export type RewardRateRow = typeof rewardRates.$inferSelect;

/** Appends a Reward Rate. Existing rates are never updated. */
export async function insertRewardRate(executor: RewardsExecutor, values: NewRewardRate) {
  const [row] = await executor.insert(rewardRates).values(values).returning();
  return row;
}

/** Newest-first immutable rate history for one Business Partner. */
export function listRewardRates(executor: RewardsExecutor, businessPartnerId: number) {
  return executor
    .select()
    .from(rewardRates)
    .where(eq(rewardRates.businessPartnerId, businessPartnerId))
    .orderBy(desc(rewardRates.id));
}

/**
 * The latest rate is current. The share lock lets Order Acceptance hold the
 * selected rate stable when this query is called with its transaction.
 */
export async function getCurrentRewardRate(executor: RewardsExecutor, businessPartnerId: number) {
  const [row] = await executor
    .select()
    .from(rewardRates)
    .where(eq(rewardRates.businessPartnerId, businessPartnerId))
    .orderBy(desc(rewardRates.id))
    .limit(1)
    .for('share');
  return row;
}
