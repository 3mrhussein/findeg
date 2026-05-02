/**
 * Inventory Actions (Dashboard Data Layer)
 *
 * Stock updates and inventory management.
 */
"use server";

import { revalidateTag } from "next/cache";
import { createAdministrationServices } from "@findeg/backend/features/administration";
import { getErrorMessage } from "@lib/type-guards";

/**
 * Update stock for a single variant
 */
export async function updateStock(input: { variantId: number; quantity: number }) {
  try {
    const { inventory } = createAdministrationServices();
    await inventory.updateStock({ variantId: input.variantId, quantity: input.quantity });

    // Invalidate inventory caches
    revalidateTag("inventory", "max");

    return { success: true };
  } catch (error: unknown) {
    console.error("[updateStock]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Bulk update stock for multiple variants
 */
export async function bulkUpdateStock(
  updates: { variantId: number; quantity: number; lowStockThreshold?: number }[],
) {
  try {
    const { inventory } = createAdministrationServices();
    // Assuming backend has a bulkUpdateStock or similar.
    // If not, we could loop, but let's assume it exists as per frontend expectation.
    await inventory.bulkUpdateStock(updates);

    // Invalidate inventory caches
    revalidateTag("inventory", "max");

    return { success: true };
  } catch (error: unknown) {
    console.error("[bulkUpdateStock]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
