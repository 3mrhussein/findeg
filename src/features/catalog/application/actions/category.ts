"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { CategoryInput } from "@/features/administration/domain/types";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import { resolveErrorMessage } from "@/features/core/domain/errors";

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
    revalidateTag(CACHE_TAGS.CATALOG_CATEGORIES, "max");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
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
    revalidateTag(CACHE_TAGS.CATALOG_CATEGORIES, "max");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
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
    revalidateTag(CACHE_TAGS.CATALOG_CATEGORIES, "max");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
  }
}
