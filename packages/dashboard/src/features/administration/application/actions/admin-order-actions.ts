"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { isSystemAdmin } from "@/features/core/domain/auth/authorization";
import { updateOrderStatus, updateOrderPaymentStatus } from "@findeg/backend/features/order";
import { OrderStatusUpdate } from "@findeg/backend/features/administration";
import { isDomainError, getErrorMessage } from "@/lib/errors";
import { invalidateCaches } from "@/lib/cache";
import { PaymentStatus } from "@findeg/backend";

/**
 * Updates the logistical status of an order from the admin panel.
 * Uses the current session user ID for audit logging.
 *
 * Refactored to use pure backend functions and app-layer cache invalidation.
 *
 * @param id - The order ID to update.
 * @param update - The status update payload (status, tracking, notes).
 * @returns Success status or error message.
 */
export async function adminUpdateOrderStatusAction(id: number | string, update: OrderStatusUpdate) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) ||
      session.activeRoleIds?.includes("operations_manager") ||
      session.activeRoleIds?.includes("super_admin");

    if (!isAuthorized) throw new Error("Forbidden: requires Operations or Super Admin role");

    const orderId = Number(id);
    const result = await updateOrderStatus(orderId, update);

    // Execute cache revalidation
    await invalidateCaches(result);

    return { success: true };
  } catch (error: any) {
    if (isDomainError(error)) {
      const message = getErrorMessage(error);
      return { success: false, error: message };
    }

    console.error("[dashboard] Admin order status update error:", error);
    return {
      success: false,
      error: error?.message || "Failed to update order status",
    };
  }
}

/**
 * Updates the payment status of an order from the admin panel.
 * Uses the current session user ID for audit logging.
 *
 * Refactored to use pure backend functions and app-layer cache invalidation.
 *
 * @param id - The order ID to update.
 * @param status - The new payment status.
 * @returns Success status or error message.
 */
export async function adminUpdateOrderPaymentStatusAction(
  id: number | string,
  status: PaymentStatus,
) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) ||
      session.activeRoleIds?.includes("operations_manager") ||
      session.activeRoleIds?.includes("super_admin");

    if (!isAuthorized) throw new Error("Forbidden: requires Operations or Super Admin role");

    const orderId = Number(id);
    const result = await updateOrderPaymentStatus(orderId, status);

    // Execute cache revalidation
    await invalidateCaches(result);

    return { success: true };
  } catch (error: any) {
    if (isDomainError(error)) {
      const message = getErrorMessage(error);
      return { success: false, error: message };
    }

    console.error("[dashboard] Admin order payment status update error:", error);
    return {
      success: false,
      error: error?.message || "Failed to update payment status",
    };
  }
}
