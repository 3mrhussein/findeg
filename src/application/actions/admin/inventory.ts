"use server";

import { getServices } from "@/server/getServices";
import { AdminInventoryUpdate } from "@/domain/types/admin";
import { revalidatePath } from "next/cache";

/**
 *
 */
export async function updateStockAction(update: AdminInventoryUpdate) {
  const { adminInventory } = getServices();

  try {
    await adminInventory.updateStock(update);
    revalidatePath("/admin/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to update stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

/**
 *
 */
export async function bulkUpdateStockAction(updates: AdminInventoryUpdate[]) {
  const { adminInventory } = getServices();

  try {
    await adminInventory.bulkUpdateStock(updates);
    revalidatePath("/admin/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk update stock:", error);
    return { success: false, error: "Failed to bulk update stock" };
  }
}
