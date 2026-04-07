/**
 * Admin Dashboard Service Interface
 *
 * Central service for aggregating and retrieving statistical data for the admin dashboard.
 * It interacts with multiple repositories to provide a unified view of the system's status.
 */

import {
  DashboardStats,
  CatalogHealthStats,
  CategoryProductDistribution,
} from "@features/administration/domain/types";
import { Order } from "@features/order/domain/entities/Order";

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
