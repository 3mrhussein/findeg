"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { ProductInput } from "@/features/administration/domain/types";

/**
 * Creates a new product.
 *
 * @param input - The product creation data payload.
 * @returns Success status or error message.
 */
export async function createProductAction(input: ProductInput) {
  try {
    const service = container.adminProductService;
    await service.create(input);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Updates an existing product.
 *
 * @param id - The ID of the product to update.
 * @param input - The updated product fields.
 * @returns Success status or error message.
 */
export async function updateProductAction(id: number, input: ProductInput) {
  try {
    const service = container.adminProductService;
    await service.update(id, input);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a product by its ID.
 *
 * @param id - The product ID.
 * @returns Success status or error message.
 */
export async function deleteProductAction(id: number) {
  try {
    const service = container.adminProductService;
    await service.delete(id);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
