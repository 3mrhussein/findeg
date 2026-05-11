import { z } from "zod";
import { getProductCountRaw, getCategoryCountRaw, getBrandCountRaw } from "../catalog/counts";
import { getTotalOrderStatsRaw, getOrderStatsRaw } from "../sales/order-stats";
import { getLowStockCountRaw } from "../inventory/low-stock";

/**
 * Analytics: Dashboard KPIs
 * 
 * This module orchestrates primitives from multiple data domains
 * (catalog, sales, inventory) to compute dashboard analytics.
 * 
 * By composing primitives here rather than in the db layer,
 * each domain's queries remain independently reusable.
 */

export const DashboardKpisRawSchema = z.object({
  totalProducts: z.number(),
  totalCategories: z.number(),
  totalOrders: z.number(),
  totalBrands: z.number(),
  totalRevenue: z.number(),
  todayRevenue: z.number(),
  todayOrders: z.number(),
  lowStockCount: z.number(),
});

export type DashboardKpisRaw = z.infer<typeof DashboardKpisRawSchema>;

/**
 * Compute main dashboard KPIs by orchestrating primitives
 */
export async function getDashboardKpisRaw(todayStart: Date, todayEnd: Date): Promise<DashboardKpisRaw> {
  const [productCount, categoryCount, brandCount, totalStats, todayStats, lowStock] = await Promise.all([
    getProductCountRaw(),
    getCategoryCountRaw(),
    getBrandCountRaw(),
    getTotalOrderStatsRaw(),
    getOrderStatsRaw(todayStart, todayEnd),
    getLowStockCountRaw(),
  ]);

  return DashboardKpisRawSchema.parse({
    totalProducts: productCount,
    totalCategories: categoryCount,
    totalBrands: brandCount,
    totalOrders: totalStats.totalOrders,
    totalRevenue: totalStats.totalRevenue,
    todayOrders: todayStats.totalOrders,
    todayRevenue: todayStats.totalRevenue,
    lowStockCount: lowStock,
  });
}
