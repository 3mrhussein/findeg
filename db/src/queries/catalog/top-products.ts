import { sql, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../connection";
import { products, productVariants } from "../../schema/catalog";
import { orderItems } from "../../schema/sales";

/**
 * Top selling products query
 */

export const TopProductRawSchema = z.object({
  id: z.number(),
  name: z.string().nullable().transform(val => val ?? "Unknown Product"),
  sold: z.number(),
  revenue: z.number(),
});

export type TopProductRaw = z.infer<typeof TopProductRawSchema>;

/**
 * Raw query for top selling products.
 * Aggregates by product and sums quantity and revenue.
 */
export async function getTopProductsRaw(limit: number = 5): Promise<TopProductRaw[]> {
  const results = await db
    .select({
      id: products.id,
      name: sql<string>`${products.localizedName}->>'en'`,
      sold: sql<number>`cast(sum(${orderItems.quantity}) as integer)`,
      revenue: sql<number>`cast(sum(${orderItems.totalPrice}) as float)`,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(products.id, products.localizedName)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit);

  return z.array(TopProductRawSchema).parse(results);
}
