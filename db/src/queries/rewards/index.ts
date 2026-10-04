import { and, desc, eq, exists, inArray, notExists, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type {
  NewRewardEntitlement,
  NewRewardRate,
  RewardEntitlementRow,
  RewardEventType,
  RewardSettlementRow,
} from '../../schema';
import {
  orderItems,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  rewardSettlements,
} from '../../schema';
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

/**
 * Appends a partner-level `adjustment` event (signed EGP, no entitlement, zero points). Returns
 * `undefined` when the Business Partner already used this idempotency key; keys are kept forever.
 */
export async function insertRewardAdjustment(
  executor: RewardsExecutor,
  values: {
    businessPartnerId: number;
    egpValuePiasters: bigint;
    reason: string;
    idempotencyKey: string;
    actorUserId: number;
  },
) {
  const [row] = await executor
    .insert(rewardEvents)
    .values({ ...values, eventType: 'adjustment', points: 0n })
    .onConflictDoNothing({
      target: [rewardEvents.businessPartnerId, rewardEvents.idempotencyKey],
      where: sql`${rewardEvents.eventType} = 'adjustment'`,
    })
    .returning();
  return row;
}

/** The adjustment a Business Partner recorded under an idempotency key, if any. */
export async function findRewardAdjustmentByKey(
  executor: RewardsExecutor,
  businessPartnerId: number,
  idempotencyKey: string,
) {
  const [row] = await executor
    .select()
    .from(rewardEvents)
    .where(
      and(
        eq(rewardEvents.businessPartnerId, businessPartnerId),
        eq(rewardEvents.eventType, 'adjustment'),
        eq(rewardEvents.idempotencyKey, idempotencyKey),
      ),
    );
  return row;
}

/**
 * Signed EGP Available Balance in piasters: earned − reversed ± adjustments − settled (ADR-0009).
 * Pending (`accepted`-only) and voided (`cancellation`) entitlements never count. A void line is
 * negative and a write-off positive, so subtracting every settlement-table amount except
 * write-offs, which add, nets out voided settlements and forgiven debt.
 */
export async function getAvailableRewardBalance(
  executor: RewardsExecutor,
  businessPartnerId: number,
): Promise<bigint> {
  const [events] = await executor
    .select({
      balance: sql<string>`coalesce(sum(case ${rewardEvents.eventType}
        when 'paid' then ${rewardEvents.egpValuePiasters}
        when 'reversal' then -${rewardEvents.egpValuePiasters}
        when 'adjustment' then ${rewardEvents.egpValuePiasters}
        else 0 end), 0)`,
    })
    .from(rewardEvents)
    .where(eq(rewardEvents.businessPartnerId, businessPartnerId));
  const [settlements] = await executor
    .select({
      balance: sql<string>`coalesce(sum(case ${rewardSettlements.kind}
        when 'write-off' then ${rewardSettlements.amountPiasters}
        else -${rewardSettlements.amountPiasters} end), 0)`,
    })
    .from(rewardSettlements)
    .where(eq(rewardSettlements.businessPartnerId, businessPartnerId));
  return BigInt(events.balance) + BigInt(settlements.balance);
}

export type NewSettlementLine = Omit<
  typeof rewardSettlements.$inferInsert,
  'id' | 'createdAt' | 'voidsKind'
>;

/**
 * Appends a settlement, void or write-off line. Returns `undefined` when the partner already used
 * the idempotency key, or (for a void) the settlement already has one. Callers hold the partner
 * lock and run in a transaction.
 */
export async function insertRewardSettlementLine(
  executor: RewardsExecutor,
  values: NewSettlementLine,
): Promise<RewardSettlementRow | undefined> {
  const [row] = await executor
    .insert(rewardSettlements)
    .values(values)
    .onConflictDoNothing()
    .returning();
  return row;
}

/** The settlement or write-off a Business Partner recorded under an idempotency key, if any. */
export async function findRewardSettlementByKey(
  executor: RewardsExecutor,
  businessPartnerId: number,
  idempotencyKey: string,
) {
  const [row] = await executor
    .select()
    .from(rewardSettlements)
    .where(
      and(
        eq(rewardSettlements.businessPartnerId, businessPartnerId),
        eq(rewardSettlements.idempotencyKey, idempotencyKey),
      ),
    );
  return row;
}

export async function findRewardSettlementById(
  executor: RewardsExecutor,
  businessPartnerId: number,
  id: number,
) {
  const [row] = await executor
    .select()
    .from(rewardSettlements)
    .where(
      and(eq(rewardSettlements.businessPartnerId, businessPartnerId), eq(rewardSettlements.id, id)),
    );
  return row;
}

export async function findRewardSettlementVoid(executor: RewardsExecutor, settlementId: number) {
  const [row] = await executor
    .select()
    .from(rewardSettlements)
    .where(eq(rewardSettlements.voidsSettlementId, settlementId));
  return row;
}

/** Newest-first settlement, void and write-off lines for one Business Partner. */
export function listRewardSettlementLines(executor: RewardsExecutor, businessPartnerId: number) {
  return executor
    .select()
    .from(rewardSettlements)
    .where(eq(rewardSettlements.businessPartnerId, businessPartnerId))
    .orderBy(desc(rewardSettlements.id));
}
