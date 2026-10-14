import { eq } from 'drizzle-orm';
import { auditLog, orders } from '@findeg/db/schema';
import { enqueue } from '@findeg/db/queries/outbox';
import { consumeOrderStock, releaseOrderStock } from '@findeg/db/queries/stock-reservations';
import {
  changeOrderStatus,
  changePaymentStatus,
  isNotifiedOrderStatus,
  refundOrder,
} from '@findeg/domain';
import { ORDER_STATUS_KIND, orderStatusId } from '../order-events';
import { mapOrderRuleError, OrderNotFoundError } from '../order-errors';
import { assertCanWriteOrders, type OrderStaffActor } from '../write-permission';
import { orderStatusUpdateSchema, paymentStatusSchema } from '../input-schemas/helpers';
import type { OrderStatusUpdate } from '../input-schemas';
import { positiveId } from '../validation';
import type { OrderContext, Orders } from '../../types';

/** Staff commands that change an Order's status, refund it, or change its payment status. */
export function createOrderStatusChanges({
  database,
  now,
}: OrderContext): Pick<Orders, 'changeStatus' | 'refund' | 'changePaymentStatus'> {
  async function applyStatusChange(
    actor: OrderStaffActor,
    id: number,
    input: OrderStatusUpdate,
    isRefund = false,
  ) {
    assertCanWriteOrders(actor);
    positiveId.parse(id);
    const update = orderStatusUpdateSchema.parse(input);
    const db = await database();
    return db.transaction(async (tx) => {
      const order = (await tx.select().from(orders).where(eq(orders.id, id)).for('update')).at(0);
      if (!order) throw new OrderNotFoundError(id);
      let progress;
      try {
        progress = isRefund ? refundOrder(order) : changeOrderStatus(order, update.status, update);
      } catch (error) {
        throw mapOrderRuleError(error, order, update.status);
      }
      if (!progress.changed)
        return { changed: false, previousStatus: order.status, status: order.status };
      if (progress.stockSettlement === 'consume') await consumeOrderStock(id, tx);
      else if (progress.stockSettlement === 'release') await releaseOrderStock(id, tx);
      const oldValues: Record<string, unknown> = { status: order.status };
      const newValues: Record<string, unknown> = { status: update.status };
      if (progress.paymentStatus !== order.paymentStatus) {
        oldValues.paymentStatus = order.paymentStatus;
        newValues.paymentStatus = progress.paymentStatus;
      }
      const changedAt = now();
      const fields: Partial<typeof orders.$inferInsert> = {
        status: progress.status,
        paymentStatus: progress.paymentStatus,
        updatedAt: changedAt,
      };
      for (const key of ['trackingNumber', 'adminNotes'] as const) {
        if (update[key] !== undefined) {
          fields[key] = update[key];
          if (update[key] !== order[key]) {
            oldValues[key] = order[key];
            newValues[key] = update[key];
          }
        }
      }
      await tx.update(orders).set(fields).where(eq(orders.id, id));
      if (isNotifiedOrderStatus(update.status))
        await enqueue(tx, orderStatusId(order.orderReference, update.status), ORDER_STATUS_KIND, {
          orderId: id,
          status: update.status,
        });
      await tx.insert(auditLog).values({
        adminUserId: actor.userId,
        entityType: 'order',
        entityId: String(id),
        action: update.status === 'refunded' ? 'refund' : 'update_status',
        oldValues,
        newValues,
        createdAt: changedAt,
      });
      return { changed: true, previousStatus: order.status, status: update.status };
    });
  }

  return {
    async changeStatus(actor, id, input) {
      return applyStatusChange(actor, id, input);
    },
    async refund(actor, id) {
      return applyStatusChange(actor, id, { status: 'refunded' }, true);
    },
    async changePaymentStatus(actor, id, input) {
      assertCanWriteOrders(actor);
      positiveId.parse(id);
      const status = paymentStatusSchema.parse(input);
      const db = await database();
      return db.transaction(async (tx) => {
        const order = (await tx.select().from(orders).where(eq(orders.id, id)).for('update')).at(0);
        if (!order) throw new OrderNotFoundError(id);
        let progress;
        try {
          progress = changePaymentStatus(order, status);
        } catch (error) {
          throw mapOrderRuleError(error, order, undefined, status);
        }
        if (!progress.changed)
          return { changed: false, previousStatus: order.paymentStatus, status };
        const changedAt = now();
        await tx
          .update(orders)
          .set({ paymentStatus: status, updatedAt: changedAt })
          .where(eq(orders.id, id));
        await tx.insert(auditLog).values({
          adminUserId: actor.userId,
          entityType: 'order',
          entityId: String(id),
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
