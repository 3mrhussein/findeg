import { and, asc, eq, gte, inArray, lt, sql, type SQL, type SQLWrapper } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../schema';

/**
 * Attributed Order reads (ADR-0013). An Attributed Order is an Order whose list attribution names
 * a Business Partner; Cart Orders have none and never match. Every function requires the
 * `businessPartnerId` it filters on, and none selects a Customer column.
 *
 * Callers pass the executor (a database or an open transaction) and the IANA time zone that
 * calendar dates and months are read in. `orders.created_at` is a UTC wall-clock `timestamp`.
 */

export type PartnerSalesDatabase = PostgresJsDatabase<typeof schema>;
export type PartnerSalesTransaction = Parameters<
  Parameters<PartnerSalesDatabase['transaction']>[0]
>[0];
export type PartnerSalesExecutor = PartnerSalesDatabase | PartnerSalesTransaction;

type OrderStatus = (typeof schema.orderStatusEnum.enumValues)[number];
type PaymentStatus = (typeof schema.paymentStatusEnum.enumValues)[number];

const { orders, orderItems, products, productVariants, schoolSupplyListItems, schoolSupplyLists } =
  schema;

export interface AttributedOrderFilter {
  readonly businessPartnerId: number;
  /** First calendar day, `YYYY-MM-DD` in `timeZone`, inclusive. */
  readonly from: string;
  /** Last calendar day, `YYYY-MM-DD` in `timeZone`, inclusive. */
  readonly to: string;
  readonly timeZone: string;
  /** Omitted: every status. */
  readonly orderStatuses?: readonly OrderStatus[];
  /** Omitted: every payment status. */
  readonly paymentStatuses?: readonly PaymentStatus[];
}

/** The UTC wall-clock instant at which local midnight of `day` begins in `timeZone`. */
const startOfLocalDay = (day: SQL, timeZone: string) =>
  sql`((${day})::timestamp at time zone ${timeZone}::text) at time zone 'UTC'`;

function attributedOrderWhere(filter: AttributedOrderFilter) {
  return and(
    eq(orders.businessPartnerId, filter.businessPartnerId),
    gte(orders.createdAt, startOfLocalDay(sql`${filter.from}::date`, filter.timeZone)),
    lt(orders.createdAt, startOfLocalDay(sql`${filter.to}::date + 1`, filter.timeZone)),
    filter.orderStatuses ? inArray(orders.status, [...filter.orderStatuses]) : undefined,
    filter.paymentStatuses ? inArray(orders.paymentStatus, [...filter.paymentStatuses]) : undefined,
  );
}

const piasters = (amount: SQLWrapper) => sql<string>`(round((${amount}) * 100))::bigint`;

/** Charged excludes shipping: it is the post-discount sum of the Order's lines. */
const charged = orders.subtotal;
const gross = sql`${orders.subtotal} + ${orders.discountTotal}`;

export interface AttributedOrderRow {
  readonly id: number;
  readonly orderReference: string;
  readonly status: OrderStatus;
  readonly paymentStatus: PaymentStatus;
  /** When the Order was accepted. */
  readonly acceptedAt: Date;
  readonly schoolSupplyListId: number;
  readonly schoolSupplyListPublicCode: string;
  readonly grossPiasters: bigint;
  readonly discountPiasters: bigint;
  readonly chargedPiasters: bigint;
}

/** Oldest first. */
export async function listAttributedOrders(
  executor: PartnerSalesExecutor,
  filter: AttributedOrderFilter,
): Promise<AttributedOrderRow[]> {
  const rows = await executor
    .select({
      id: orders.id,
      orderReference: orders.orderReference,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      acceptedAt: orders.createdAt,
      schoolSupplyListId: orders.schoolSupplyListId,
      schoolSupplyListPublicCode: orders.schoolSupplyListPublicCode,
      grossPiasters: piasters(gross),
      discountPiasters: piasters(orders.discountTotal),
      chargedPiasters: piasters(charged),
    })
    .from(orders)
    .where(attributedOrderWhere(filter))
    .orderBy(asc(orders.createdAt), asc(orders.id));
  return rows.map((row) => ({
    ...row,
    // The attribution check makes both non-null whenever business_partner_id is set.
    schoolSupplyListId: row.schoolSupplyListId!,
    schoolSupplyListPublicCode: row.schoolSupplyListPublicCode!,
    grossPiasters: BigInt(row.grossPiasters),
    discountPiasters: BigInt(row.discountPiasters),
    chargedPiasters: BigInt(row.chargedPiasters),
  }));
}

export interface AttributedOrderTotalsRow {
  readonly orderCount: number;
  readonly grossPiasters: bigint;
  readonly discountPiasters: bigint;
  readonly chargedPiasters: bigint;
}

export async function getAttributedOrderTotals(
  executor: PartnerSalesExecutor,
  filter: AttributedOrderFilter,
): Promise<AttributedOrderTotalsRow> {
  const [row] = await executor
    .select({
      orderCount: sql<number>`count(*)::int`,
      grossPiasters: sql<string>`coalesce(sum(${piasters(gross)}), 0)`,
      discountPiasters: sql<string>`coalesce(sum(${piasters(orders.discountTotal)}), 0)`,
      chargedPiasters: sql<string>`coalesce(sum(${piasters(charged)}), 0)`,
    })
    .from(orders)
    .where(attributedOrderWhere(filter));
  return {
    orderCount: row.orderCount,
    grossPiasters: BigInt(row.grossPiasters),
    discountPiasters: BigInt(row.discountPiasters),
    chargedPiasters: BigInt(row.chargedPiasters),
  };
}

/** `YYYY-MM` of the Business Partner's first Attributed Order in `timeZone`, or null. */
export async function getFirstAttributedOrderMonth(
  executor: PartnerSalesExecutor,
  businessPartnerId: number,
  timeZone: string,
): Promise<string | null> {
  const [row] = await executor
    .select({
      month: sql<string | null>`to_char(
        (min(${orders.createdAt}) at time zone 'UTC') at time zone ${timeZone}::text, 'YYYY-MM')`,
    })
    .from(orders)
    .where(eq(orders.businessPartnerId, businessPartnerId));
  return row?.month ?? null;
}

type TranslationMap = { en?: string; ar?: string };

/**
 * One list × list item × variant group of Attributed Order lines. Names are live, with the
 * `order_items` snapshots for when the catalog row is gone. `orderCount` counts distinct Orders,
 * never identifies one.
 */
export interface AttributedSalesRow {
  readonly listId: number | null;
  readonly listItemId: number | null;
  readonly variantId: number | null;
  readonly listTitle: TranslationMap | null;
  readonly listItemLabel: TranslationMap | null;
  readonly productName: TranslationMap | null;
  readonly variantLabel: TranslationMap | null;
  readonly productNameSnapshot: string | null;
  /** The variant's localized label, as checkout snapshots it into `variant_snapshot`. */
  readonly variantLabelSnapshot: TranslationMap | null;
  readonly quantity: number;
  readonly chargedPiasters: bigint;
  readonly orderCount: number;
}

/**
 * A deleted variant leaves its lines with no `variant_id`; their snapshot then tells one deleted
 * variant from another.
 */
const deletedVariantSnapshot = sql<TranslationMap | null>`case when ${orderItems.variantId} is null
  then ${orderItems.variantSnapshot} end`;

/** Lines of the matching Attributed Orders, grouped by list × list item × variant. */
export async function listAttributedSalesRows(
  executor: PartnerSalesExecutor,
  filter: AttributedOrderFilter,
): Promise<AttributedSalesRow[]> {
  const rows = await executor
    .select({
      listId: orders.schoolSupplyListId,
      listItemId: orderItems.schoolSupplyListItemId,
      variantId: orderItems.variantId,
      listTitle: schoolSupplyLists.localizedTitle,
      listItemLabel: schoolSupplyListItems.localizedLabel,
      productName: products.localizedName,
      variantLabel: productVariants.localizedLabel,
      productNameSnapshot: sql<string | null>`max(${orderItems.productNameSnapshot})`,
      variantLabelSnapshot: sql<TranslationMap | null>`max(${orderItems.variantSnapshot}::text)::jsonb`,
      quantity: sql<number>`sum(${orderItems.quantity})::int`,
      chargedPiasters: sql<string>`sum(${piasters(orderItems.lineTotal)})`,
      orderCount: sql<number>`count(distinct ${orders.id})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .leftJoin(schoolSupplyLists, eq(schoolSupplyLists.id, orders.schoolSupplyListId))
    .leftJoin(
      schoolSupplyListItems,
      eq(schoolSupplyListItems.id, orderItems.schoolSupplyListItemId),
    )
    .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(attributedOrderWhere(filter))
    .groupBy(
      orders.schoolSupplyListId,
      orderItems.schoolSupplyListItemId,
      orderItems.variantId,
      orderItems.productId,
      deletedVariantSnapshot,
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
  return rows.map((row) => ({ ...row, chargedPiasters: BigInt(row.chargedPiasters) }));
}
