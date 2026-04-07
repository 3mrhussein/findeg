/**
 * Product Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and updateTag() for cache invalidation.
 * Apps own cache invalidation - backend stays pure TypeScript.
 */
"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Create a new product
 *
 * Invalidates: All product lists and search results
 */
export async function createProduct(input: any) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.createProduct(input);

    // Invalidate product caches
    updateTag("products");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createProduct]", error);
    return { success: false, error: error?.message || "Failed to create product" };
  }
}

/**
 * Update an existing product
 *
 * Invalidates: Product detail, product lists, search results
 */
export async function updateProduct(id: number, input: any) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.updateProduct(id, input);

    // Invalidate product caches
    updateTag("products");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateProduct]", error);
    return { success: false, error: error?.message || "Failed to update product" };
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
  } catch (error: any) {
    console.error("[deleteProduct]", error);
    return { success: false, error: error?.message || "Failed to delete product" };
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
  } catch (error: any) {
    console.error("[importProducts]", error);
    return { success: false, error: error?.message || "Failed to import products" };
  }
}
