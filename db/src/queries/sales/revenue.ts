import { sql, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../connection";
import { orders } from "../../schema/sales";

/**
 * Revenue by period query
 */

export const RevenuePeriodRawSchema = z.array(
  z.object({
    period: z.string(),
    revenue: z.number(),
  }),
);

export type RevenuePeriodRaw = z.infer<typeof RevenuePeriodRawSchema>;

/**
 * Raw query for revenue by period (day/week/month).
 */
export async function getRevenueByPeriodRaw(
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month' = 'day',
): Promise<RevenuePeriodRaw> {
  if (!['day', 'week', 'month'].includes(interval)) {
    throw new Error(`Invalid interval for revenue query: ${interval}`);
  }

  const intervalLiteral = sql.raw(`'${interval}'`);

  const results = await db.select({
    period: sql<string>`to_char(date_trunc(${intervalLiteral}, ${orders.createdAt}), 'YYYY-MM-DD')`,
    revenue: sql<number>`cast(sum(${orders.totalAmount}) as float)`,
  })
    .from(orders)
    .where(and(gte(orders.createdAt, startDate), lte(orders.createdAt, endDate)))
    .groupBy(sql`date_trunc(${intervalLiteral}, ${orders.createdAt})`)
    .orderBy(sql`date_trunc(${intervalLiteral}, ${orders.createdAt})`);

  return RevenuePeriodRawSchema.parse(results);
}
