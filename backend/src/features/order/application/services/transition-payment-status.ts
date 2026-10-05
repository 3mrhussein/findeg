import { eq } from 'drizzle-orm';
import { db } from '@findeg/db/connection';
import { auditLog, orders } from '@findeg/db/schema';
import type { PaymentStatus } from '@findeg/backend/features/core/domain/types/common';
import { getAllowedPaymentStatusTransitions } from '../utils/order-payment-status-transitions';
import { OrderNotFoundError } from './transition-order-status';

export class InvalidPaymentStatusTransitionError extends Error {
  constructor(
    readonly from: PaymentStatus,
    readonly to: PaymentStatus,
    readonly allowedTargets: PaymentStatus[],
  ) {
    const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
    super(`Invalid payment status transition from ${from} to ${to}. Allowed: ${allowedList}.`);
    this.name = 'InvalidPaymentStatusTransitionError';
  }
}

export interface PaymentStatusTransitionResult {
  changed: boolean;
  previousStatus: PaymentStatus;
  status: PaymentStatus;
}

/**
 * Owns Order payment changes. Takes the Order row lock and writes the audit row in the same
 * transaction, so payment cannot race a status change.
 * `paid` means the full snapshotted Order total.
 */
export function transitionPaymentStatus(
  orderId: number,
  status: PaymentStatus,
  actor?: { userId?: number },
): Promise<PaymentStatusTransitionResult> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select({ paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.id, orderId))
      .for('update');

    if (!order) throw new OrderNotFoundError(orderId);
    if (order.paymentStatus === status) {
      return { changed: false, previousStatus: order.paymentStatus, status };
    }

    const allowedTargets = getAllowedPaymentStatusTransitions(order.paymentStatus);
    if (!allowedTargets.includes(status)) {
      throw new InvalidPaymentStatusTransitionError(order.paymentStatus, status, allowedTargets);
    }

    await tx
      .update(orders)
      .set({ paymentStatus: status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    await tx.insert(auditLog).values({
      adminUserId: actor?.userId,
      entityType: 'order',
      entityId: String(orderId),
      action: 'update_payment_status',
      oldValues: { paymentStatus: order.paymentStatus },
      newValues: { paymentStatus: status },
    });
    return { changed: true, previousStatus: order.paymentStatus, status };
  });
}
