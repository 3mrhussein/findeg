import { db } from '../../connection';
import { brands, categories, products } from '../../schema';
import { and, asc, Column, count, desc, eq, inArray, or, sql, SQL } from 'drizzle-orm';
import type { AdminProductListQueryFilters, AdminProductListQueryResult } from './types';

export async function getAdminProductsListRaw(
  filters: AdminProductListQueryFilters,
): Promise<AdminProductListQueryResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const pricingAndVariants = sql`
    (SELECT 
      "product_id",
      MAX(CASE WHEN "is_default" = true THEN CAST("base_price" AS DECIMAL) ELSE NULL END) as default_price,
      MIN(CAST("base_price" AS DECIMAL)) as min_price,
      COUNT("id") as v_count,
      MAX(CASE WHEN "is_active" = true THEN 1 ELSE 0 END) as has_active_v
     FROM "catalog"."product_variants"
     GROUP BY "product_id"
    )
  `;

  const inventorySub = sql`
    (SELECT 
      pv."product_id",
      SUM(COALESCE(ib."on_hand", 0) - COALESCE(ib."reserved", 0)) as total_stock
     FROM "catalog"."product_variants" pv
     LEFT JOIN "inventory"."inventory_balances" ib ON pv."id" = ib."variant_id"
     GROUP BY pv."product_id"
    )
  `;

  const imagesSub = sql`
    (SELECT 
      pv."product_id",
      COUNT(vi."id") as img_count,
      (SELECT "url" FROM "catalog"."variant_images" vvi 
       JOIN "catalog"."product_variants" ppv ON vvi."variant_id" = ppv."id"
       WHERE ppv."product_id" = pv."product_id"
       ORDER BY ppv."is_default" DESC, vvi."display_order" ASC, vvi."id" ASC LIMIT 1) as thumb_url
     FROM "catalog"."product_variants" pv
     LEFT JOIN "catalog"."variant_images" vi ON pv."id" = vi."variant_id"
     GROUP BY pv."product_id"
    )
  `;

  const whereClauses: SQL[] = [];

  if (filters.search) {
    const search = `%${filters.search}%`;
    whereClauses.push(
      or(
        sql`${products.localizedName}->>'en' ILIKE ${search}`,
        sql`${products.localizedName}->>'ar' ILIKE ${search}`,
        sql`EXISTS (SELECT 1 FROM "catalog"."product_variants" pv WHERE pv."product_id" = ${products.id} AND pv."sku" ILIKE ${search})`,
      ) as SQL,
    );
  }

  if (filters.categoryIds?.length) {
    whereClauses.push(inArray(products.categoryId, filters.categoryIds));
  }

  if (filters.brandIds?.length) {
    whereClauses.push(inArray(products.brandId, filters.brandIds));
  }

  if (filters.status) {
    whereClauses.push(eq(products.isActive, filters.status === 'active'));
  }

  if (filters.completeness) {
    switch (filters.completeness) {
      case 'no-category':
        whereClauses.push(sql`${products.categoryId} IS NULL`);
        break;
      case 'draft':
        whereClauses.push(eq(products.isActive, false));
        break;
      case 'no-images':
        whereClauses.push(
          sql`NOT EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
              JOIN "catalog"."variant_images" vi ON pv."id" = vi."variant_id" 
              WHERE pv."product_id" = ${products.id})`,
        );
        break;
      case 'no-price':
        whereClauses.push(
          sql`NOT EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
              WHERE pv."product_id" = ${products.id} AND CAST(pv."base_price" AS DECIMAL) > 0)`,
        );
        break;
      case 'complete':
        whereClauses.push(
          and(
            sql`${products.categoryId} IS NOT NULL`,
            eq(products.isActive, true),
            sql`EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
                JOIN "catalog"."variant_images" vi ON pv."id" = vi."variant_id" 
                WHERE pv."product_id" = ${products.id})`,
            sql`EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
                WHERE pv."product_id" = ${products.id} AND CAST(pv."base_price" AS DECIMAL) > 0)`,
          ) as SQL,
        );
        break;
    }
  }

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  let orderBy: SQL | Column = desc(products.updatedAt);
  if (filters.sortBy) {
    const dir = filters.sortDir === 'asc' ? asc : desc;
    switch (filters.sortBy) {
      case 'name':
        orderBy = dir(sql`${products.localizedName}->>'en'`);
        break;
      case 'price':
        orderBy = dir(sql`pv_stats.min_price`);
        break;
      case 'stock':
        orderBy = dir(sql`inv_stats.total_stock`);
        break;
      case 'updatedAt':
        orderBy = dir(products.updatedAt);
        break;
    }
  }

  const mainRows = await db
    .select({
      id: products.id,
      localizedName: products.localizedName,
      categoryId: products.categoryId,
      categoryName: sql<string>`${categories.localizedName}->>'en'`,
      brandId: products.brandId,
      brandName: sql<string | null>`${brands.localizedName}->>'en'`,
      isActive: products.isActive,
      updatedAt: products.updatedAt,
      defaultVariantPrice: sql<number | null>`COALESCE(pv_stats.default_price, pv_stats.min_price)`,
      variantCount: sql<number>`COALESCE(pv_stats.v_count, 0)`,
      totalStock: sql<number>`COALESCE(inv_stats.total_stock, 0)`,
      hasImages: sql<boolean>`COALESCE(img_stats.img_count, 0) > 0`,
      thumbnailUrl: sql<string | null>`img_stats.thumb_url`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(sql`(${pricingAndVariants}) pv_stats`, eq(products.id, sql`pv_stats.product_id`))
    .leftJoin(sql`(${inventorySub}) inv_stats`, eq(products.id, sql`inv_stats.product_id`))
    .leftJoin(sql`(${imagesSub}) img_stats`, eq(products.id, sql`img_stats.product_id`))
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  const [{ total }] = await db.select({ total: count(products.id) }).from(products).where(where);

  return {
    rows: mainRows.map((row) => ({
      id: row.id,
      localizedName: row.localizedName as Record<string, string>,
      categoryId: row.categoryId,
      categoryName: row.categoryName ?? null,
      brandId: row.brandId,
      brandName: row.brandName ?? null,
      isActive: row.isActive,
      updatedAt: row.updatedAt,
      defaultVariantPrice:
        row.defaultVariantPrice != null ? Number(row.defaultVariantPrice) : null,
      variantCount: Number(row.variantCount),
      totalStock: Number(row.totalStock),
      hasImages: row.hasImages,
      thumbnailUrl: row.thumbnailUrl ?? null,
    })),
    total: Number(total),
    page,
    pageSize,
  };
}