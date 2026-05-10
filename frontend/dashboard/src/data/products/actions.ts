/**
 * Product Actions (Dashboard Data Layer)
 *
 * Apps own cache invalidation - backend stays pure TypeScript.
 */
'use server';

import { revalidateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
} from '@findeg/backend/features/administration/domain/types';
import { getErrorMessage } from '@lib/type-guards';

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
    revalidateTag('products', 'max');

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createProduct]', error);
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

    revalidateTag('products', 'max');

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateProduct]', error);
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

    revalidateTag('products', 'max');

    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteProduct]', error);
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

    revalidateTag('products', 'max');

    return { success: true };
  } catch (error: unknown) {
    console.error('[importProducts]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Toggle product active status
 */
export async function setProductStatus(id: number, isActive: boolean) {
  try {
    const { products } = createAdministrationServices();
    const existingProduct = await products.getById(id);
    if (!existingProduct) return { success: false, error: 'Product not found' };

    await products.updateProduct(id, { ...existingProduct, isActive } as any);
    revalidateTag('products', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[setProductStatus]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Generate variants for a product
 */
export async function generateVariants(
  productId: number,
  dimensions: any[] = [],
  defaults: any = {},
) {
  try {
    const { products } = createAdministrationServices();
    await products.generateVariants(productId, dimensions, defaults);
    revalidateTag('products', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[generateVariants]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Utility checks for availability
 */
export async function checkSkuAvailable(sku: string, excludeVariantId?: number) {
  try {
    const { products } = createAdministrationServices();
    const available = await products.checkSkuAvailable(sku, excludeVariantId);
    return { success: true, available };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function checkSlugAvailable(slug: string, excludeProductId?: number) {
  try {
    const { products } = createAdministrationServices();
    const available = await products.checkSlugAvailable(slug, excludeProductId);
    return { success: true, available };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
