"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Admin Product Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend service factories.
 * Implements cache invalidation via updateTag() for immediate consistency.
 */

export async function createProductAction(input: any) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.createProduct(input);

    // Invalidate product caches immediately
    updateTag("products");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createProductAction]", error);
    return { success: false, error: error?.message || "Failed to create product" };
  }
}

export async function updateProductAction(id: number, input: any) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.updateProduct(id, input);

    // Invalidate product caches immediately
    updateTag("products");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateProductAction]", error);
    return { success: false, error: error?.message || "Failed to update product" };
  }
}

export async function deleteProductAction(id: number) {
  try {
    const { products } = createAdministrationServices();
    await products.deleteProduct(id);

    // Invalidate all product caches
    updateTag("products");

    return { success: true };
  } catch (error: any) {
    console.error("[deleteProductAction]", error);
    return { success: false, error: error?.message || "Failed to delete product" };
  }
}

export async function setProductStatusAction(id: number, isActive: boolean) {
  try {
    const { products } = createAdministrationServices();
    // AdminProductService doesn't have setProductStatus, use update instead
    const existingProduct = await products.getById(id);
    if (!existingProduct) {
      return { success: false, error: "Product not found" };
    }

    await products.updateProduct(id, { ...existingProduct, isActive } as any);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: any) {
    console.error("[setProductStatusAction]", error);
    return { success: false, error: error?.message || "Failed to update product status" };
  }
}

export async function deactivateVariantAction(variantId: number) {
  try {
    const { products } = createAdministrationServices();
    await products.deactivateVariant(variantId);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: any) {
    console.error("[deactivateVariantAction]", error);
    return { success: false, error: error?.message || "Failed to deactivate variant" };
  }
}

export async function generateVariantsAction(productId: number) {
  try {
    const { products } = createAdministrationServices();
    await products.generateVariants(productId);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: any) {
    console.error("[generateVariantsAction]", error);
    return { success: false, error: error?.message || "Failed to generate variants" };
  }
}

export async function rebuildVariantKeysAction(productId: number) {
  try {
    const { products } = createAdministrationServices();
    await products.rebuildVariantKeys(productId);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: any) {
    console.error("[rebuildVariantKeysAction]", error);
    return { success: false, error: error?.message || "Failed to rebuild variant keys" };
  }
}

export async function upsertVariantUoMsAction(variantId: number, uoms: any[]) {
  try {
    const { products } = createAdministrationServices();
    await products.upsertVariantUoMs(variantId, uoms);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: any) {
    console.error("[upsertVariantUoMsAction]", error);
    return { success: false, error: error?.message || "Failed to update variant UoMs" };
  }
}

export async function upsertVariantImagesAction(variantId: number, images: any[]) {
  try {
    const { products } = createAdministrationServices();
    await products.upsertVariantImages(variantId, images);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: any) {
    console.error("[upsertVariantImagesAction]", error);
    return { success: false, error: error?.message || "Failed to update variant images" };
  }
}

export async function adminValidateProductImportAction(data: any) {
  // TODO: Implement product import validation when needed
  return { success: false, error: "Product import validation not yet implemented" };
}

export async function adminProcessProductImportAction(data: any) {
  // TODO: Implement product import processing when needed
  return { success: false, error: "Product import processing not yet implemented" };
}

export async function checkSkuAction(sku: string, excludeVariantId?: number) {
  try {
    const { products } = createAdministrationServices();
    const available = await products.checkSkuAvailable(sku, excludeVariantId);

    return { success: true, available };
  } catch (error: any) {
    console.error("[checkSkuAction]", error);
    return { success: false, error: error?.message || "Failed to check SKU availability" };
  }
}

export async function checkSlugAction(slug: string, excludeProductId?: number) {
  try {
    const { products } = createAdministrationServices();
    const available = await products.checkSlugAvailable(slug, excludeProductId);

    return { success: true, available };
  } catch (error: any) {
    console.error("[checkSlugAction]", error);
    return { success: false, error: error?.message || "Failed to check slug availability" };
  }
}

export async function checkSkuPrefixAction(prefix: string, excludeProductId?: number) {
  try {
    const { products } = createAdministrationServices();
    const available = await products.checkSkuPrefixAvailable(prefix, excludeProductId);

    return { success: true, available };
  } catch (error: any) {
    console.error("[checkSkuPrefixAction]", error);
    return { success: false, error: error?.message || "Failed to check SKU prefix availability" };
  }
}
