import { Order } from '@findeg/backend/features/order/domain/entities/Order';
import { OrderStatusUpdate } from '@findeg/backend/features/order/application/dtos';
import { OrderFilters } from '@findeg/backend/features/order/application/interfaces/IOrderRepository';
import { PaymentStatus, OrderStatus } from '@findeg/backend/features/core/domain/types/common';

export interface DashboardStats {
  totalRevenue: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
}

export interface IAdminOrderService {
  /**
   * Retrieves a paginated list of orders matching the given filters.
   */
  getAll(filters: OrderFilters): Promise<{ orders: Order[]; total: number }>;

  /**
   * Retrieves a single order by ID including all line items.
   */
  getById(id: number): Promise<Order | null>;

  /**
   * Updates the delivery or lifecycle status of an order.
   */
  updateStatus(id: number, update: OrderStatusUpdate): Promise<void>;

  /**
   * Updates the financial payment status of an order.
   */
  updatePaymentStatus(id: number, status: PaymentStatus): Promise<void>;

  /**
   * Retrieves high-level order statistics for the dashboard.
   */
  getDashboardStats(): Promise<DashboardStats>;

  /**
   * Retrieves a breakdown of order counts by their lifecycle status.
   */
  getStatusCounts(): Promise<Record<string, number>>;
}
