import { and, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { orders, orderItems, products } from '@findeg/db/schema';
import {
  BUSINESS_TIME_ZONE,
  DEFAULT_CURRENCY,
  LIVE_ORDER_STATUSES,
  ORDER_STATUSES,
  moneyFromDecimal,
} from '@findeg/domain';
import { statsOptionsSchema } from '../validation';
import type { OrderContext, Orders } from '../../types';

/** Order totals, status counts, revenue trend and top products in the business time zone. */
/** One zeroed counter per value of a Domain value set, keyed exhaustively by that set. */
function zeroCounts<const Values extends readonly string[]>(
  values: Values,
): Record<Values[number], number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<Values[number], number>;
}

export function createOrderStatistics({ database, now }: OrderContext): Pick<Orders, 'getStats'> {
  return {
    async getStats(input = {}) {
      const options = statsOptionsSchema.parse(input);
      const instant = now().toISOString();
      const db = await database();
      // Stored timestamps are UTC without a timezone. PostgreSQL owns Cairo DST conversion.
      const from = options.from ? sql`${options.from}::date` : sql`null::date`;
      const to = options.to ? sql`${options.to}::date` : sql`null::date`;
      const range = and(
        options.from
          ? sql`${orders.createdAt} >= ((${from}::timestamp at time zone 'Africa/Cairo') at time zone 'UTC')`
          : undefined,
        options.to
          ? sql`${orders.createdAt} < (((${to} + 1)::timestamp at time zone 'Africa/Cairo') at time zone 'UTC')`
          : undefined,
      );
      const day = sql`(${orders.createdAt} at time zone 'UTC' at time zone 'Africa/Cairo')::date`;
      const today = sql`(${instant}::timestamptz at time zone 'Africa/Cairo')::date`;
      // liveOnly counts only live Orders (LIVE_ORDER_STATUSES) in revenue, the trend and top products.
      const liveStatuses = inArray(orders.status, LIVE_ORDER_STATUSES);
      const revenueFilter = options.liveOnly ? sql`filter (where ${liveStatuses})` : sql``;
      const todayRevenueFilter = options.liveOnly
        ? sql`filter (where ${day} = ${today} and ${liveStatuses})`
        : sql`filter (where ${day} = ${today})`;
      const trendLiveClause = options.liveOnly ? sql`and ${liveStatuses}` : sql``;
      return db.transaction(
        async (tx) => {
          const [totals] = await tx
            .select({
              totalOrders: count(),
              revenue: sql<string>`coalesce(sum(${orders.totalAmount}) ${revenueFilter}, 0)::text`,
              todayOrders: sql<number>`count(*) filter (where ${day} = ${today})::int`,
              todayRevenue: sql<string>`coalesce(sum(${orders.totalAmount}) ${todayRevenueFilter}, 0)::text`,
            })
            .from(orders)
            .where(range);
          const statuses = await tx
            .select({ status: orders.status, count: count() })
            .from(orders)
            .where(range)
            .groupBy(orders.status);
          const ordersByStatus = zeroCounts(ORDER_STATUSES);
          for (const row of statuses) ordersByStatus[row.status] = row.count;
          const trend = await tx.execute<{ date: string; revenue: string }>(sql`
          with dates as (
            select generate_series(greatest(${today} - (${options.trendDays}::int - 1), ${from})::timestamp, least(${today}, ${to})::timestamp, interval '1 day')::date as date
          )
          select dates.date::text as date, coalesce(sum(${orders.totalAmount}), 0)::text as revenue
          from dates left join ${orders} on ${orders.createdAt} >= ((dates.date::timestamp at time zone ${BUSINESS_TIME_ZONE}) at time zone 'UTC')
            and ${orders.createdAt} < (((dates.date + 1)::timestamp at time zone ${BUSINESS_TIME_ZONE}) at time zone 'UTC')
            ${trendLiveClause}
          group by dates.date order by dates.date
        `);
          const top = await tx
            .select({
              id: products.id,
              name: sql<string>`coalesce(${products.localizedName}->>'en', 'Unknown Product')`,
              sold: sql<number>`sum(${orderItems.quantity})::int`,
              revenue: sql<string>`sum(${orderItems.lineTotal})::text`,
            })
            .from(orderItems)
            .innerJoin(orders, eq(orderItems.orderId, orders.id))
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(options.liveOnly ? and(range, liveStatuses) : range)
            .groupBy(products.id, products.localizedName)
            .orderBy(desc(sql`sum(${orderItems.quantity})`), products.id)
            .limit(options.topProductsLimit);
          return {
            currency: DEFAULT_CURRENCY,
            timezone: BUSINESS_TIME_ZONE,
            totalOrders: totals.totalOrders,
            totalRevenue: moneyFromDecimal(totals.revenue),
            todayOrders: totals.todayOrders,
            todayRevenue: moneyFromDecimal(totals.todayRevenue),
            ordersByStatus,
            revenueByPeriod: Array.from(trend, (row) => ({
              date: row.date,
              revenue: moneyFromDecimal(row.revenue),
            })),
            topProducts: top.map((row) => ({ ...row, revenue: moneyFromDecimal(row.revenue) })),
          };
        },
        { isolationLevel: 'repeatable read', accessMode: 'read only' },
      );
    },
  };
}
