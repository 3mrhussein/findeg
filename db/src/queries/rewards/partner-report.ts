import { and, asc, desc, eq, inArray, notExists, sql, type AnyColumn } from 'drizzle-orm';
import {
  partnerRewardEntitlements,
  partnerRewardEvents,
  partnerRewardSalesEvents,
  partnerRewardSettlements,
  productVariants,
  products,
  schoolSupplyListItems,
  schoolSupplyLists,
} from '../../schema';
import type { RewardMovementCategory, RewardMovementRow, RewardSalesRow } from './report';
import type { RewardsExecutor } from './index';

/**
 * The Partner read path (ADR-0010). Every function selects only from the Partner-safe views in
 * the `rewards` schema, which carry no Order Reference or Customer column, and requires the
 * `businessPartnerId` it filters on. Results have the same shapes as the Staff reads in
 * `report.ts`, so one statement-and-sales computation serves both projections.
 */

const monthOf = (column: AnyColumn, timeZone: string) =>
  sql<string>`to_char(${column} at time zone ${timeZone}::text, 'YYYY-MM')`;

export async function getPartnerRewardMovementsByMonth(
  executor: RewardsExecutor,
  businessPartnerId: number,
  timeZone: string,
): Promise<RewardMovementRow[]> {
  const events = await executor
    .select({
      month: monthOf(partnerRewardEvents.createdAt, timeZone),
      category: sql<RewardMovementCategory>`case ${partnerRewardEvents.eventType}
        when 'paid' then 'earned' when 'reversal' then 'reversed' else 'adjustment' end`,
      points: sql<string>`sum(${partnerRewardEvents.points})`,
      egpPiasters: sql<string>`sum(${partnerRewardEvents.egpValuePiasters})`,
    })
    .from(partnerRewardEvents)
    .where(
      and(
        eq(partnerRewardEvents.businessPartnerId, businessPartnerId),
        inArray(partnerRewardEvents.eventType, ['paid', 'reversal', 'adjustment']),
      ),
    )
    .groupBy(sql`1`, sql`2`);

  const settlements = await executor
    .select({
      month: monthOf(partnerRewardSettlements.createdAt, timeZone),
      category: sql<RewardMovementCategory>`case ${partnerRewardSettlements.kind}
        when 'debt-forgiveness' then 'adjustment' else 'settled' end`,
      egpPiasters: sql<string>`sum(${partnerRewardSettlements.amountPiasters})`,
    })
    .from(partnerRewardSettlements)
    .where(eq(partnerRewardSettlements.businessPartnerId, businessPartnerId))
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

export async function getPartnerFirstRewardEventMonth(
  executor: RewardsExecutor,
  businessPartnerId: number,
  timeZone: string,
): Promise<string | null> {
  const [row] = await executor
    .select({
      month: sql<
        string | null
      >`to_char(min(${partnerRewardEvents.createdAt}) at time zone ${timeZone}::text, 'YYYY-MM')`,
    })
    .from(partnerRewardEvents)
    .where(eq(partnerRewardEvents.businessPartnerId, businessPartnerId));
  return row?.month ?? null;
}

/** Entitlements with no `paid`, `cancellation` or `reversal` event yet. */
export async function getPartnerPendingRewardTotals(
  executor: RewardsExecutor,
  businessPartnerId: number,
) {
  const [row] = await executor
    .select({
      points: sql<string>`coalesce(sum(${partnerRewardEntitlements.points}), 0)`,
      egpValuePiasters: sql<string>`coalesce(sum(${partnerRewardEntitlements.egpValuePiasters}), 0)`,
    })
    .from(partnerRewardEntitlements)
    .where(
      and(
        eq(partnerRewardEntitlements.businessPartnerId, businessPartnerId),
        notExists(
          executor
            .select({ one: sql`1` })
            .from(partnerRewardEvents)
            .where(
              and(
                eq(partnerRewardEvents.entitlementId, partnerRewardEntitlements.id),
                inArray(partnerRewardEvents.eventType, ['paid', 'cancellation', 'reversal']),
              ),
            ),
        ),
      ),
    );
  return { points: BigInt(row.points), egpValuePiasters: BigInt(row.egpValuePiasters) };
}

export async function getPartnerAvailableRewardBalance(
  executor: RewardsExecutor,
  businessPartnerId: number,
): Promise<bigint> {
  const [events] = await executor
    .select({
      balance: sql<string>`coalesce(sum(case ${partnerRewardEvents.eventType}
        when 'paid' then ${partnerRewardEvents.egpValuePiasters}
        when 'reversal' then -${partnerRewardEvents.egpValuePiasters}
        when 'adjustment' then ${partnerRewardEvents.egpValuePiasters}
        else 0 end), 0)`,
    })
    .from(partnerRewardEvents)
    .where(eq(partnerRewardEvents.businessPartnerId, businessPartnerId));
  const [settlements] = await executor
    .select({
      balance: sql<string>`coalesce(sum(case ${partnerRewardSettlements.kind}
        when 'debt-forgiveness' then ${partnerRewardSettlements.amountPiasters}
        else -${partnerRewardSettlements.amountPiasters} end), 0)`,
    })
    .from(partnerRewardSettlements)
    .where(eq(partnerRewardSettlements.businessPartnerId, businessPartnerId));
  return BigInt(events.balance) + BigInt(settlements.balance);
}

export async function getPartnerRewardSalesRows(
  executor: RewardsExecutor,
  businessPartnerId: number,
  month: string,
  timeZone: string,
): Promise<RewardSalesRow[]> {
  const sales = partnerRewardSalesEvents;
  const sumWhen = (type: 'paid' | 'reversal', column: AnyColumn) =>
    sql<string>`coalesce(sum(case when ${sales.eventType} = ${type} then ${column} else 0 end), 0)`;

  const rows = await executor
    .select({
      listId: sales.listId,
      listItemId: sales.listItemId,
      variantId: sales.variantId,
      productId: sales.productId,
      earnedPoints: sumWhen('paid', sales.points),
      earnedEgpPiasters: sumWhen('paid', sales.egpValuePiasters),
      reversedPoints: sumWhen('reversal', sales.points),
      reversedEgpPiasters: sumWhen('reversal', sales.egpValuePiasters),
      orderCount: sql<number>`count(distinct ${sales.orderId})::int`,
      listTitle: schoolSupplyLists.localizedTitle,
      listItemLabel: schoolSupplyListItems.localizedLabel,
      productName: products.localizedName,
      variantLabel: productVariants.localizedLabel,
      productNameSnapshot: sql<string | null>`max(${sales.productNameSnapshot})`,
      variantLabelSnapshot: sql<string | null>`max(${sales.variantLabelSnapshot})`,
    })
    .from(sales)
    .leftJoin(schoolSupplyLists, eq(schoolSupplyLists.id, sales.listId))
    .leftJoin(schoolSupplyListItems, eq(schoolSupplyListItems.id, sales.listItemId))
    .leftJoin(products, eq(products.id, sales.productId))
    .leftJoin(productVariants, eq(productVariants.id, sales.variantId))
    .where(
      and(
        eq(sales.businessPartnerId, businessPartnerId),
        sql`${monthOf(sales.createdAt, timeZone)} = ${month}`,
      ),
    )
    .groupBy(
      sales.listId,
      sales.listItemId,
      sales.variantId,
      sales.productId,
      schoolSupplyLists.localizedTitle,
      schoolSupplyListItems.localizedLabel,
      products.localizedName,
      productVariants.localizedLabel,
    )
    .orderBy(asc(sales.listId), asc(sales.listItemId), asc(sales.variantId));

  return rows.map((row) => ({
    month,
    ...row,
    earnedPoints: BigInt(row.earnedPoints),
    earnedEgpPiasters: BigInt(row.earnedEgpPiasters),
    reversedPoints: BigInt(row.reversedPoints),
    reversedEgpPiasters: BigInt(row.reversedEgpPiasters),
  }));
}

export interface PartnerSettlementLineRow {
  readonly id: number;
  readonly kind: 'settlement' | 'void';
  /** Positive for a settlement, negative for a void. */
  readonly amountPiasters: bigint;
  readonly transferReference: string | null;
  /** `YYYY-MM-DD`: shown on the history row only. */
  readonly paidAt: string | null;
  readonly voidsSettlementId: number | null;
  readonly recordedAt: Date;
}

/**
 * Newest-first settlement and void lines. Debt forgiveness is an adjustment and never itemised.
 * Staff notes, actors and void reasons are not in the view.
 */
export async function listPartnerSettlementLines(
  executor: RewardsExecutor,
  businessPartnerId: number,
): Promise<PartnerSettlementLineRow[]> {
  const rows = await executor
    .select({
      id: partnerRewardSettlements.id,
      kind: partnerRewardSettlements.kind,
      amountPiasters: partnerRewardSettlements.amountPiasters,
      transferReference: partnerRewardSettlements.transferReference,
      paidAt: partnerRewardSettlements.paidAt,
      voidsSettlementId: partnerRewardSettlements.voidsSettlementId,
      recordedAt: partnerRewardSettlements.createdAt,
    })
    .from(partnerRewardSettlements)
    .where(
      and(
        eq(partnerRewardSettlements.businessPartnerId, businessPartnerId),
        inArray(partnerRewardSettlements.kind, ['settlement', 'void']),
      ),
    )
    .orderBy(desc(partnerRewardSettlements.id));
  return rows.map((row) => ({ ...row, kind: row.kind as 'settlement' | 'void' }));
}
