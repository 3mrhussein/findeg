import type { Order, OrderStatusUpdate, OrderFilters } from '@findeg/backend/features/order';
import { PaymentStatus, OrderStatus } from '@findeg/backend/features/core/domain/types/common';
import type { OrderStaffActor } from '../../domain/OrderStaffActor';

export type { OrderStaffActor };

export interface DashboardStats {
  totalRevenue: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
}

/** One Dashboard activity-log entry on an Order, with display-ready change values. */
export interface OrderActivityEntry {
  id: number;
  action: string;
  adminId?: number;
  adminName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

/** An Order with its activity log, for the Dashboard Order detail page. */
export interface OrderDetail {
  order: Order;
  /** Newest first. */
  activity: OrderActivityEntry[];
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
   * Retrieves one Order with items and its activity log; null when it does not exist.
   */
  getDetail(id: number): Promise<OrderDetail | null>;

  /**
   * Updates the delivery or lifecycle status of an order.
   * Throws NotAuthorizedError unless the actor has order-write access.
   */
  updateStatus(actor: OrderStaffActor, id: number, update: OrderStatusUpdate): Promise<void>;

  /**
   * Updates the financial payment status of an order.
   * Throws NotAuthorizedError unless the actor has order-write access.
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
