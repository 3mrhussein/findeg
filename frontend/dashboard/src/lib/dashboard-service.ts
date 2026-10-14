import 'server-only';
import { DEFAULT_CURRENCY } from '@findeg/domain';

import { CatalogHealthStats, CategoryProductDistribution } from '@findeg/catalog';
import type { Order } from '@findeg/orders';
import { AdminCatalogMetrics } from '@findeg/catalog';
import { getInventoryLowStockCount } from '@findeg/inventory';
import { QueryError } from '@findeg/catalog';
import { createOrders } from '@findeg/orders';

/**
 * Admin Dashboard Service
 *
 * Orchestrates KPI and catalog metrics from primitives in the db layer.
 * Handles validation, composition, and error mapping.
 */
export class AdminDashboardService implements IAdminDashboardService {
  /**
   * Creates an instance of AdminDashboardService.
   */
  constructor() {}

  /**
   * Aggregates key performance indicators (KPIs) for the store dashboard.
   * Includes lifetime revenue, today's sales, and 30-day trends.
   *
   * @returns Comprehensive dashboard statistics object.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [counts, stats, lowStockCount] = await Promise.all([
        new AdminCatalogMetrics().getCounts(),
        createOrders().getStats(),
        getInventoryLowStockCount(),
      ]);

      // Map to output shape
      return {
        totalProducts: counts.totalProducts,
        totalCategories: counts.totalCategories,
        totalBrands: counts.totalBrands,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        todayRevenue: stats.todayRevenue,
        todayOrders: stats.todayOrders,
        currency: DEFAULT_CURRENCY,
        lowStockCount,
        timezone: stats.timezone,
        ordersByStatus: stats.ordersByStatus,
        topProducts: stats.topProducts,
        revenueByPeriod: stats.revenueByPeriod,
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
    return createOrders().recent(limit);
  }

  getCatalogHealthStats() {
    return new AdminCatalogMetrics().getCatalogHealthStats();
  }
  getCategoryProductDistribution() {
    return new AdminCatalogMetrics().getCategoryProductDistribution();
  }
}

import { BUSINESS_TIME_ZONE } from '@findeg/domain';
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalBrands: number;
  totalRevenue: bigint;
  currency: typeof DEFAULT_CURRENCY;
  timezone: typeof BUSINESS_TIME_ZONE;
  ordersByStatus: Record<import('@findeg/orders/types').OrderStatus, number>;
  lowStockCount: number;
  todayRevenue: bigint;
  todayOrders: number;
  topProducts: {
    id: number;
    name: string;
    sold: number;
    revenue: bigint;
  }[];
  revenueByPeriod: {
    date: string;
    revenue: bigint;
  }[];
}

/**
 * Admin Dashboard Service Interface
 *
 * Central service for aggregating and retrieving statistical data for the admin dashboard.
 * It interacts with multiple repositories to provide a unified view of the system's status.
 */

export interface IAdminDashboardService {
  /**
   * Retrieves high-level statistics for the admin dashboard.
   *
   * Aggregates data including:
   * - Total Revenue (sum of all completed orders)
   * - Total Orders count
   * - Total Products count
   * - Total Customers count
   *
   * @returns {Promise<DashboardStats>} A promise that resolves to the dashboard statistics object.
   * @throws {Error} If there is an issue calculating the statistics from the repositories.
   */
  getDashboardStats(): Promise<DashboardStats>;

  /**
   * Fetches the most recent orders placed in the system.
   *
   * Used to display the "Recent Orders" widget on the dashboard.
   *
   * @param {number} [limit] - The maximum number of orders to return. Defaults to implementation-specific limit (usually 5 or 10).
   * @returns {Promise<Order[]>} A promise that resolves to an array of recent Order entities, sorted by date descending.
   */
  getRecentOrders(limit?: number): Promise<Order[]>;

  /**
   * Retrieves specific catalog health completion metrics.
   * Compares products against minimum go-live criteria: category assigned, images uploaded, price set, active status.
   */
  getCatalogHealthStats(): Promise<CatalogHealthStats>;

  /**
   * Evaluates catalog coverage distributed across top categories.
   */
  getCategoryProductDistribution(limit?: number): Promise<CategoryProductDistribution[]>;
}
