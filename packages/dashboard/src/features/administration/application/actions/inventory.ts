"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";
import type { InventoryUpdate } from "@backend/features/administration/domain/types";
import { getErrorMessage } from "@lib/type-guards";

/**
 * Admin Inventory Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend service factories.
 * Implements cache invalidation via updateTag().
 */

export async function updateStockAction(input: InventoryUpdate) {
  try {
    const { inventory } = createAdministrationServices();
    await inventory.updateStock(input);

    updateTag("inventory");
    updateTag("products"); // Product stock affects product data
    return { success: true };
  } catch (error: unknown) {
    console.error("[updateStockAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkUpdateStockAction(updates: InventoryUpdate[]) {
  try {
    const { inventory } = createAdministrationServices();
    await inventory.bulkUpdateStock(updates);

    updateTag("inventory");
    updateTag("products"); // Product stock affects product data
    return { success: true };
  } catch (error: unknown) {
    console.error("[bulkUpdateStockAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
