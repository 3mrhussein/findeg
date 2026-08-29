/**
 * Dashboard Order Server Actions
 *
 * Uses service factories to call backend order services.
 * Implements cache invalidation via updateTag().
 */

'use server';

import { revalidateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { getErrorMessage } from '@lib/type-guards';
import { requireDashboardPermission } from '@lib/require-dashboard-permission';

/**
 * Server Action: Update order status
 *
 * @param orderId - The order ID to update
 * @param input - The new order status and tracking info
 */
export async function updateOrderStatusAction(orderId: number, input: any) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_ORDERS_WRITE);
    const { orders } = createAdministrationServices();
    await orders.updateStatus(orderId, input);

    revalidateTag('orders', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[updateOrderStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Server Action: Update order payment status
 *
 * @param orderId - The order ID to update
 * @param paymentStatus - The new payment status
 */
export async function updateOrderPaymentStatusAction(orderId: number, paymentStatus: any) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_ORDERS_WRITE);
    const { orders } = createAdministrationServices();
    await orders.updatePaymentStatus(orderId, paymentStatus);

    revalidateTag('orders', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[updateOrderPaymentStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
