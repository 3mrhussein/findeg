import { IAdminDashboardService } from '../interfaces/IAdminDashboardService';
import { IOrderRepository } from '../../../order/application/interfaces/IOrderRepository';
import { DashboardStats } from '../../domain/types/DashboardStats';
import { CatalogHealthStats, CategoryProductDistribution } from '../../domain/types';
import { Order } from '../../../order/domain/entities/Order';
import { GetCatalogHealthQuery } from '../queries/GetCatalogHealthQuery';
import { GetCategoryDistributionQuery } from '../queries/GetCategoryDistributionQuery';
import { GetDashboardStatsQuery } from '../queries/GetDashboardStatsQuery';

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
   * @param orderRepository - For revenue and order volume.
   * @param catalogHealthQuery - CQRS query for health stats.
   * @param categoryDistributionQuery - CQRS query for distribution stats.
   * @param dashboardStatsQuery - CQRS query for main dashboard KPIs.
   */
  constructor(
    private orderRepository: IOrderRepository,
    private catalogHealthQuery: GetCatalogHealthQuery,
    private categoryDistributionQuery: GetCategoryDistributionQuery,
    private dashboardStatsQuery: GetDashboardStatsQuery,
  ) {}

  /**
   * Aggregates key performance indicators (KPIs) for the store dashboard.
   * Includes lifetime revenue, today's sales, and 30-day trends.
   *
   * @returns Comprehensive dashboard statistics object.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.dashboardStatsQuery.execute();
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
   * Retrieves specific catalog health completion metrics using CQRS query.
   */
  async getCatalogHealthStats(): Promise<CatalogHealthStats> {
    return this.catalogHealthQuery.execute();
  }

  /**
   * Evaluates catalog coverage distributed across top categories using CQRS query.
   */
  async getCategoryProductDistribution(): Promise<CategoryProductDistribution[]> {
    return this.categoryDistributionQuery.execute(6);
  }
}
