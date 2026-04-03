import { ID, Price } from "@/features/core/domain/types/common";
import { IAdminDashboardService } from "../interfaces/IAdminDashboardService";
import { IProductRepository } from "@/features/catalog/application/interfaces/IProductRepository";
import { ICategoryRepository } from "@/features/catalog/application/interfaces/ICategoryRepository";
import { IOrderRepository } from "@/features/order/application/interfaces/IOrderRepository";
import { IBrandRepository } from "@/features/catalog/application/interfaces/IBrandRepository";
import { DashboardStats } from "../../domain/types/DashboardStats";
import { CatalogHealthStats, CategoryProductDistribution } from "../../domain/types";
import { Order } from "@/features/order/domain/entities/Order";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { db } from "@/features/core/infrastructure/persistence/database.config";
import { products } from "@/features/core/infrastructure/persistence/schema/products";
import { categories } from "@/features/core/infrastructure/persistence/schema/categories";
import {
  productVariants,
  variantImages,
} from "@/features/core/infrastructure/persistence/schema/product-variants";
import { sql, count, desc, eq, isNotNull, and } from "drizzle-orm";

/**
 * Admin Dashboard Service
 *
 * Aggregates KPIs and statistics from multiple data sources.
 * Provides real-time metrics for revenue, orders, inventory, and trends.
 */
export class AdminDashboardService implements IAdminDashboardService {
  /**
   * Creates an instance of AdminDashboardService.
   *
   * @param productRepository - For inventory counts.
   * @param categoryRepository - For category counts.
   * @param orderRepository - For revenue and order volume.
   * @param brandRepository - Optional for brand counts.
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private orderRepository: IOrderRepository,
    private brandRepository?: IBrandRepository,
  ) {}

  /**
   * Aggregates key performance indicators (KPIs) for the store dashboard.
   * Includes lifetime revenue, today's sales, and 30-day trends.
   *
   * @returns Comprehensive dashboard statistics object.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      totalBrandsPromises,
      todayRevenue,
      todayOrders,
      revenueByPeriod,
    ] = await Promise.all([
      this.productRepository.count(),
      this.categoryRepository.count(),
      this.orderRepository.count(),
      this.orderRepository.getTotalRevenue(),
      this.brandRepository ? this.brandRepository.count() : Promise.resolve(0),
      this.orderRepository.getTotalRevenue(todayStart, todayEnd),
      this.orderRepository.count({ startDate: todayStart, endDate: todayEnd }),
      this.orderRepository.getRevenueByPeriod(subDays(new Date(), 30), new Date(), "day"),
    ]);

    return {
      totalProducts,
      totalCategories,
      totalOrders,
      totalBrands: totalBrandsPromises,
      totalRevenue,
      currency: "EGP",
      lowStockCount: 0,
      todayRevenue,
      todayOrders,
      topProducts: [],
      revenueByPeriod,
    };
  }

  /**
   * Retrieves the most recent orders across the system.
   *
   * @param limit - Number of orders to return.
   * @returns List of recent orders.
   */
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    return this.orderRepository.getRecent(limit);
  }

  /**
   * Retrieves specific catalog health completion metrics using Drizzle ORM query builders.
   * Compares products against minimum go-live criteria: category assigned, images uploaded, price set, active status.
   */
  async getCatalogHealthStats(): Promise<CatalogHealthStats> {
    const [counts, totalCategories, totalBrands] = await Promise.all([
      db
        .select({
          total: sql<number>`cast(count(*) as integer)`,
          missingCategory: sql<number>`cast(sum(case when ${products.categoryId} is null then 1 else 0 end) as integer)`,
          draftProducts: sql<number>`cast(sum(case when ${products.isActive} = false then 1 else 0 end) as integer)`,
        })
        .from(products),
      this.categoryRepository.count(),
      this.brandRepository ? this.brandRepository.count() : Promise.resolve(0),
    ]);

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

    return {
      totalProducts: counts[0]?.total || 0,
      totalCategories,
      totalBrands,
      missingCategory: counts[0]?.missingCategory || 0,
      missingImages: missingImages?.count || 0,
      missingPrice: missingPrice?.count || 0,
      draftProducts: counts[0]?.draftProducts || 0,
      fullyComplete: fullyComplete?.count || 0,
    };
  }

  /**
   * Evaluates catalog coverage distributed across top categories.
   */
  async getCategoryProductDistribution(): Promise<CategoryProductDistribution[]> {
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
      .limit(6);

    const totalProducts = results.reduce((sum, r) => sum + r.productCount, 0);

    return results.map((r) => {
      const nameMap = (r.localizedName || {}) as Record<string, string>;
      return {
        categoryId: String(r.categoryId),
        categoryName: nameMap.en || r.slug || "Unknown",
        productCount: r.productCount,
        percentage: totalProducts > 0 ? Math.round((r.productCount / totalProducts) * 100) : 0,
      };
    });
  }
}
