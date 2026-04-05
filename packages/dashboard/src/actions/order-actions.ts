/**
 * Dashboard Order Server Actions
 *
 * Wraps pure backend order actions with Next.js framework integration:
 * - Handles revalidatePath() calls based on result
 * - Translates domain errors to appropriate responses
 *
 * This layer ensures framework logic stays in the app, business logic stays in backend.
 */

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { updateOrderStatus, updateOrderPaymentStatus } from "@findeg/backend/features/order";
import { OrderStatusUpdate } from "@findeg/backend/features/administration";
import { isDomainError, getErrorMessage } from "@/lib/errors";
import { invalidateCaches } from "@/lib/cache";
import { PaymentStatus } from "@findeg/backend";

/**
 * Server Action: Update order status
 *
 * @param orderId - The order ID to update
 * @param input - The new order status and tracking info
 */
export async function updateOrderStatusAction(orderId: number, input: OrderStatusUpdate) {
  try {
    const result = await updateOrderStatus(orderId, input);

    // Execute cache revalidation
    await invalidateCaches(result);

    return { success: true };
  } catch (error) {
    // Domain errors are expected (validation, not found, etc.)
    if (isDomainError(error)) {
      const message = getErrorMessage(error);
      return { success: false, error: message };
    }

    // Unexpected errors
    console.error("[dashboard] Order status update error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Server Action: Update order payment status
 *
 * @param orderId - The order ID to update
 * @param paymentStatus - The new payment status
 */
export async function updateOrderPaymentStatusAction(
  orderId: number,
  paymentStatus: PaymentStatus,
) {
  try {
    const result = await updateOrderPaymentStatus(orderId, paymentStatus);

    // Execute cache revalidation
    await invalidateCaches(result);

    return { success: true };
  } catch (error) {
    // Domain errors are expected
    if (isDomainError(error)) {
      const message = getErrorMessage(error);
      return { success: false, error: message };
    }

    // Unexpected errors
    console.error("[dashboard] Order payment status update error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
