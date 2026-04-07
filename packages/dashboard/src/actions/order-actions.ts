/**
 * Dashboard Order Server Actions
 *
 * Uses service factories to call backend order services.
 * Implements cache invalidation via updateTag().
 */

"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Server Action: Update order status
 *
 * @param orderId - The order ID to update
 * @param input - The new order status and tracking info
 */
export async function updateOrderStatusAction(orderId: number, input: any) {
  try {
    const { orders } = createAdministrationServices();
    await orders.updateStatus(orderId, input);

    updateTag("orders");
    return { success: true };
  } catch (error: any) {
    console.error("[updateOrderStatusAction]", error);
    return { success: false, error: error?.message || "Failed to update order status" };
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
    const { orders } = createAdministrationServices();
    await orders.updatePaymentStatus(orderId, paymentStatus);

    updateTag("orders");
    return { success: true };
  } catch (error: any) {
    console.error("[updateOrderPaymentStatusAction]", error);
    return { success: false, error: error?.message || "Failed to update payment status" };
  }
}
