import { IAdminOrderService } from "../interfaces/IAdminOrderService";
import {
  IOrderRepository,
  OrderFilters,
} from "@/features/order/application/interfaces/IOrderRepository";
import { IAuditLogService } from "../interfaces/IAuditLogService";
import { Order } from "@/features/order/domain/entities/Order";
import { OrderStatusUpdate } from "../../domain/types/OrderStatusUpdate";

/**
 * Admin Order Service
 *
 * Manages order lifecycle and status updates for admin dashboard.
 * Handles order tracking, payment status, and audit logging.
 */
export class AdminOrderService implements IAdminOrderService {
  /**
   * Creates an instance of AdminOrderService.
   *
   * @param orderRepository - Repository for order data access.
   * @param auditLogService - Service for tracking order modifications.
   */
  constructor(
    private orderRepository: IOrderRepository,
    private auditLogService: IAuditLogService,
  ) {}

  /**
   * Retrieves a paginated and filtered list of orders.
   *
   * @param filters - Selection criteria (status, date range, customer).
   * @returns List of orders and the total count.
   */
  async getAll(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    return this.orderRepository.getAllFiltered(filters);
  }

  /**
   * Retrieves an order by its unique numerical identifier.
   *
   * @param id - The order ID.
   * @returns The order if found, null otherwise.
   */
  async getById(id: number): Promise<Order | null> {
    return this.orderRepository.getById(id);
  }

  /**
   * Updates the logistical status of an order (e.g., 'Shipped') and adds tracking info.
   * Triggers an audit log entry for the status change.
   *
   * @param id - The order ID.
   * @param update - Status, tracking number, and internal notes.
   * @throws Error if the order is not found.
   */
  async updateStatus(id: number, update: OrderStatusUpdate): Promise<void> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new Error(`Order #${id} not found`);
    }

    await this.orderRepository.updateStatusWithTracking(id, update);

    await this.auditLogService.logAction({
      entityType: "order",
      entityId: String(id),
      action: "update_status",
      adminUserId: undefined,
      oldValues: { status: order.status } as Record<string, unknown>,
      newValues: {
        status: update.status,
        trackingNumber: update.trackingNumber,
        adminNotes: update.adminNotes,
      } as Record<string, unknown>,
    });
  }

  /**
   * Updates the payment status for an order (e.g., 'Paid').
   *
   * @param id - The order ID.
   * @param status - The new payment status string.
   * @throws Error if the order is not found.
   */
  async updatePaymentStatus(id: number, status: string): Promise<void> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new Error(`Order #${id} not found`);
    }

    const oldStatus = order.paymentStatus;
    await this.orderRepository.updatePaymentStatus(id, status);

    await this.auditLogService.logAction({
      entityType: "order",
      entityId: String(id),
      action: "update_payment_status",
      oldValues: { paymentStatus: oldStatus },
      newValues: { paymentStatus: status },
    });
  }

  /**
   * Gathers high-level statistics about orders and revenue for the admin dashboard.
   */
  async getDashboardStats(): Promise<unknown> {
    const revenue = await this.orderRepository.getTotalRevenue();
    const statusCounts = await this.orderRepository.getOrdersCountByStatus();

    return {
      totalRevenue: revenue,
      ordersByStatus: statusCounts,
    };
  }
}
