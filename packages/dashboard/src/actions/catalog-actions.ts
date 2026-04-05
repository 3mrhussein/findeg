/**
 * Dashboard Catalog Server Actions
 *
 * Wraps pure backend catalog services with Next.js framework integration:
 * - Handles revalidatePath() for cache management
 * - Translates domain errors to appropriate responses
 * - Executes cache invalidation based on operation results
 *
 * This layer ensures framework logic stays in the app, business logic stays in backend.
 */

"use server";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategoryUp,
  moveCategoryDown,
  reorderCategories,
  checkSlugAvailable,
} from "@findeg/backend/features/catalog";
import type {
  ProductInput,
  BrandInput,
  CategoryInput,
} from "@findeg/backend/features/administration";
import { isDomainError, getErrorMessage } from "@/lib/errors";
import { invalidateCaches } from "@/lib/cache";

/**
 * Server Action: Create new product
 *
 * @param input - Product creation data
 */
export async function createProductAction(input: ProductInput) {
  try {
    const result = await createProduct(input);
    await invalidateCaches(result);
    return { success: true, productId: result.data!.productId };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] createProductAction error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

/**
 * Server Action: Update existing product
 *
 * @param id - Product ID
 * @param input - Product update data
 */
export async function updateProductAction(id: number, input: ProductInput) {
  try {
    const result = await updateProduct(id, input);
    await invalidateCaches(result);
    return { success: true, productId: result.data!.productId };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] updateProductAction error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

/**
 * Server Action: Delete product
 *
 * @param id - Product ID
 */
export async function deleteProductAction(id: number) {
  try {
    const result = await deleteProduct(id);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] deleteProductAction error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

/**
 * Server Action: Create new brand
 *
 * @param input - Brand creation data
 */
export async function createBrandAction(input: BrandInput) {
  try {
    const result = await createBrand(input);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] createBrandAction error:", error);
    return { success: false, error: "Failed to create brand" };
  }
}

/**
 * Server Action: Update existing brand
 *
 * @param id - Brand ID
 * @param input - Brand update data
 */
export async function updateBrandAction(id: number, input: BrandInput) {
  try {
    const result = await updateBrand(id, input);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] updateBrandAction error:", error);
    return { success: false, error: "Failed to update brand" };
  }
}

/**
 * Server Action: Delete brand
 *
 * @param id - Brand ID
 */
export async function deleteBrandAction(id: number) {
  try {
    const result = await deleteBrand(id);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] deleteBrandAction error:", error);
    return { success: false, error: "Failed to delete brand" };
  }
}

/**
 * Server Action: Toggle brand active status
 *
 * @param id - Brand ID
 */
export async function toggleBrandStatusAction(id: number) {
  try {
    const result = await toggleBrandStatus(id);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] toggleBrandStatusAction error:", error);
    return { success: false, error: "Failed to toggle brand status" };
  }
}

/**
 * Server Action: Create new category
 *
 * @param input - Category creation data
 */
export async function createCategoryAction(input: CategoryInput) {
  try {
    const result = await createCategory(input);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] createCategoryAction error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

/**
 * Server Action: Update existing category
 *
 * @param id - Category ID
 * @param input - Category update data
 */
export async function updateCategoryAction(id: number, input: CategoryInput) {
  try {
    const result = await updateCategory(id, input);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] updateCategoryAction error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

/**
 * Server Action: Delete category
 *
 * @param id - Category ID
 */
export async function deleteCategoryAction(id: number) {
  try {
    const result = await deleteCategory(id);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] deleteCategoryAction error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

/**
 * Server Action: Move category up
 *
 * @param id - Category ID
 */
export async function moveCategoryUpAction(id: number) {
  try {
    const result = await moveCategoryUp(id);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] moveCategoryUpAction error:", error);
    return { success: false, error: "Failed to move category" };
  }
}

/**
 * Server Action: Move category down
 *
 * @param id - Category ID
 */
export async function moveCategoryDownAction(id: number) {
  try {
    const result = await moveCategoryDown(id);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] moveCategoryDownAction error:", error);
    return { success: false, error: "Failed to move category" };
  }
}

/**
 * Server Action: Reorder categories
 *
 * @param items - Array of category IDs with sort order
 */
export async function reorderCategoriesAction(items: { id: number; sortOrder: number }[]) {
  try {
    const result = await reorderCategories(items);
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] reorderCategoriesAction error:", error);
    return { success: false, error: "Failed to reorder categories" };
  }
}

/**
 * Server Action: Check if category slug is available
 *
 * @param slug - Slug to check
 * @param excludeId - Optional ID to exclude (current category ID)
 */
export async function checkCategorySlugAvailableAction(slug: string, excludeId?: number) {
  try {
    const result = await checkSlugAvailable(slug, excludeId);
    return { success: true, available: result.data!.available };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error("[dashboard] checkCategorySlugAvailableAction error:", error);
    return { success: false, error: "Failed to check slug availability" };
  }
}
