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
import { DashboardStats } from "@/domain/types/admin";
import { Order } from "@/domain/entities/Order";

/**
 *
 */
export class AdminDashboardService implements IAdminDashboardService {
  /**
   *
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private orderRepository: IOrderRepository,
  ) {}

  /**
   *
   */
  async getStats(): Promise<DashboardStats> {
    const [totalProducts, totalCategories, totalOrders, totalRevenue] = await Promise.all([
      this.productRepository.count(),
      this.categoryRepository.count(),
      this.orderRepository.count(),
      this.orderRepository.getTotalRevenue(),
    ]);

    return {
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      currency: "USD",
    };
  }

  /**
   *
   */
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    return this.orderRepository.getRecent(limit);
  }
}
