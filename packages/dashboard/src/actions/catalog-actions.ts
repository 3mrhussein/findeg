/**
 * Dashboard Catalog Server Actions
 *
 * Wraps backend catalog services with Next.js framework integration:
 * - Handles cache invalidation via updateTag()
 * - Translates domain errors to appropriate responses
 */

"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Server Action: Create new product
 */
export async function createProductAction(input: any) {
  try {
    const { products } = createAdministrationServices();
    const result = await products.createProduct(input);

    updateTag("products");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createProductAction]", error);
    return { success: false, error: error?.message || "Failed to create product" };
  }
}

/**
 * Server Action: Delete product
 */
export async function deleteProductAction(id: number) {
  try {
    const { products } = createAdministrationServices();
    await products.deleteProduct(id);

    updateTag("products");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteProductAction]", error);
    return { success: false, error: error?.message || "Failed to delete product" };
  }
}

/**
 * Server Action: Create new brand
 */
export async function createBrandAction(input: any) {
  try {
    const { brands } = createAdministrationServices();
    const result = await brands.create(input);

    updateTag("brands-admin");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createBrandAction]", error);
    return { success: false, error: error?.message || "Failed to create brand" };
  }
}

/**
 * Server Action: Update existing brand
 */
export async function updateBrandAction(id: number, input: any) {
  try {
    const { brands } = createAdministrationServices();
    const result = await brands.update(id, input);

    updateTag("brands-admin");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateBrandAction]", error);
    return { success: false, error: error?.message || "Failed to update brand" };
  }
}

/**
 * Server Action: Delete brand
 */
export async function deleteBrandAction(id: number) {
  try {
    const { brands } = createAdministrationServices();
    await brands.delete(id);

    updateTag("brands-admin");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteBrandAction]", error);
    return { success: false, error: error?.message || "Failed to delete brand" };
  }
}

/**
 * Server Action: Toggle brand active status
 */
export async function toggleBrandStatusAction(id: number) {
  try {
    const { brands } = createAdministrationServices();
    const result = await brands.toggleBrandStatus(id);

    updateTag("brands-admin");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[toggleBrandStatusAction]", error);
    return { success: false, error: error?.message || "Failed to toggle brand status" };
  }
}

/**
 * Server Action: Create new category
 */
export async function createCategoryAction(input: any) {
  try {
    const { categories } = createAdministrationServices();
    const result = await categories.create(input);

    updateTag("categories-admin");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createCategoryAction]", error);
    return { success: false, error: error?.message || "Failed to create category" };
  }
}

/**
 * Server Action: Update existing category
 */
export async function updateCategoryAction(id: number, input: any) {
  try {
    const { categories } = createAdministrationServices();
    const result = await categories.update(id, input);

    updateTag("categories-admin");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateCategoryAction]", error);
    return { success: false, error: error?.message || "Failed to update category" };
  }
}

/**
 * Server Action: Delete category
 */
export async function deleteCategoryAction(id: number) {
  try {
    const { categories } = createAdministrationServices();
    await categories.delete(id);

    updateTag("categories-admin");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteCategoryAction]", error);
    return { success: false, error: error?.message || "Failed to delete category" };
  }
}

/**
 * Server Action: Move category up
 */
export async function moveCategoryUpAction(id: number) {
  try {
    const { categories } = createAdministrationServices();
    await categories.moveCategoryUp(id);

    updateTag("categories-admin");
    return { success: true };
  } catch (error: any) {
    console.error("[moveCategoryUpAction]", error);
    return { success: false, error: error?.message || "Failed to move category up" };
  }
}

/**
 * Server Action: Move category down
 */
export async function moveCategoryDownAction(id: number) {
  try {
    const { categories } = createAdministrationServices();
    await categories.moveCategoryDown(id);

    updateTag("categories-admin");
    return { success: true };
  } catch (error: any) {
    console.error("[moveCategoryDownAction]", error);
    return { success: false, error: error?.message || "Failed to move category down" };
  }
}

/**
 * Server Action: Reorder categories
 */
export async function reorderCategoriesAction(items: { id: number; sortOrder: number }[]) {
  try {
    const { categories } = createAdministrationServices();
    await categories.reorderCategories(items);

    updateTag("categories-admin");
    return { success: true };
  } catch (error: any) {
    console.error("[reorderCategoriesAction]", error);
    return { success: false, error: error?.message || "Failed to reorder categories" };
  }
}

/**
 * Server Action: Check if category slug is available
 */
export async function checkCategorySlugAvailableAction(slug: string, excludeId?: number) {
  try {
    const { categories } = createAdministrationServices();
    const available = await categories.checkSlugAvailable(slug, excludeId);

    return { success: true, available };
  } catch (error: any) {
    console.error("[checkCategorySlugAvailableAction]", error);
    return { success: false, error: error?.message || "Failed to check slug availability" };
  }
}
