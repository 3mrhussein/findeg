import { sql, count, desc, eq, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "../connection";
import { products, categories, productVariants, variantImages, brands } from "../schema/catalog";
import { orders, orderItems } from "../schema/sales";
import { inventoryBalances } from "../schema/inventory";

/**
 * Zod Schemas for Raw Query Validation
 */
export const CatalogHealthRawSchema = z.object({
  totalProducts: z.number(),
  missingCategory: z.number(),
  missingImages: z.number(),
  missingPrice: z.number(),
  draftProducts: z.number(),
  fullyComplete: z.number(),
});

export const CategoryDistributionRawSchema = z.array(
  z.object({
    categoryId: z.coerce.string(),
    localizedName: z.record(z.string(), z.string()).nullable(),
    slug: z.string(),
    productCount: z.number(),
  }),
);


export const DashboardKpisRawSchema = z.object({
  totalProducts: z.number(),
  totalCategories: z.number(),
  totalOrders: z.number(),
  totalBrands: z.number(),
  totalRevenue: z.number(),
  todayRevenue: z.number(),
  todayOrders: z.number(),
});

export const RevenuePeriodRawSchema = z.array(
  z.object({
    period: z.string(),
    revenue: z.number(),
  }),
);

export const TopProductRawSchema = z.object({
  id: z.number(),
  name: z.string().nullable().transform(val => val ?? "Unknown Product"),
  sold: z.number(),
  revenue: z.number(),
});


/**
 * Raw query for catalog health statistics.
 * Encapsulates complex aggregations and existence checks.
 */
export async function getCatalogHealthRaw() {
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

  return CatalogHealthRawSchema.parse({
    totalProducts: counts?.total || 0,
    missingCategory: counts?.missingCategory || 0,
    missingImages: missingImages?.count || 0,
    missingPrice: missingPrice?.count || 0,
    draftProducts: counts?.draftProducts || 0,
    fullyComplete: fullyComplete?.count || 0,
  });
}

/**
 * Raw query for category product distribution.
 * Joins categories and products with grouping and ordering.
 */
export async function getCategoryDistributionRaw(limit: number = 6) {
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

/**
 * Raw query for main dashboard KPIs.
 */
export async function getDashboardKpisRaw(todayStart: Date, todayEnd: Date) {
  const [productCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(products);
  const [categoryCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(categories);
  const [brandCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(brands);

  const [orderStats] = await db.select({
    totalOrders: sql<number>`cast(count(*) as integer)`,
    totalRevenue: sql<number>`cast(coalesce(sum(${orders.totalAmount}), 0) as float)`,
  }).from(orders);

  const [todayStats] = await db.select({
    todayOrders: sql<number>`cast(count(*) as integer)`,
    todayRevenue: sql<number>`cast(coalesce(sum(${orders.totalAmount}), 0) as float)`,
  }).from(orders)
    .where(and(gte(orders.createdAt, todayStart), lte(orders.createdAt, todayEnd)));

  return DashboardKpisRawSchema.parse({
    totalProducts: productCount?.count || 0,
    totalCategories: categoryCount?.count || 0,
    totalOrders: orderStats?.totalOrders || 0,
    totalBrands: brandCount?.count || 0,
    totalRevenue: orderStats?.totalRevenue || 0,
    todayRevenue: todayStats?.todayRevenue || 0,
    todayOrders: todayStats?.todayOrders || 0,
  });
}

/**
 * Raw query for revenue by period (day/week/month).
 */
export async function getRevenueByPeriodRaw(startDate: Date, endDate: Date, interval: 'day' | 'week' | 'month' = 'day') {
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

/**
 * Raw query for low stock count across all warehouses.
 * Counts variants where (onHand - reserved) <= lowStockThreshold.
 */
export async function getLowStockCountRaw() {
  const [result] = await db
    .select({
      count: sql<number>`cast(count(distinct ${inventoryBalances.variantId}) as integer)`,
    })
    .from(inventoryBalances)
    .innerJoin(productVariants, eq(inventoryBalances.variantId, productVariants.id))
    .where(sql`${inventoryBalances.onHand} - ${inventoryBalances.reserved} <= ${productVariants.lowStockThreshold}`);

  return result?.count || 0;
}

/**
 * Raw query for top selling products.
 * Aggregates by product and sums quantity and revenue.
 */
export async function getTopProductsRaw(limit: number = 5) {
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
