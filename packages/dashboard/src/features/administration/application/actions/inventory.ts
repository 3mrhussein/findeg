"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Admin Inventory Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend service factories.
 * Implements cache invalidation via updateTag().
 */

export async function updateStockAction(input: any) {
  try {
    const { inventory } = createAdministrationServices();
    await inventory.updateStock(input);

    updateTag("inventory");
    updateTag("products"); // Product stock affects product data
    return { success: true };
  } catch (error: any) {
    console.error("[updateStockAction]", error);
    return { success: false, error: error?.message || "Failed to update stock" };
  }
}

export async function bulkUpdateStockAction(updates: any[]) {
  try {
    const { inventory } = createAdministrationServices();
    await inventory.bulkUpdateStock(updates);

    updateTag("inventory");
    updateTag("products"); // Product stock affects product data
    return { success: true };
  } catch (error: any) {
    console.error("[bulkUpdateStockAction]", error);
    return { success: false, error: error?.message || "Failed to bulk update stock" };
  }
}
