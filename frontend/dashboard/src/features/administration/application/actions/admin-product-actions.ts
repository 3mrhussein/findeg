"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@findeg/backend/features/administration";
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
  CreateVariantInput,
  UoMInput,
  ImageInput,
} from "@findeg/backend/features/administration/domain/types";
import { getErrorMessage } from "@lib/type-guards";

/**
 * Admin Product Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend service factories.
 * Implements cache invalidation via updateTag() for immediate consistency.
 */

export async function createProductAction(input: CreateProductWithVariantsInput) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.createProduct(input);

    // Invalidate product caches immediately
    updateTag("products");

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[createProductAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProductAction(id: number, input: UpdateProductWithVariantsInput) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.updateProduct(id, input);

    // Invalidate product caches immediately
    updateTag("products");

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[updateProductAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteProductAction(id: number) {
  try {
    const { products } = createAdministrationServices();
    await products.deleteProduct(id);

    // Invalidate all product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteProductAction]", error);
    return { success: false, error: getErrorMessage(error) };
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

    await products.updateProduct(id, {
      ...existingProduct,
      isActive,
    } as UpdateProductWithVariantsInput);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[setProductStatusAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deactivateVariantAction(variantId: number) {
  try {
    const { products } = createAdministrationServices();
    await products.deactivateVariant(variantId);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[deactivateVariantAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function generateVariantsAction(
  productId: number,
  dimensions: any[] = [],
  defaults: Partial<CreateVariantInput> = {},
) {
  try {
    const { products } = createAdministrationServices();
    await products.generateVariants(productId, dimensions, defaults);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[generateVariantsAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function rebuildVariantKeysAction(productId: number) {
  try {
    const { products } = createAdministrationServices();
    await products.rebuildVariantKeys(productId);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[rebuildVariantKeysAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function upsertVariantUoMsAction(variantId: number, uoms: UoMInput[]) {
  try {
    const { products } = createAdministrationServices();
    await products.upsertVariantUoMs(variantId, uoms);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[upsertVariantUoMsAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function upsertVariantImagesAction(variantId: number, images: ImageInput[]) {
  try {
    const { products } = createAdministrationServices();
    await products.upsertVariantImages(variantId, images);

    // Invalidate product caches
    updateTag("products");

    return { success: true };
  } catch (error: unknown) {
    console.error("[upsertVariantImagesAction]", error);
    return { success: false, error: getErrorMessage(error) };
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
  } catch (error: unknown) {
    console.error("[checkSkuAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function checkSlugAction(slug: string, excludeProductId?: number) {
  try {
    const { products } = createAdministrationServices();
    const available = await products.checkSlugAvailable(slug, excludeProductId);

    return { success: true, available };
  } catch (error: unknown) {
    console.error("[checkSlugAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function checkSkuPrefixAction(prefix: string, excludeProductId?: number) {
  try {
    const { products } = createAdministrationServices();
    const available = await products.checkSkuPrefixAvailable(prefix, excludeProductId);

    return { success: true, available };
  } catch (error: unknown) {
    console.error("[checkSkuPrefixAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
