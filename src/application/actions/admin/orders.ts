"use server";

import { getServices } from "@/server/getServices";
import { AdminOrderStatusUpdate } from "@/domain/types/admin";
import { revalidatePath } from "next/cache";

/**
 *
 */
export async function updateOrderStatusAction(id: number, update: AdminOrderStatusUpdate) {
  const { adminOrder } = getServices();

  try {
    await adminOrder.updateStatus(id, update);
    revalidatePath("/admin/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}
