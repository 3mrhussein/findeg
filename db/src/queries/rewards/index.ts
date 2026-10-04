import { and, desc, eq, exists, inArray, notExists, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type {
  NewRewardEntitlement,
  NewRewardRate,
  RewardEntitlementRow,
  RewardEventType,
} from '../../schema';
import { orderItems, rewardEntitlements, rewardEvents, rewardRates } from '../../schema';
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
  await executor.insert(rewardEvents).values(entitlementEvent(entitlement, 'accepted'));
  return entitlement;
}

/** Correlated subquery: the entitlement in the outer query has an event of one of `types`. */
function entitlementEvents(executor: RewardsExecutor, types: readonly RewardEventType[]) {
  return executor
    .select({ one: sql`1` })
    .from(rewardEvents)
    .where(
      and(
        eq(rewardEvents.entitlementId, rewardEntitlements.id),
        inArray(rewardEvents.eventType, [...types]),
      ),
    );
}

/** An event for an entitlement carrying its full stored points and EGP value. */
function entitlementEvent(entitlement: RewardEntitlementRow, eventType: RewardEventType) {
  return {
    businessPartnerId: entitlement.businessPartnerId,
    entitlementId: entitlement.id,
    eventType,
    points: entitlement.points,
    egpValuePiasters: entitlement.egpValuePiasters,
  };
}

const CLOSING_EVENTS = ['cancellation', 'reversal'] as const;

/**
 * Points and EGP still pending for a Partner: entitlements whose only event is `accepted`
 * (not yet paid, cancelled or reversed).
 */
export async function getPendingRewardTotals(executor: RewardsExecutor, businessPartnerId: number) {
  const [row] = await executor
    .select({
      points: sql<string>`coalesce(sum(${rewardEntitlements.points}), 0)`,
      egpValuePiasters: sql<string>`coalesce(sum(${rewardEntitlements.egpValuePiasters}), 0)`,
    })
    .from(rewardEntitlements)
    .where(
      and(
        eq(rewardEntitlements.businessPartnerId, businessPartnerId),
        notExists(entitlementEvents(executor, ['paid', ...CLOSING_EVENTS])),
      ),
    );
  return { points: BigInt(row.points), egpValuePiasters: BigInt(row.egpValuePiasters) };
}

/**
 * Appends a `paid` (earned) event for each of the Order's entitlements that is not already
 * earned, cancelled or reversed. The unique `paid` index makes concurrent callers earn once.
 */
export async function earnOrderRewardEntitlements(executor: RewardsExecutor, orderId: number) {
  const eligible = await executor
    .select({ entitlement: rewardEntitlements })
    .from(rewardEntitlements)
    .innerJoin(orderItems, eq(orderItems.id, rewardEntitlements.orderItemId))
    .where(
      and(eq(orderItems.orderId, orderId), notExists(entitlementEvents(executor, CLOSING_EVENTS))),
    );
  if (eligible.length === 0) return;

  await executor
    .insert(rewardEvents)
    .values(eligible.map(({ entitlement }) => entitlementEvent(entitlement, 'paid')))
    .onConflictDoNothing();
}

/**
 * Closes each of the Order's entitlements not already cancelled or reversed: a pending one gets a
 * `cancellation` (voided), an earned one a `reversal`. The unique `reversal`/`cancellation` index
 * makes a repeat, from either refund path, a no-op.
 */
export async function closeOrderRewardEntitlements(executor: RewardsExecutor, orderId: number) {
  const unclosed = await executor
    .select({
      entitlement: rewardEntitlements,
      isEarned: sql<boolean>`${exists(entitlementEvents(executor, ['paid']))}`,
    })
    .from(rewardEntitlements)
    .innerJoin(orderItems, eq(orderItems.id, rewardEntitlements.orderItemId))
    .where(
      and(eq(orderItems.orderId, orderId), notExists(entitlementEvents(executor, CLOSING_EVENTS))),
    );
  if (unclosed.length === 0) return;

  await executor
    .insert(rewardEvents)
    .values(
      unclosed.map(({ entitlement, isEarned }) =>
        entitlementEvent(entitlement, isEarned ? 'reversal' : 'cancellation'),
      ),
    )
    .onConflictDoNothing();
}

async function sumRewardEvents(
  executor: RewardsExecutor,
  businessPartnerId: number,
  eventType: RewardEventType,
) {
  const [row] = await executor
    .select({
      points: sql<string>`coalesce(sum(${rewardEvents.points}), 0)`,
      egpValuePiasters: sql<string>`coalesce(sum(${rewardEvents.egpValuePiasters}), 0)`,
    })
    .from(rewardEvents)
    .where(
      and(
        eq(rewardEvents.businessPartnerId, businessPartnerId),
        eq(rewardEvents.eventType, eventType),
      ),
    );
  return { points: BigInt(row.points), egpValuePiasters: BigInt(row.egpValuePiasters) };
}

/** Points and EGP ever earned (`paid` events) for a Partner, before any reversal. */
export function getEarnedRewardTotals(executor: RewardsExecutor, businessPartnerId: number) {
  return sumRewardEvents(executor, businessPartnerId, 'paid');
}

/** Points and EGP earned and then reversed by a refund (`reversal` events) for a Partner. */
export function getReversedRewardTotals(executor: RewardsExecutor, businessPartnerId: number) {
  return sumRewardEvents(executor, businessPartnerId, 'reversal');
}
