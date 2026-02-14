/**
 * Admin Dashboard Service Implementation
 *
 * Aggregates data from multiple repositories to provide dashboard statistics.
 * Depends on IProductRepository, ICategoryRepository, and IOrderRepository.
 */

import { IAdminDashboardService } from "./interfaces/IAdminDashboardService";
import { IProductRepository } from "../repositories/IProductRepository";
import { ICategoryRepository } from "../repositories/ICategoryRepository";
import { IOrderRepository } from "../repositories/IOrderRepository";
import { IBrandRepository } from "../repositories/IBrandRepository"; // Add brand repo
import { DashboardStats } from "@/domain/types/admin";
import { Order } from "@/domain/entities/Order";
import { startOfDay, endOfDay, subDays } from "date-fns";

/**
 * Admin Dashboard Service
 *
 * Aggregates KPIs and statistics from multiple data sources.
 * Provides real-time metrics for revenue, orders, inventory, and trends.
 */
export class AdminDashboardService implements IAdminDashboardService {
  /**
   * Creates an instance of AdminDashboardService
   *
   * @param productRepository - Product data access layer
   * @param categoryRepository - Category data access layer
   * @param orderRepository - Order data access layer
   * @param brandRepository - Optional brand data access layer
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private orderRepository: IOrderRepository,
    private brandRepository?: IBrandRepository, // Optional injection? ServiceContainer needs update
  ) {}

  /**
   * Retrieves comprehensive dashboard statistics
   *
   * Aggregates data including:
   * - Total counts (products, categories, orders, brands)
   * - Revenue metrics (total, today, by period)
   * - Low stock alerts
   * - Recent order trends
   *
   * @returns Dashboard statistics object with all KPIs
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
      lowStockProducts,
      todayRevenue,
      todayOrders,
      revenueByPeriod,
    ] = await Promise.all([
      this.productRepository.count(),
      this.categoryRepository.count(),
      this.orderRepository.count(),
      this.orderRepository.getTotalRevenue(),
      this.brandRepository ? this.brandRepository.count() : Promise.resolve(0),
      this.productRepository.getLowStock(),
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
      currency: "EGP", // Or from config
      lowStockCount: lowStockProducts.length,
      todayRevenue,
      todayOrders,
      topProducts: [], // Not implemented yet in repo
      revenueByPeriod,
    };
  }

  /**
   * Retrieves recent orders for quick admin review
   *
   * @param limit - Maximum number of orders to return (default: 5)
   * @returns Array of recent orders sorted by creation date
   */
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    return this.orderRepository.getRecent(limit);
  }
}
