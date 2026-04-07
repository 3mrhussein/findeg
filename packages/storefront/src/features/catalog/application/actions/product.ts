"use server";

import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { ProductInput } from "@features/administration/domain/types";
import { resolveErrorMessage } from "@features/core/domain/errors/error-catalog";
import { CACHE_TAGS } from "@features/core/domain/constants/cache-tags";

/**
 * Creates a new product.
 *
 * @param input - The product creation data payload.
 * @returns Success status or error message.
 */
export async function createProductAction(input: ProductInput) {
  try {
    const service = container.adminProductService;
    const product = await service.create(input);
    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true, productId: product.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_CREATE_FAILED"),
    };
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
    const product = await service.update(id, input);
    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true, productId: product.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
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
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_DELETE_FAILED"),
    };
  }
}
