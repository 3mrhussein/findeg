/**
 * Order Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and updateTag() for cache invalidation.
 * Apps own cache invalidation - backend stays pure TypeScript.
 */
"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";
import type { OrderStatusUpdate } from "@backend/features/administration/domain/types";

/**
 * Update order status
 *
 * Invalidates: Order detail and lists
 */
export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const { orders } = createAdministrationServices();
    const result = await orders.updateStatus(id, input);

    updateTag("orders");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateOrderStatusAction]", error);
    return { success: false, error: error?.message || "Failed to update order status" };
  }
}

/**
 * Update order payment status
 *
 * Invalidates: Order detail and lists
 */
export async function updateOrderPaymentStatusAction(
  id: number,
  paymentStatus: "unpaid" | "paid" | "refunded",
) {
  try {
    const { orders } = createAdministrationServices();
    const result = await orders.updatePaymentStatus(id, paymentStatus);

    updateTag("orders");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateOrderPaymentStatusAction]", error);
    return { success: false, error: error?.message || "Failed to update payment status" };
  }
}
