"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { OrderStatusUpdate } from "@/features/administration/domain/types";

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
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
