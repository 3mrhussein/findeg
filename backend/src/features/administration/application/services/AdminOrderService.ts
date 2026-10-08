import {
  DashboardStats,
  IAdminOrderService,
  type OrderActivityEntry,
  type OrderDetail,
  type OrderStaffActor,
} from '../interfaces/IAdminOrderService';
import { assertCanWriteOrders } from '../../domain/orderWritePermission';
import { IAuditLogService } from '../interfaces/IAuditLogService';
import type { OrderStatusUpdate } from '@findeg/backend/features/order';
import { PaymentStatus, OrderStatus } from '../../../core/domain/types/common';
import { transitionOrderStatus } from '../../../order/application/services/transition-order-status';
import { transitionPaymentStatus } from '../../../order/application/services/transition-payment-status';
import { normalizePaymentStatus } from '../../../order/application/utils/order-payment-status-transitions';
import { ShippingAddress } from '../../../order/domain/value-objects';
import { type Order } from '../../../order/domain/entities/Order';
import { auditLogQueries, orderQueries } from '@findeg/db/queries';

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
   */
  constructor(private auditLogService: IAuditLogService) {}

  private mapToDomain(dbOrder: orderQueries.OrderRow, items: orderQueries.OrderItemRow[]): Order {
    return {
      id: dbOrder.id,
      orderReference: dbOrder.orderReference,
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
        unitPriceSnapshot: item.unitPriceSnapshot ? Number(item.unitPriceSnapshot) : undefined,
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
  async getAll(
    filters: orderQueries.OrderFiltersInput,
  ): Promise<{ orders: Order[]; total: number }> {
    const result = await orderQueries.getFiltered(filters || {});
    return {
      orders: result.orders.map((row) => this.mapToDomain(row.order, row.items)),
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
   * Retrieves an Order with its activity log (audit entries for the Order, newest first).
   *
   * @param id - The order ID.
   * @returns The order and activity, or null when the order does not exist.
   */
  async getDetail(id: number): Promise<OrderDetail | null> {
    const order = await this.getById(id);
    if (!order) return null;
    const rows = await auditLogQueries.getByEntityWithAdmin('order', String(id));
    const activity: OrderActivityEntry[] = rows.map(({ log, adminFirstName, adminLastName }) => {
      const oldValues = (log.oldValues ?? {}) as Record<string, unknown>;
      const newValues = (log.newValues ?? {}) as Record<string, unknown>;
      const key = Object.keys(newValues).find((k) => k in oldValues) ?? Object.keys(oldValues)[0];
      const display = (v: unknown) => (v == null ? undefined : String(v));
      return {
        id: log.id,
        action: log.action,
        adminId: log.adminUserId ?? undefined,
        adminName: [adminFirstName, adminLastName].filter(Boolean).join(' ') || undefined,
        oldValue: key ? display(oldValues[key]) : undefined,
        newValue: key ? display(newValues[key]) : undefined,
        createdAt: log.createdAt,
      };
    });
    return { order, activity };
  }

  /**
   * Updates the logistical status of an order (e.g., 'Shipped') and adds tracking info.
   * Triggers an audit log entry for the status change.
   *
   * @param actor - The Staff member making the change, recorded on the audit row.
   * @param id - The order ID.
   * @param update - Status, tracking number, and internal notes.
   * @throws NotAuthorizedError if the actor lacks order-write access.
   * @throws Error if the order is not found.
   */
  async updateStatus(actor: OrderStaffActor, id: number, update: OrderStatusUpdate): Promise<void> {
    assertCanWriteOrders(actor);
    const result = await orderQueries.getById(id);
    if (!result) {
      throw new Error(`Order #${id} not found`);
    }

    const transition = await transitionOrderStatus(id, update);
    if (!transition.changed) return;

    await this.auditLogService.logAction({
      entityType: 'order',
      entityId: String(id),
      action: 'update_status',
      adminUserId: actor.userId,
      oldValues: { status: transition.previousStatus } as Record<string, unknown>,
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
   * @param actor - The Staff member making the change, recorded on the audit row.
   * @param id - The order ID.
   * @param status - The new payment status string.
   * @throws NotAuthorizedError if the actor lacks order-write access.
   * @throws Error if the order is not found.
   */
  async updatePaymentStatus(
    actor: OrderStaffActor,
    id: number,
    status: PaymentStatus,
  ): Promise<void> {
    assertCanWriteOrders(actor);
    // The audit row is written by the transition, in the same transaction as the change.
    await transitionPaymentStatus(id, normalizePaymentStatus(status), { userId: actor.userId });
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
