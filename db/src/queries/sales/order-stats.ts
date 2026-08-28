import { sql, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../connection";
import { orders } from "../../schema/sales";

/**
 * Sales order statistics queries
 */

export const OrderStatsSchema = z.object({
  totalOrders: z.number(),
  totalRevenue: z.number(),
});

export type OrderStats = z.infer<typeof OrderStatsSchema>;

/**
 * Get total order count and revenue across all time
 */
export async function getTotalOrderStatsRaw(): Promise<OrderStats> {
  const [result] = await db.select({
    totalOrders: sql<number>`cast(count(*) as integer)`,
    totalRevenue: sql<number>`cast(coalesce(sum(${orders.totalAmount}), 0) as float)`,
  }).from(orders);

  return OrderStatsSchema.parse({
    totalOrders: result?.totalOrders || 0,
    totalRevenue: result?.totalRevenue || 0,
  });
}

/**
 * Get order count and revenue for a specific date range
 */
export async function getOrderStatsRaw(startDate: Date, endDate: Date): Promise<OrderStats> {
  const [result] = await db.select({
    totalOrders: sql<number>`cast(count(*) as integer)`,
    totalRevenue: sql<number>`cast(coalesce(sum(${orders.totalAmount}), 0) as float)`,
  }).from(orders)
    .where(and(gte(orders.createdAt, startDate), lte(orders.createdAt, endDate)));

  return OrderStatsSchema.parse({
    totalOrders: result?.totalOrders || 0,
    totalRevenue: result?.totalRevenue || 0,
  });
}
