import { and, desc, eq, notExists, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { NewRewardEntitlement, NewRewardRate } from '../../schema';
import { rewardEntitlements, rewardEvents, rewardRates } from '../../schema';
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
 * The latest rate visible to this statement is current. Per ADR-0006, Order
 * Acceptance takes a share lock on that immutable row; this does not block a
 * newer rate from being appended concurrently.
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

/**
 * Writes one pending Reward Entitlement and its `accepted` event. Callers pass the
 * acceptance transaction so a failure here rolls back the whole Order.
 */
export async function insertAcceptedRewardEntitlement(
  executor: RewardsExecutor,
  values: NewRewardEntitlement,
) {
  const [entitlement] = await executor.insert(rewardEntitlements).values(values).returning();
  await executor.insert(rewardEvents).values({
    businessPartnerId: entitlement.businessPartnerId,
    entitlementId: entitlement.id,
    eventType: 'accepted',
    points: entitlement.points,
    egpValuePiasters: entitlement.egpValuePiasters,
  });
  return entitlement;
}

/**
 * Points and EGP still pending for a Partner: entitlements whose only event is `accepted`
 * (not yet paid, cancelled or reversed).
 */
export async function getPendingRewardTotals(executor: RewardsExecutor, businessPartnerId: number) {
  const settled = executor
    .select({ one: sql`1` })
    .from(rewardEvents)
    .where(
      and(
        eq(rewardEvents.entitlementId, rewardEntitlements.id),
        sql`${rewardEvents.eventType} in ('paid', 'cancellation', 'reversal')`,
      ),
    );
  const [row] = await executor
    .select({
      points: sql<string>`coalesce(sum(${rewardEntitlements.points}), 0)`,
      egpValuePiasters: sql<string>`coalesce(sum(${rewardEntitlements.egpValuePiasters}), 0)`,
    })
    .from(rewardEntitlements)
    .where(and(eq(rewardEntitlements.businessPartnerId, businessPartnerId), notExists(settled)));
  return { points: BigInt(row.points), egpValuePiasters: BigInt(row.egpValuePiasters) };
}
