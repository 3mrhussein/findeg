import { eq } from 'drizzle-orm';
import { db } from '@findeg/db/connection';
import { orders } from '@findeg/db/schema';
import { consumeOrderStock, releaseOrderStock } from '@findeg/db/queries';
import type { OrderStatus } from '@findeg/backend/features/core';
import type { OrderStatusUpdate } from '../dtos/OrderStatusUpdate';
import { getAllowedOrderStatusTransitions } from '../utils/order-status-transitions';
import { onOrderStatusRewardsHook } from '../../domain/rewards-hook';

export class OrderNotFoundError extends Error {
  constructor(readonly orderId: number) {
    super(`Order #${orderId} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(
    readonly from: OrderStatus,
    readonly to: OrderStatus,
    readonly allowedTargets: OrderStatus[],
  ) {
    const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
    super(`Invalid status transition from ${from} to ${to}. Allowed: ${allowedList}.`);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export interface OrderStatusTransitionResult {
  changed: boolean;
  previousStatus: OrderStatus;
  status: OrderStatus;
}

/**
 * Owns Order lifecycle changes so validation and transactional side effects
 * cannot drift across callers.
 */
export function transitionOrderStatus(
  orderId: number,
  update: OrderStatusUpdate,
): Promise<OrderStatusTransitionResult> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .for('update');

    if (!order) throw new OrderNotFoundError(orderId);
    if (order.status === update.status) {
      return { changed: false, previousStatus: order.status, status: order.status };
    }

    const allowedTargets = getAllowedOrderStatusTransitions(order.status);
    if (!allowedTargets.includes(update.status)) {
      throw new InvalidOrderStatusTransitionError(order.status, update.status, allowedTargets);
    }

    if (update.status === 'delivered') {
      await consumeOrderStock(orderId, tx);
    } else if (update.status === 'cancelled') {
      await releaseOrderStock(orderId, tx);
    }

    if (update.status === 'cancelled' || update.status === 'refunded') {
      await onOrderStatusRewardsHook(tx, {
        orderId,
        previousStatus: order.status,
        status: update.status,
      });
    }

    const fields: Partial<typeof orders.$inferInsert> = {
      status: update.status,
      updatedAt: new Date(),
    };
    if (update.trackingNumber !== undefined) fields.trackingNumber = update.trackingNumber;
    if (update.adminNotes !== undefined) fields.adminNotes = update.adminNotes;

    await tx.update(orders).set(fields).where(eq(orders.id, orderId));
    return { changed: true, previousStatus: order.status, status: update.status };
  });
}
