import { IAdminDashboardService } from "../interfaces/IAdminDashboardService";
import { IProductRepository } from "@/features/catalog/application/interfaces/IProductRepository";
import { ICategoryRepository } from "@/features/catalog/application/interfaces/ICategoryRepository";
import { IOrderRepository } from "@/features/order/application/interfaces/IOrderRepository";
import { IBrandRepository } from "@/features/catalog/application/interfaces/IBrandRepository";
import { DashboardStats } from "../../domain/types/DashboardStats";
import { Order } from "@/features/order/domain/entities/Order";
import { startOfDay, endOfDay, subDays } from "date-fns";

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
      currency: "EGP",
      lowStockCount: lowStockProducts.length,
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
}
