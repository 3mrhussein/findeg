"use server";

import { getServices } from "@/server/getServices";
import { AdminCategoryInput } from "@/domain/types/admin";
import { revalidatePath } from "next/cache";

/**
 *
 */
export async function createCategoryAction(input: AdminCategoryInput) {
  const { adminCategory } = getServices();

  try {
    await adminCategory.create(input);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

/**
 *
 */
export async function updateCategoryAction(id: number, input: AdminCategoryInput) {
  const { adminCategory } = getServices();

  try {
    await adminCategory.update(id, input);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

/**
 *
 */
export async function deleteCategoryAction(id: number) {
  const { adminCategory } = getServices();

  try {
    await adminCategory.delete(id);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
