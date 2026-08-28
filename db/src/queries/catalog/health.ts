import { sql, and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../connection";
import { products, categories, productVariants, variantImages, brands } from "../../schema/catalog";

/**
 * Catalog health statistics and data quality checks
 */

export const CatalogHealthRawSchema = z.object({
  totalProducts: z.number(),
  missingCategory: z.number(),
  missingImages: z.number(),
  missingPrice: z.number(),
  draftProducts: z.number(),
  fullyComplete: z.number(),
  totalCategories: z.number(),
  totalBrands: z.number(),
});

export type CatalogHealthRaw = z.infer<typeof CatalogHealthRawSchema>;

/**
 * Raw query for catalog health statistics.
 * Encapsulates complex aggregations and existence checks.
 */
export async function getCatalogHealthRaw(): Promise<CatalogHealthRaw> {
  const [counts] = await db
    .select({
      total: sql<number>`cast(count(*) as integer)`,
      missingCategory: sql<number>`cast(sum(case when ${products.categoryId} is null then 1 else 0 end) as integer)`,
      draftProducts: sql<number>`cast(sum(case when ${products.isActive} = false then 1 else 0 end) as integer)`,
    })
    .from(products);

  const [missingPrice] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(products)
    .where(
      sql`not exists (
        select 1 from ${productVariants} v 
        where v.product_id = ${products.id} and v.base_price > 0
      )`,
    );

  const [missingImages] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(products)
    .where(
      sql`not exists (
        select 1 from ${productVariants} v 
        join ${variantImages} vi on v.id = vi.variant_id 
        where v.product_id = ${products.id}
      )`,
    );

  const [fullyComplete] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(products)
    .where(
      and(
        sql`${products.categoryId} is not null`,
        eq(products.isActive, true),
        sql`exists (
          select 1 from ${productVariants} v 
          where v.product_id = ${products.id} and v.base_price > 0
        )`,
        sql`exists (
          select 1 from ${productVariants} v 
          join ${variantImages} vi on v.id = vi.variant_id 
          where v.product_id = ${products.id}
        )`,
      ),
    );

  const [[categoryCounts], [brandCounts]] = await Promise.all([
    db.select({ count: sql<number>`cast(count(*) as integer)` }).from(categories),
    db.select({ count: sql<number>`cast(count(*) as integer)` }).from(brands),
  ]);

  return CatalogHealthRawSchema.parse({
    totalProducts: counts?.total || 0,
    missingCategory: counts?.missingCategory || 0,
    missingImages: missingImages?.count || 0,
    missingPrice: missingPrice?.count || 0,
    draftProducts: counts?.draftProducts || 0,
    fullyComplete: fullyComplete?.count || 0,
    totalCategories: categoryCounts?.count || 0,
    totalBrands: brandCounts?.count || 0,
  });
}
