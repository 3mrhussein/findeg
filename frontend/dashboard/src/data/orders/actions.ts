/**
 * Order Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and revalidateTag() for cache invalidation.
 * Apps own cache invalidation - backend stays pure TypeScript.
 */
'use server';

import { revalidateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import type { OrderStatusUpdate } from '@findeg/backend/features/administration/domain/types';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Update order status
 *
 * Invalidates: Order detail and lists
 */
export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const { orders } = createAdministrationServices();
    const result = await orders.updateStatus(id, input);

    revalidateTag('orders', 'max');

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateOrderStatusAction]', error);
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
    const { orders } = createAdministrationServices();
    const result = await orders.updatePaymentStatus(id, paymentStatus);

    revalidateTag('orders', 'max');

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateOrderPaymentStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
