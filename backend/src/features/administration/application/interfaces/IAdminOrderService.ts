import type { Order, OrderStatusUpdate, OrderFilters } from '@findeg/backend/features/order';
import { PaymentStatus, OrderStatus } from '@findeg/backend/features/core/domain/types/common';

export interface DashboardStats {
  totalRevenue: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
}

/** The signed-in Staff member changing an Order from the Dashboard. */
export interface OrderStaffActor {
  kind: 'staff';
  userId: number;
  permissionCodes?: readonly string[];
  activeRoleIds?: readonly string[];
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
   * Throws OrderWriteForbiddenError unless the actor has order-write access.
   */
  updateStatus(actor: OrderStaffActor, id: number, update: OrderStatusUpdate): Promise<void>;

  /**
   * Updates the financial payment status of an order.
   * Throws OrderWriteForbiddenError unless the actor has order-write access.
   */
  updatePaymentStatus(actor: OrderStaffActor, id: number, status: PaymentStatus): Promise<void>;

  /**
   * Retrieves high-level order statistics for the dashboard.
   */
  getDashboardStats(): Promise<DashboardStats>;

  /**
   * Retrieves a breakdown of order counts by their lifecycle status.
   */
  getStatusCounts(): Promise<Record<string, number>>;
}
