import { sql, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../connection";
import { products, categories } from "../../schema/catalog";

/**
 * Category product distribution query
 */

export const CategoryDistributionRawSchema = z.array(
  z.object({
    categoryId: z.coerce.string(),
    localizedName: z.record(z.string(), z.string()).nullable(),
    slug: z.string(),
    productCount: z.number(),
  }),
);

export type CategoryDistributionRaw = z.infer<typeof CategoryDistributionRawSchema>;

/**
 * Raw query for category product distribution.
 * Joins categories and products with grouping and ordering.
 */
export async function getCategoryDistributionRaw(limit: number = 6): Promise<CategoryDistributionRaw> {
  const results = await db
    .select({
      categoryId: categories.id,
      localizedName: categories.localizedName,
      slug: categories.slug,
      productCount: sql<number>`cast(count(${products.id}) as integer)`,
    })
    .from(categories)
    .leftJoin(products, eq(categories.id, products.categoryId))
    .groupBy(categories.id, categories.localizedName, categories.slug)
    .orderBy(desc(sql`count(${products.id})`))
    .limit(limit);

  return CategoryDistributionRawSchema.parse(results);
}
