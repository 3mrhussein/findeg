"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { InventoryUpdate } from "@/features/administration/domain/types";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import { resolveErrorMessage } from "@/features/core/domain/errors";

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
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
  }
}
