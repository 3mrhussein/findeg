"use server";

import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { OrderStatusUpdate } from "@features/administration/domain/types";
import { resolveErrorMessage } from "@features/core/domain/errors/error-catalog";
import { PaymentStatus } from "@features/core/domain/types/common";

/**
 * Updates the status of a specific order and triggers necessary side effects (e.g., emails).
 *
 * @param id - The ID of the order to update.
 * @param input - The new status and optional tracking information.
 * @returns Object indicating success or failure with error message.
 */
export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const service = container.adminOrderService;
    await service.updateStatus(id, input);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_ORDER_STATUS_UPDATE_FAILED"),
    };
  }
}

/**
 * Updates payment status for a specific order.
 */
export async function updateOrderPaymentStatusAction(id: number, paymentStatus: PaymentStatus) {
  try {
    const service = container.adminOrderService;
    await service.updatePaymentStatus(id, paymentStatus);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_ORDER_PAYMENT_STATUS_UPDATE_FAILED"),
    };
  }
}
