import { IAdminDashboardService } from '../interfaces/IAdminDashboardService';
import { IOrderRepository } from '../../../order/application/interfaces/IOrderRepository';
import { DashboardStats } from '../dtos';
import { CatalogHealthStats, CategoryProductDistribution } from '@findeg/backend/features/catalog/application/dtos';
import { Order } from '../../../order/domain/entities/Order';
import {
  getCatalogHealthRaw,
  getCategoryDistributionRaw,
  getProductCountRaw,
  getCategoryCountRaw,
  getBrandCountRaw,
  getLowStockCountRaw,
  getRevenueByPeriodRaw,
  getTopProductsRaw,
  getTotalOrderStatsRaw,
  getOrderStatsRaw,
} from '@findeg/db/queries';
import { QueryError } from '../../../core/domain/errors/QueryError';
import { endOfDay, startOfDay, subDays } from 'date-fns';

/**
 * Admin Dashboard Service
 *
 * Orchestrates KPI and catalog metrics from primitives in the db layer.
 * Handles validation, composition, and error mapping.
 */
export class AdminDashboardService implements IAdminDashboardService {
  /**
   * Creates an instance of AdminDashboardService.
   *
   * @param orderRepository - For revenue and order volume.
   */
  constructor(private orderRepository: IOrderRepository) { }

  /**
   * Aggregates key performance indicators (KPIs) for the store dashboard.
   * Includes lifetime revenue, today's sales, and 30-day trends.
   *
   * @returns Comprehensive dashboard statistics object.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const thirtyDaysAgo = subDays(now, 30);

      // Orchestrate primitives in parallel
      const [productCount, categoryCount, brandCount, totalStats, todayStats, lowStockCount, topProducts, revenueByPeriod] = await Promise.all([
        getProductCountRaw(),
        getCategoryCountRaw(),
        getBrandCountRaw(),
        getTotalOrderStatsRaw(),
        getOrderStatsRaw(todayStart, todayEnd),
        getLowStockCountRaw(),
        getTopProductsRaw(5),
        getRevenueByPeriodRaw(thirtyDaysAgo, now, 'day'),
      ]);

      // Map to output shape
      return {
        totalProducts: productCount,
        totalCategories: categoryCount,
        totalBrands: brandCount,
        totalOrders: totalStats.totalOrders,
        totalRevenue: totalStats.totalRevenue,
        todayRevenue: todayStats.totalRevenue,
        todayOrders: todayStats.totalOrders,
        currency: 'EGP',
        lowStockCount,
        topProducts,
        revenueByPeriod: revenueByPeriod.map((entry) => ({
          date: entry.period,
          revenue: entry.revenue,
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(`Failed to retrieve dashboard stats: ${error.message}`);
      }
      throw error;
    }
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
    * Retrieves specific catalog health completion metrics.
   */
  async getCatalogHealthStats(): Promise<CatalogHealthStats> {
    try {
      return await getCatalogHealthRaw();
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(`Failed to retrieve catalog health stats: ${error.message}`);
      }
      throw error;
    }
  }

  /**
    * Evaluates catalog coverage distributed across top categories.
   */
  async getCategoryProductDistribution(): Promise<CategoryProductDistribution[]> {
    try {
      const results = await getCategoryDistributionRaw(6);
      const totalProducts = results.reduce((sum, result) => sum + result.productCount, 0);

      return results.map((result) => {
        const nameMap = (result.localizedName || {}) as Record<string, string>;

        return {
          categoryId: String(result.categoryId),
          categoryName: nameMap.en || result.slug || 'Unknown',
          productCount: result.productCount,
          percentage:
            totalProducts > 0 ? Math.round((result.productCount / totalProducts) * 100) : 0,
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(`Failed to retrieve category distribution: ${error.message}`);
      }
      throw error;
    }
  }
}
