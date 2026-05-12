import { DashboardStats, IAdminOrderService } from '../interfaces/IAdminOrderService';
import { IAuditLogService } from '../interfaces/IAuditLogService';
import { IEmailService } from '../../../notifications/application/services/IEmailService';
import { OrderStatusUpdate } from '@findeg/backend/features/order/application/dtos/OrderStatusUpdate';
import { PaymentStatus, OrderStatus } from '../../../core/domain/types/common';
import {
  canTransitionOrderStatus,
  getAllowedOrderStatusTransitions,
  normalizeOrderStatus,
} from '../../../order/application/utils/order-status-transitions';
import {
  canTransitionPaymentStatus,
  getAllowedPaymentStatusTransitions,
  normalizePaymentStatus,
} from '../../../order/application/utils/order-payment-status-transitions';
import { ShippingAddress } from '../../../order/domain/value-objects';
import { type Order } from '../../../order/domain/entities/Order';
import { orderQueries } from '@findeg/db/queries';

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
   * @param auditLogService - Service for tracking order modifications.
   * @param emailService - Service for sending transactional emails.
   */
  constructor(
    private auditLogService: IAuditLogService,
    private emailService: IEmailService,
  ) { }

  private mapToDomain(
    dbOrder: any,
    items: any[],
  ): Order {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId || undefined,
      guestEmail: dbOrder.guestEmail || undefined,
      status: dbOrder.status,
      paymentStatus: dbOrder.paymentStatus,
      subtotal: Number(dbOrder.subtotal),
      shippingCost: Number(dbOrder.shippingCost),
      totalAmount: Number(dbOrder.totalAmount),
      currency: dbOrder.currency,
      paymentMethod: dbOrder.paymentMethod || undefined,
      shippingAddressSnapshot: (dbOrder.shippingAddressSnapshot as ShippingAddress) || undefined,
      trackingNumber: dbOrder.trackingNumber || undefined,
      adminNotes: dbOrder.adminNotes || undefined,
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt,
      customerName: dbOrder.customerName,
      customerEmail: dbOrder.customerEmail,
      items: items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId!,
        variantId: ((item as Record<string, unknown>).variantId as number) || undefined,
        quantity: item.quantity,
        uomCode: ((item as Record<string, unknown>).uomCode as string) || undefined,
        unitPriceSnapshot: item.unitPriceSnapshot
          ? Number(item.unitPriceSnapshot)
          : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
        productNameSnapshot: item.productNameSnapshot || undefined,
        productSkuSnapshot: item.productSkuSnapshot || undefined,
        variantSnapshot: (item.variantSnapshot as Record<string, unknown>) || undefined,
      })),
    };
  }

  /**
   * Retrieves a paginated and filtered list of orders.
   *
   * @param filters - Selection criteria (status, date range, customer).
   * @returns List of orders and the total count.
   */
  async getAll(filters: any): Promise<{ orders: Order[]; total: number }> {
    const result = await orderQueries.getFiltered(filters || {});
    return {
      orders: result.orders.map((row: { order: unknown; items: unknown[] }) =>
        this.mapToDomain(row.order, row.items),
      ),
      total: result.total,
    };
  }

  /**
   * Retrieves an order by its unique numerical identifier.
   *
   * @param id - The order ID.
   * @returns The order if found, null otherwise.
   */
  async getById(id: number): Promise<Order | null> {
    const result = await orderQueries.getById(id);
    if (!result) return null;
    return this.mapToDomain(result.order, result.items);
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
    const result = await orderQueries.getById(id);
    if (!result) {
      throw new Error(`Order #${id} not found`);
    }

    const order = this.mapToDomain(result.order, result.items);

    const currentStatus = normalizeOrderStatus(order.status);
    const nextStatus = normalizeOrderStatus(update.status);
    const isValidTransition = canTransitionOrderStatus(currentStatus, nextStatus);

    if (!isValidTransition) {
      const allowedTargets = getAllowedOrderStatusTransitions(currentStatus);
      const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${nextStatus}. Allowed: ${allowedList}.`,
      );
    }

    await orderQueries.updateStatusWithTracking(id, update);

    await this.auditLogService.logAction({
      entityType: 'order',
      entityId: String(id),
      action: 'update_status',
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
      console.error('[AdminOrderService] Failed to send status update email:', err);
    });
  }

  /**
   * Updates the payment status for an order (e.g., 'Paid').
   *
   * @param id - The order ID.
   * @param status - The new payment status string.
   * @throws Error if the order is not found.
   */
  async updatePaymentStatus(id: number, status: PaymentStatus): Promise<void> {
    const result = await orderQueries.getById(id);
    if (!result) {
      throw new Error(`Order #${id} not found`);
    }

    const order = this.mapToDomain(result.order, result.items);

    const oldStatus = normalizePaymentStatus(order.paymentStatus);
    const nextStatus = normalizePaymentStatus(status);
    const isValidTransition = canTransitionPaymentStatus(oldStatus, nextStatus);

    if (!isValidTransition) {
      const allowedTargets = getAllowedPaymentStatusTransitions(oldStatus);
      const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
      throw new Error(
        `Invalid payment status transition from ${oldStatus} to ${nextStatus}. Allowed: ${allowedList}.`,
      );
    }

    await orderQueries.updatePaymentStatus(id, status);

    await this.auditLogService.logAction({
      entityType: 'order',
      entityId: String(id),
      action: 'update_payment_status',
      oldValues: { paymentStatus: oldStatus },
      newValues: { paymentStatus: nextStatus },
    });
  }

  /**
   * Gathers high-level statistics about orders and revenue for the admin dashboard.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const revenue = await orderQueries.getTotalRevenue();
    const statusCounts = await orderQueries.getOrdersCountByStatus();

    return {
      totalRevenue: revenue,
      ordersByStatus: statusCounts.reduce(
        (acc, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        },
        {} as Partial<Record<OrderStatus, number>>,
      ),
    };
  }

  /**
   * Retrieves a breakdown of order counts by their lifecycle status.
   */
  async getStatusCounts(): Promise<Record<string, number>> {
    const counts = await orderQueries.getOrdersCountByStatus();
    return counts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
