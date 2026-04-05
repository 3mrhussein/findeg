"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { resolveErrorMessage } from "@/features/core/domain/errors/error-catalog";
import { isSystemAdmin } from "@/features/core/domain/auth/authorization";
import { OrderStatusUpdate } from "@/features/administration/domain/types";
import { PaymentStatus } from "@/features/core/domain/types/common";

/**
 * Updates the logistical status of an order from the admin panel.
 * Uses the current session user ID for audit logging.
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

    const service = container.adminOrderService;
    await service.updateStatus(Number(id), update);

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR"),
    };
  }
}

/**
 * Updates the payment status of an order from the admin panel.
 * Uses the current session user ID for audit logging.
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

    const service = container.adminOrderService;
    await service.updatePaymentStatus(Number(id), status);

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR"),
    };
  }
}
