/**
 * Order Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and revalidateTag() for cache invalidation.
 * Apps own cache invalidation - backend stays pure TypeScript.
 */
'use server';

import { updateTag } from 'next/cache';
import { createOrders } from '@findeg/orders';
import { OrderStatusUpdateSchema, type OrderStatusUpdate } from '@findeg/orders/schemas';
import type { OrderStatus } from '@findeg/orders/schemas';
import { getErrorMessage } from '@lib/type-guards';
import { requireOrderWriteActor } from '@lib/order-write-access';

/**
 * Update order status
 *
 * Invalidates: Order detail and lists
 */
export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const actor = await requireOrderWriteActor();
    const orders = createOrders();
    const result = await orders.changeStatus(actor, id, input);

    updateTag('orders');
    updateTag('dashboard');

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateOrderStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Apply one lifecycle target to selected Orders. Every row goes through
 * Orders, preserving transition validation, stock effects and audit logs.
 */
export async function bulkUpdateOrderStatusAction(ids: number[], status: OrderStatus) {
  try {
    const actor = await requireOrderWriteActor();
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some((id) => !Number.isSafeInteger(id) || id <= 0)
    ) {
      return { success: false, error: 'At least one valid Order ID is required.' };
    }
    const update = OrderStatusUpdateSchema.parse({ status });
    const orders = createOrders();
    const settled = await Promise.allSettled(
      ids.map((id) => orders.changeStatus(actor, id, update)),
    );
    const failures = settled.flatMap((result, index) =>
      result.status === 'rejected'
        ? [{ orderId: ids[index], error: getErrorMessage(result.reason) }]
        : [],
    );

    updateTag('orders');
    updateTag('dashboard');
    return {
      success: failures.length === 0,
      updatedCount: ids.length - failures.length,
      failures,
      error:
        failures.length > 0
          ? failures.map(({ orderId, error }) => `Order #${orderId}: ${error}`).join('; ')
          : undefined,
    };
  } catch (error: unknown) {
    console.error('[bulkUpdateOrderStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update order payment status
 *
 * Invalidates: Order detail and lists
 */
export async function updateOrderPaymentStatusAction(
  id: number,
  paymentStatus: 'unpaid' | 'paid' | 'refunded',
) {
  try {
    const actor = await requireOrderWriteActor();
    const orders = createOrders();
    const result = await orders.changePaymentStatus(actor, id, paymentStatus);

    updateTag('orders');
    updateTag('dashboard');

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateOrderPaymentStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
