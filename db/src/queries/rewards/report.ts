import { and, asc, desc, eq, inArray, isNotNull, sql, type AnyColumn } from 'drizzle-orm';
import {
  orderItems,
  orders,
  productVariants,
  products,
  rewardEntitlements,
  rewardEvents,
  rewardSettlements,
  schoolSupplyListItems,
  schoolSupplyLists,
  users,
} from '../../schema';
import type { RewardEventType } from '../../schema';

/** A localized name as stored in a jsonb column. Either language may be missing. */
export interface LocalizedName {
  readonly en?: string;
  readonly ar?: string;
}
import type { RewardsExecutor } from './index';

/** How a movement changes the Available Balance. Reversed and settled lines subtract. */
export type RewardMovementCategory = 'earned' | 'reversed' | 'adjustment' | 'settled';

export interface RewardMovementRow {
  /** `YYYY-MM` of the instant the movement was recorded, in the caller's time zone. */
  readonly month: string;
  readonly category: RewardMovementCategory;
  readonly points: bigint;
  /** Signed piasters. A void nets against `settled`, so a month's settled total can be negative. */
  readonly egpPiasters: bigint;
}

const monthOf = (column: AnyColumn, timeZone: string) =>
  sql<string>`to_char(${column} at time zone ${timeZone}::text, 'YYYY-MM')`;

/**
 * A Business Partner's balance movements grouped by the month they were recorded in `timeZone`.
 * Every movement is placed by its own `created_at`, never by a date Staff enter, so a past
 * month never changes. Settlement lines are placed by recorded-at; `paid_at` is not read here.
 * Pending, accepted and cancellation events move no balance and are not returned.
 */
export async function getRewardMovementsByMonth(
  executor: RewardsExecutor,
  businessPartnerId: number,
  timeZone: string,
): Promise<RewardMovementRow[]> {
  const eventMonth = monthOf(rewardEvents.createdAt, timeZone);
  const eventCategory = sql<RewardMovementCategory>`case ${rewardEvents.eventType}
    when 'paid' then 'earned' when 'reversal' then 'reversed' else 'adjustment' end`;
  const events = await executor
    .select({
      month: eventMonth,
      category: eventCategory,
      points: sql<string>`sum(${rewardEvents.points})`,
      egpPiasters: sql<string>`sum(${rewardEvents.egpValuePiasters})`,
    })
    .from(rewardEvents)
    .where(
      and(
        eq(rewardEvents.businessPartnerId, businessPartnerId),
        inArray(rewardEvents.eventType, ['paid', 'reversal', 'adjustment']),
      ),
    )
    .groupBy(sql`1`, sql`2`);

  const settlementMonth = monthOf(rewardSettlements.createdAt, timeZone);
  // A void is negative, so summing settlement and void lines nets out voided payouts.
  const settlementCategory = sql<RewardMovementCategory>`case ${rewardSettlements.kind}
    when 'debt-forgiveness' then 'adjustment' else 'settled' end`;
  const settlements = await executor
    .select({
      month: settlementMonth,
      category: settlementCategory,
      egpPiasters: sql<string>`sum(${rewardSettlements.amountPiasters})`,
    })
    .from(rewardSettlements)
    .where(eq(rewardSettlements.businessPartnerId, businessPartnerId))
    .groupBy(sql`1`, sql`2`);

  return [
    ...events.map((row) => ({
      month: row.month,
      category: row.category,
      points: BigInt(row.points),
      egpPiasters: BigInt(row.egpPiasters),
    })),
    ...settlements.map((row) => ({
      month: row.month,
      category: row.category,
      points: 0n,
      egpPiasters: BigInt(row.egpPiasters),
    })),
  ];
}

/** `YYYY-MM` of a Business Partner's first Reward Event in `timeZone`, or null before any. */
export async function getFirstRewardEventMonth(
  executor: RewardsExecutor,
  businessPartnerId: number,
  timeZone: string,
): Promise<string | null> {
  const [row] = await executor
    .select({
      month: sql<
        string | null
      >`to_char(min(${rewardEvents.createdAt}) at time zone ${timeZone}::text, 'YYYY-MM')`,
    })
    .from(rewardEvents)
    .where(eq(rewardEvents.businessPartnerId, businessPartnerId));
  return row?.month ?? null;
}

export interface RewardSalesRow {
  readonly month: string;
  /** Null only if the Order carries no list attribution, which entitlements never do. */
  readonly listId: number | null;
  readonly listItemId: number | null;
  readonly variantId: number | null;
  readonly productId: number | null;
  readonly earnedPoints: bigint;
  readonly earnedEgpPiasters: bigint;
  readonly reversedPoints: bigint;
  readonly reversedEgpPiasters: bigint;
  /** Distinct Orders with an earned or reversed event in the row. */
  readonly orderCount: number;
  /** Live catalog names. Each is null when its catalog row no longer exists. */
  readonly listTitle: LocalizedName | null;
  readonly listItemLabel: LocalizedName | null;
  readonly productName: LocalizedName | null;
  readonly variantLabel: LocalizedName | null;
  /** The `order_items` snapshot, for when a live name is missing. */
  readonly productNameSnapshot: string | null;
  readonly variantLabelSnapshot: string | null;
}

/**
 * Earned (`paid`) and reversed (`reversal`) rewards for one month, grouped by list, list item and
 * variant. Each is placed by its own event's recorded-at instant in `timeZone`, so the rows add up
 * to the statement's earned and reversed movements for that month. Pending entitlements and
 * cancellations have no `paid` or `reversal` event and never appear.
 */
export async function getRewardSalesRows(
  executor: RewardsExecutor,
  businessPartnerId: number,
  month: string,
  timeZone: string,
): Promise<RewardSalesRow[]> {
  const eventMonth = monthOf(rewardEvents.createdAt, timeZone);
  const sumWhen = (type: 'paid' | 'reversal', column: AnyColumn) =>
    sql<string>`coalesce(sum(case when ${rewardEvents.eventType} = ${type} then ${column} else 0 end), 0)`;

  const rows = await executor
    .select({
      listId: orders.schoolSupplyListId,
      listItemId: orderItems.schoolSupplyListItemId,
      variantId: orderItems.variantId,
      productId: orderItems.productId,
      earnedPoints: sumWhen('paid', rewardEvents.points),
      earnedEgpPiasters: sumWhen('paid', rewardEvents.egpValuePiasters),
      reversedPoints: sumWhen('reversal', rewardEvents.points),
      reversedEgpPiasters: sumWhen('reversal', rewardEvents.egpValuePiasters),
      orderCount: sql<number>`count(distinct ${orders.id})::int`,
      listTitle: schoolSupplyLists.localizedTitle,
      listItemLabel: schoolSupplyListItems.localizedLabel,
      productName: products.localizedName,
      variantLabel: productVariants.localizedLabel,
      productNameSnapshot: sql<string | null>`max(${orderItems.productNameSnapshot})`,
      variantLabelSnapshot: sql<string | null>`max(${orderItems.variantSnapshot}->>'label')`,
    })
    .from(rewardEvents)
    .innerJoin(rewardEntitlements, eq(rewardEntitlements.id, rewardEvents.entitlementId))
    .innerJoin(orderItems, eq(orderItems.id, rewardEntitlements.orderItemId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .leftJoin(schoolSupplyLists, eq(schoolSupplyLists.id, orders.schoolSupplyListId))
    .leftJoin(
      schoolSupplyListItems,
      eq(schoolSupplyListItems.id, orderItems.schoolSupplyListItemId),
    )
    .leftJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .where(
      and(
        eq(rewardEvents.businessPartnerId, businessPartnerId),
        inArray(rewardEvents.eventType, ['paid', 'reversal']),
        sql`${eventMonth} = ${month}`,
      ),
    )
    .groupBy(
      orders.schoolSupplyListId,
      orderItems.schoolSupplyListItemId,
      orderItems.variantId,
      orderItems.productId,
      schoolSupplyLists.localizedTitle,
      schoolSupplyListItems.localizedLabel,
      products.localizedName,
      productVariants.localizedLabel,
    )
    .orderBy(
      asc(orders.schoolSupplyListId),
      asc(orderItems.schoolSupplyListItemId),
      asc(orderItems.variantId),
    );

  return rows.map((row) => ({
    month,
    ...row,
    earnedPoints: BigInt(row.earnedPoints),
    earnedEgpPiasters: BigInt(row.earnedEgpPiasters),
    reversedPoints: BigInt(row.reversedPoints),
    reversedEgpPiasters: BigInt(row.reversedEgpPiasters),
  }));
}

export interface RewardEntitlementDetailRow {
  readonly id: number;
  readonly orderId: number;
  /** Staff only. Never part of a Partner read path (ADR-0010). */
  readonly orderReference: string;
  readonly listItemId: number | null;
  readonly variantId: number | null;
  readonly productNameSnapshot: string | null;
  readonly points: bigint;
  readonly egpValuePiasters: bigint;
  readonly events: readonly {
    readonly id: number;
    readonly type: RewardEventType;
    readonly points: bigint;
    readonly egpValuePiasters: bigint;
    readonly recordedAt: Date;
  }[];
}

/**
 * Entitlements with at least one event recorded in `month` (in `timeZone`), each with every one of
 * its events, oldest first. Includes Order References, so this is a Staff-only read.
 */
export async function listRewardEntitlementDetails(
  executor: RewardsExecutor,
  businessPartnerId: number,
  month: string,
  timeZone: string,
): Promise<RewardEntitlementDetailRow[]> {
  const active = executor
    .select({ id: rewardEvents.entitlementId })
    .from(rewardEvents)
    .where(
      and(
        eq(rewardEvents.businessPartnerId, businessPartnerId),
        isNotNull(rewardEvents.entitlementId),
        sql`${monthOf(rewardEvents.createdAt, timeZone)} = ${month}`,
      ),
    );
  const entitlements = await executor
    .select({
      id: rewardEntitlements.id,
      orderId: orders.id,
      orderReference: orders.orderReference,
      listItemId: orderItems.schoolSupplyListItemId,
      variantId: orderItems.variantId,
      productNameSnapshot: orderItems.productNameSnapshot,
      points: rewardEntitlements.points,
      egpValuePiasters: rewardEntitlements.egpValuePiasters,
    })
    .from(rewardEntitlements)
    .innerJoin(orderItems, eq(orderItems.id, rewardEntitlements.orderItemId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(rewardEntitlements.businessPartnerId, businessPartnerId),
        inArray(rewardEntitlements.id, active),
      ),
    )
    .orderBy(asc(rewardEntitlements.id));
  if (entitlements.length === 0) return [];

  const events = await executor
    .select({
      id: rewardEvents.id,
      entitlementId: rewardEvents.entitlementId,
      type: rewardEvents.eventType,
      points: rewardEvents.points,
      egpValuePiasters: rewardEvents.egpValuePiasters,
      recordedAt: rewardEvents.createdAt,
    })
    .from(rewardEvents)
    .where(
      inArray(
        rewardEvents.entitlementId,
        entitlements.map((entitlement) => entitlement.id),
      ),
    )
    .orderBy(asc(rewardEvents.id));
  return entitlements.map((entitlement) => ({
    ...entitlement,
    events: events
      .filter((event) => event.entitlementId === entitlement.id)
      .map(({ entitlementId: _entitlementId, ...event }) => event),
  }));
}

/** Adjustment events recorded in `month`, with the Staff reason and actor. Staff only. */
export function listRewardAdjustmentsInMonth(
  executor: RewardsExecutor,
  businessPartnerId: number,
  month: string,
  timeZone: string,
) {
  return executor
    .select({
      id: rewardEvents.id,
      egpValuePiasters: rewardEvents.egpValuePiasters,
      reason: rewardEvents.reason,
      actorUserId: rewardEvents.actorUserId,
      recordedAt: rewardEvents.createdAt,
    })
    .from(rewardEvents)
    .where(
      and(
        eq(rewardEvents.businessPartnerId, businessPartnerId),
        eq(rewardEvents.eventType, 'adjustment'),
        sql`${monthOf(rewardEvents.createdAt, timeZone)} = ${month}`,
      ),
    )
    .orderBy(desc(rewardEvents.id));
}

/** Email addresses of Staff actors, for showing who recorded a line. */
export async function getActorEmails(
  executor: RewardsExecutor,
  userIds: readonly number[],
): Promise<Map<number, string>> {
  if (userIds.length === 0) return new Map();
  const rows = await executor
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(inArray(users.id, [...userIds]));
  return new Map(rows.map((row) => [row.id, row.email]));
}
