import { ID } from "../../../core/domain/types/common";
import { IAdminOrderService } from "../interfaces/IAdminOrderService";
import {
  IOrderRepository,
  OrderFilters,
} from "../../../order/application/interfaces/IOrderRepository";
import { IAuditLogService } from "../interfaces/IAuditLogService";
import { IEmailService } from "../../../notifications/application/services/IEmailService";
import { Order } from "../../../order/domain/entities/Order";
import { OrderStatusUpdate } from "../../domain/types/OrderStatusUpdate";
import { PaymentStatus } from "../../../core/domain/types/common";
import {
  canTransitionOrderStatus,
  getAllowedOrderStatusTransitions,
  normalizeOrderStatus,
} from "../../../order/application/utils/order-status-transitions";
import {
  canTransitionPaymentStatus,
  getAllowedPaymentStatusTransitions,
  normalizePaymentStatus,
} from "../../../order/application/utils/order-payment-status-transitions";

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
   * @param emailService - Service for sending transactional emails.
   */
  constructor(
    private orderRepository: IOrderRepository,
    private auditLogService: IAuditLogService,
    private emailService: IEmailService,
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
  async getById(id: ID | string): Promise<Order | null> {
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
  async updateStatus(id: ID | string, update: OrderStatusUpdate): Promise<void> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new Error(`Order #${id} not found`);
    }

    const currentStatus = normalizeOrderStatus(order.status);
    const nextStatus = normalizeOrderStatus(update.status);
    const isValidTransition = canTransitionOrderStatus(currentStatus, nextStatus);

    if (!isValidTransition) {
      const allowedTargets = getAllowedOrderStatusTransitions(currentStatus);
      const allowedList = allowedTargets.length > 0 ? allowedTargets.join(", ") : "none";
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${nextStatus}. Allowed: ${allowedList}.`,
      );
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

    // Send email notification to customer
    await this.emailService.sendOrderStatusUpdate(order, update.status).catch((err) => {
      console.error("[AdminOrderService] Failed to send status update email:", err);
    });
  }

  /**
   * Updates the payment status for an order (e.g., 'Paid').
   *
   * @param id - The order ID.
   * @param status - The new payment status string.
   * @throws Error if the order is not found.
   */
  async updatePaymentStatus(id: ID | string, status: PaymentStatus): Promise<void> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new Error(`Order #${id} not found`);
    }

    const oldStatus = normalizePaymentStatus(order.paymentStatus);
    const nextStatus = normalizePaymentStatus(status);
    const isValidTransition = canTransitionPaymentStatus(oldStatus, nextStatus);

    if (!isValidTransition) {
      const allowedTargets = getAllowedPaymentStatusTransitions(oldStatus);
      const allowedList = allowedTargets.length > 0 ? allowedTargets.join(", ") : "none";
      throw new Error(
        `Invalid payment status transition from ${oldStatus} to ${nextStatus}. Allowed: ${allowedList}.`,
      );
    }

    await this.orderRepository.updatePaymentStatus(id, status);

    await this.auditLogService.logAction({
      entityType: "order",
      entityId: String(id),
      action: "update_payment_status",
      oldValues: { paymentStatus: oldStatus },
      newValues: { paymentStatus: nextStatus },
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

  /**
   * Retrieves a breakdown of order counts by their lifecycle status.
   */
  async getStatusCounts(): Promise<Record<string, number>> {
    const counts = await this.orderRepository.getOrdersCountByStatus();
    return counts as Record<string, number>;
  }
}
