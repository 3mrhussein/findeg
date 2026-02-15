"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { CategoryInput } from "@/features/administration/domain/types";

/**
 * Creates a new product category.
 *
 * @param input - The category data creating payload.
 * @returns Success status or error message.
 */
export async function createCategoryAction(input: CategoryInput) {
  try {
    const service = container.adminCategoryService;
    await service.create(input);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Updates an existing category's details.
 *
 * @param id - The ID of the category to update.
 * @param input - The updated category fields.
 * @returns Success status or error message.
 */
export async function updateCategoryAction(id: number, input: CategoryInput) {
  try {
    const service = container.adminCategoryService;
    await service.update(id, input);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a category by its ID.
 *
 * @param id - The category ID.
 * @returns Success status or error message.
 */
export async function deleteCategoryAction(id: number) {
  try {
    const service = container.adminCategoryService;
    await service.delete(id);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
