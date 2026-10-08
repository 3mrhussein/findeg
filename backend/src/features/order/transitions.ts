import { eq } from 'drizzle-orm';
import { consumeOrderStock, releaseOrderStock } from '@findeg/db/queries/order-stock';
import {
  enqueue,
  isNotifiedOrderStatus,
  orderStatusId,
  ORDER_STATUS_KIND,
} from '../outbox/transaction';
import type { OrderDatabase } from './statistics';
import { auditLog, orders } from '@findeg/db/schema';
import type { OrderStatus, PaymentStatus } from '../core';
import { assertCanWriteOrders, type OrderStaffActor } from './actor';
import {
  OrderStatusUpdateSchema,
  type OrderStatusUpdate,
} from './application/dtos/OrderStatusUpdate';
import {
  ORDER_STATUS_OPTIONS,
  getAllowedOrderStatusTransitions,
} from './application/utils/order-status-transitions';
import {
  PAYMENT_STATUS_OPTIONS,
  getAllowedPaymentStatusTransitions,
} from './application/utils/order-payment-status-transitions';
import {
  InvalidOrderStatusTransitionError,
  InvalidOrderStatusValueError,
  InvalidPaymentStatusTransitionError,
  OrderNotFoundError,
} from './errors';

export interface OrderStatusTransitionResult {
  changed: boolean;
  previousStatus: OrderStatus;
  status: OrderStatus;
}
export interface PaymentStatusTransitionResult {
  changed: boolean;
  previousStatus: PaymentStatus;
  status: PaymentStatus;
}

/** One row lock and transaction own the update, stock, message and audit. */
export function createOrderTransitions(deps: { db?: OrderDatabase; now?: () => Date } = {}) {
  const now = deps.now ?? (() => new Date());
  const database = async () => deps.db ?? (await import('@findeg/db/connection')).db;

  return {
    async changeStatus(
      actor: OrderStaffActor,
      orderId: number,
      update: OrderStatusUpdate,
    ): Promise<OrderStatusTransitionResult> {
      assertCanWriteOrders(actor);
      if (!ORDER_STATUS_OPTIONS.includes(update?.status)) {
        throw new InvalidOrderStatusValueError('status', update?.status);
      }
      if (!Number.isSafeInteger(orderId) || orderId <= 0)
        throw new RangeError('Order ID must be a positive safe integer');
      OrderStatusUpdateSchema.parse(update);
      const db = await database();
      return db.transaction(async (tx) => {
        const [order] = await tx
          .select({
            status: orders.status,
            orderReference: orders.orderReference,
            trackingNumber: orders.trackingNumber,
            adminNotes: orders.adminNotes,
          })
          .from(orders)
          .where(eq(orders.id, orderId))
          .for('update');
        if (!order) throw new OrderNotFoundError(orderId);
        if (order.status === update.status) {
          return { changed: false, previousStatus: order.status, status: order.status };
        }
        const allowed = getAllowedOrderStatusTransitions(order.status);
        if (!allowed.includes(update.status)) {
          throw new InvalidOrderStatusTransitionError(order.status, update.status, allowed);
        }
        if (update.status === 'delivered' || update.status === 'cancelled') {
          if (update.status === 'delivered') await consumeOrderStock(orderId, tx);
          else await releaseOrderStock(orderId, tx);
        }
        const changedAt = now();
        const fields: Partial<typeof orders.$inferInsert> = {
          status: update.status,
          updatedAt: changedAt,
        };
        if (update.trackingNumber !== undefined) fields.trackingNumber = update.trackingNumber;
        if (update.adminNotes !== undefined) fields.adminNotes = update.adminNotes;
        await tx.update(orders).set(fields).where(eq(orders.id, orderId));
        if (isNotifiedOrderStatus(update.status)) {
          await enqueue(tx, orderStatusId(order.orderReference, update.status), ORDER_STATUS_KIND, {
            orderId,
            status: update.status,
          });
        }
        await tx.insert(auditLog).values({
          adminUserId: actor.userId,
          entityType: 'order',
          entityId: String(orderId),
          action: 'update_status',
          oldValues: {
            status: order.status,
            ...(update.trackingNumber !== undefined
              ? { trackingNumber: order.trackingNumber }
              : {}),
            ...(update.adminNotes !== undefined ? { adminNotes: order.adminNotes } : {}),
          },
          newValues: {
            status: update.status,
            trackingNumber: update.trackingNumber,
            adminNotes: update.adminNotes,
          },
          createdAt: changedAt,
        });
        return { changed: true, previousStatus: order.status, status: update.status };
      });
    },
    async changePaymentStatus(
      actor: OrderStaffActor,
      orderId: number,
      status: PaymentStatus,
    ): Promise<PaymentStatusTransitionResult> {
      assertCanWriteOrders(actor);
      if (!PAYMENT_STATUS_OPTIONS.includes(status))
        throw new InvalidOrderStatusValueError('paymentStatus', status);
      if (!Number.isSafeInteger(orderId) || orderId <= 0)
        throw new RangeError('Order ID must be a positive safe integer');
      const db = await database();
      return db.transaction(async (tx) => {
        const [order] = await tx
          .select({ paymentStatus: orders.paymentStatus })
          .from(orders)
          .where(eq(orders.id, orderId))
          .for('update');
        if (!order) throw new OrderNotFoundError(orderId);
        if (order.paymentStatus === status)
          return { changed: false, previousStatus: order.paymentStatus, status };
        const allowed = getAllowedPaymentStatusTransitions(order.paymentStatus);
        if (!allowed.includes(status))
          throw new InvalidPaymentStatusTransitionError(order.paymentStatus, status, allowed);
        const changedAt = now();
        await tx
          .update(orders)
          .set({ paymentStatus: status, updatedAt: changedAt })
          .where(eq(orders.id, orderId));
        await tx.insert(auditLog).values({
          adminUserId: actor.userId,
          entityType: 'order',
          entityId: String(orderId),
          action: 'update_payment_status',
          oldValues: { paymentStatus: order.paymentStatus },
          newValues: { paymentStatus: status },
          createdAt: changedAt,
        });
        return { changed: true, previousStatus: order.paymentStatus, status };
      });
    },
  };
}
