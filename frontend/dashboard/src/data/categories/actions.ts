/**
 * Category Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and updateTag() for cache invalidation.
 * Wraps admin service factory calls with proper error handling.
 */
"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createAdministrationServices } from "@findeg/backend/features/administration";
import type { CategoryInput } from "@findeg/backend/features/administration/domain/types";
import { getErrorMessage } from "@lib/type-guards";

/**
 * Create a new category
 *
 * @param input - Category data (name, slug, parentId, etc.)
 * @returns Success/error result
 */
export async function createCategoryAction(input: CategoryInput) {
  try {
    const { categories } = createAdministrationServices();
    const result = await categories.create(input);

    // Invalidate all category caches
    updateTag("categories");
    revalidatePath("/categories");

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[createCategoryAction] Error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update an existing category
 *
 * @param id - Category ID
 * @param input - Updated category data
 * @returns Success/error result
 */
export async function updateCategoryAction(id: number, input: CategoryInput) {
  try {
    const { categories } = createAdministrationServices();
    const result = await categories.update(id, input);

    // Invalidate category detail and lists
    updateTag("categories");
    updateTag(`category-${id}`);
    revalidatePath("/categories");
    revalidatePath(`/categories/${id}`);

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[updateCategoryAction] Error:", error);
    return { success: false, error: getErrorMessage(error) };
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
    revalidatePath("/categories");

    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteCategoryAction] Error:", error);
    return { success: false, error: getErrorMessage(error) };
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
    revalidatePath("/categories");

    return { success: true };
  } catch (error: unknown) {
    console.error("[reorderCategoriesAction] Error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
