"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { InventoryUpdate } from "@/features/administration/domain/types";

/**
 * Updates the stock level for a specific product.
 *
 * @param input - The inventory update payload containing product ID and new quantity.
 * @returns Object indicating success or failure with error message.
 */
export async function updateStockAction(input: InventoryUpdate) {
  try {
    const service = container.adminInventoryService;
    await service.updateStock(input);
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
