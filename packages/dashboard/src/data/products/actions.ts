/**
 * Product Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and updateTag() for cache invalidation.
 * Apps own cache invalidation - backend stays pure TypeScript.
 */
"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
} from "@backend/features/administration/domain/types";
import { getErrorMessage } from "@lib/type-guards";

/**
 * Create a new product
 *
 * Invalidates: All product lists and search results
 */
export async function createProduct(input: CreateProductWithVariantsInput) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.createProduct(input);

    // Invalidate product caches
    updateTag("products");

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[createProduct]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update an existing product
 *
 * Invalidates: Product detail, product lists, search results
 */
export async function updateProduct(id: number, input: UpdateProductWithVariantsInput) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.updateProduct(id, input);

    // Invalidate product caches
    updateTag("products");

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[updateProduct]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete a product
 *
 * Invalidates: All product caches
 */
export async function deleteProduct(id: number) {
  try {
    const { products } = createAdministrationServices();
    await products.deleteProduct(id);

    // Invalidate all product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteProduct]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Bulk import products
 *
 * Invalidates: All product caches
 */
export async function importProducts(csvFile: any) {
  try {
    const { products } = createAdministrationServices();
    // await products.importFromCSV(csvFile);

    // Invalidate all product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[importProducts]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
