import { and, asc, desc, eq, gte, lt, sql, type SQL } from 'drizzle-orm';
import type { Db } from '@findeg/db/connection';
import { orders, orderItems, products } from '@findeg/db/schema';
import { toPiasters } from '../core/money';
import { ORDER_STATUS_OPTIONS } from './application/utils/order-status-transitions';

export const ORDER_STATISTICS_TIME_ZONE = 'Africa/Cairo';
type OrderStatus = (typeof orders.$inferSelect)['status'];

export interface OrderStatsOptions {
  /** Inclusive Cairo calendar dates, YYYY-MM-DD. Omitted bounds are unbounded. */
  from?: string;
  to?: string;
  /** Calendar days ending today, including today. Defaults to 30; maximum 366. */
  trendDays?: number;
  /** Defaults to 5; maximum 100. */
  topProductsLimit?: number;
}

export interface OrderStats {
  currency: 'EGP';
  timeZone: typeof ORDER_STATISTICS_TIME_ZONE;
  totalOrders: number;
  /** Accepted Order value across every status, including cancelled/refunded; not realized revenue. */
  totalRevenue: bigint;
  ordersByStatus: Record<OrderStatus, number>;
  /** Today, intersected with optional range bounds. */
  todayOrders: number;
  todayRevenue: bigint;
  revenueByPeriod: Array<{ date: string; revenue: bigint }>;
  topProducts: Array<{ id: number; name: string; sold: number; revenue: bigint }>;
}

export type OrderDatabase = Omit<Db, '$client'>;

export interface OrderStatisticsDependencies {
  db?: OrderDatabase;
  now?: () => Date;
}

function dateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function cairoDay(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ORDER_STATISTICS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (name: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === name)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// Storage timestamps are UTC wall-clock timestamps (as in Partner Sales).
// PostgreSQL resolves Cairo's skipped midnight and repeated hour using its IANA rules.
const localDay = sql<string>`to_char((${orders.createdAt} at time zone 'UTC') at time zone 'Africa/Cairo', 'YYYY-MM-DD')`;
const revenue = sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text`;
/** Inclusive Cairo date keys become indexable half-open UTC timestamp bounds. */
export function cairoOrderDateRange(from?: string, to?: string): SQL | undefined {
  if (
    (from !== undefined && !dateKey(from)) ||
    (to !== undefined && !dateKey(to)) ||
    (from !== undefined && to !== undefined && from > to)
  ) {
    throw new RangeError('Invalid Order calendar date range');
  }
  const midnight = (day: string) =>
    sql`(${day}::date::timestamp at time zone 'Africa/Cairo') at time zone 'UTC'`;
  return and(
    from ? gte(orders.createdAt, midnight(from)) : undefined,
    to ? lt(orders.createdAt, midnight(shiftDay(to, 1))) : undefined,
  );
}

/** Connection-free until first use. All monetary outputs are exact integer piasters. */
export function createOrderStatistics(dependencies: OrderStatisticsDependencies = {}) {
  const getDb = async () => dependencies.db ?? (await import('@findeg/db/connection')).db;
  return {
    async getStats(options: OrderStatsOptions = {}): Promise<OrderStats> {
      const { from, to, trendDays = 30, topProductsLimit = 5 } = options;
      if (
        (from !== undefined && !dateKey(from)) ||
        (to !== undefined && !dateKey(to)) ||
        (from !== undefined && to !== undefined && from > to) ||
        !Number.isInteger(trendDays) ||
        trendDays < 1 ||
        trendDays > 366 ||
        !Number.isInteger(topProductsLimit) ||
        topProductsLimit < 1 ||
        topProductsLimit > 100
      ) {
        throw new RangeError('Invalid Order statistics options');
      }
      const today = cairoDay((dependencies.now ?? (() => new Date()))());
      const trendStart = shiftDay(today, 1 - trendDays);
      const trendFrom = from && from > trendStart ? from : trendStart;
      const trendTo = to && to < today ? to : today;
      const db = await getDb();
      return db.transaction(
        async (snapshot) => {
          const [totals, todayTotals, statuses, trend, top] = await Promise.all([
            snapshot
              .select({ count: sql<number>`count(*)::int`, revenue })
              .from(orders)
              .where(cairoOrderDateRange(from, to)),
            snapshot
              .select({ count: sql<number>`count(*)::int`, revenue })
              .from(orders)
              .where(and(cairoOrderDateRange(today, today), cairoOrderDateRange(from, to))),
            snapshot
              .select({ status: orders.status, count: sql<number>`count(*)::int` })
              .from(orders)
              .where(cairoOrderDateRange(from, to))
              .groupBy(orders.status),
            snapshot
              .select({ date: localDay, revenue })
              .from(orders)
              .where(trendFrom <= trendTo ? cairoOrderDateRange(trendFrom, trendTo) : sql`false`)
              .groupBy(localDay)
              .orderBy(asc(localDay)),
            // Preserve existing catalog-name/inner-join behavior; deleted products are excluded.
            snapshot
              .select({
                id: products.id,
                name: sql<string | null>`${products.localizedName}->>'en'`,
                sold: sql<number>`sum(${orderItems.quantity})::int`,
                revenue: sql<string>`coalesce(sum(${orderItems.lineTotal}), 0)::text`,
              })
              .from(orderItems)
              .innerJoin(orders, eq(orderItems.orderId, orders.id))
              .innerJoin(products, eq(orderItems.productId, products.id))
              .where(cairoOrderDateRange(from, to))
              .groupBy(products.id, products.localizedName)
              .orderBy(desc(sql`sum(${orderItems.quantity})`), asc(products.id))
              .limit(topProductsLimit),
          ]);
          const ordersByStatus = Object.fromEntries(
            ORDER_STATUS_OPTIONS.map((status) => [status, 0]),
          ) as Record<OrderStatus, number>;
          for (const row of statuses) ordersByStatus[row.status] = row.count;
          const trendByDay = new Map(trend.map((row) => [row.date, toPiasters(row.revenue)]));
          const revenueByPeriod: OrderStats['revenueByPeriod'] = [];
          for (let day = trendFrom; day <= trendTo; day = shiftDay(day, 1)) {
            revenueByPeriod.push({ date: day, revenue: trendByDay.get(day) ?? 0n });
          }
          return {
            currency: 'EGP',
            timeZone: ORDER_STATISTICS_TIME_ZONE,
            totalOrders: totals[0].count,
            totalRevenue: toPiasters(totals[0].revenue),
            ordersByStatus,
            todayOrders: todayTotals[0].count,
            todayRevenue: toPiasters(todayTotals[0].revenue),
            revenueByPeriod,
            topProducts: top.map((row) => ({
              ...row,
              name: row.name ?? 'Unknown Product',
              revenue: toPiasters(row.revenue),
            })),
          };
        },
        { isolationLevel: 'repeatable read', accessMode: 'read only' },
      );
    },
  };
}
