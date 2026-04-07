/**
 * Category Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and updateTag() for cache invalidation.
 * Wraps admin service factory calls with proper error handling.
 */
"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Create a new category
 *
 * @param input - Category data (name, slug, parentId, etc.)
 * @returns Success/error result
 */
export async function createCategoryAction(input: any) {
  try {
    const { categories } = createAdministrationServices();
    const result = await categories.create(input);

    // Invalidate all category caches
    updateTag("categories");
    revalidatePath("/admin/categories");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createCategoryAction] Error:", error);
    return { success: false, error: error?.message || "Failed to create category" };
  }
}

/**
 * Update an existing category
 *
 * @param id - Category ID
 * @param input - Updated category data
 * @returns Success/error result
 */
export async function updateCategoryAction(id: number, input: any) {
  try {
    const { categories } = createAdministrationServices();
    const result = await categories.update(id, input);

    // Invalidate category detail and lists
    updateTag("categories");
    updateTag(`category-${id}`);
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateCategoryAction] Error:", error);
    return { success: false, error: error?.message || "Failed to update category" };
  }
}

/**
 * Delete a category
 *
 * @param id - Category ID to delete
 * @returns Success/error result
 */
export async function deleteCategoryAction(id: number) {
  try {
    const { categories } = createAdministrationServices();
    await categories.delete(id);

    // Invalidate all category caches
    updateTag("categories");
    updateTag(`category-${id}`);
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error: any) {
    console.error("[deleteCategoryAction] Error:", error);
    return { success: false, error: error?.message || "Failed to delete category" };
  }
}

/**
 * Reorder categories (bulk sort order update)
 *
 * @param items - Array of {id, sortOrder} pairs
 * @returns Success/error result
 */
export async function reorderCategoriesAction(items: { id: number; sortOrder: number }[]) {
  try {
    const { categories } = createAdministrationServices();
    await categories.reorderCategories(items);

    // Invalidate all category caches
    updateTag("categories");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error: any) {
    console.error("[reorderCategoriesAction] Error:", error);
    return { success: false, error: error?.message || "Failed to reorder categories" };
  }
}
