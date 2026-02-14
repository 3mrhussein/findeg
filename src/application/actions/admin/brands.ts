"use server";

import { getServices } from "@/server/getServices";
import { AdminBrandInput } from "@/domain/types/admin";
import { revalidatePath } from "next/cache";

/**
 *
 */
export async function createBrandAction(input: AdminBrandInput) {
  const { adminBrand } = getServices();

  try {
    await adminBrand.create(input);
    revalidatePath("/admin/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Failed to create brand:", error);
    return { success: false, error: "Failed to create brand" };
  }
}

/**
 *
 */
export async function updateBrandAction(id: number, input: AdminBrandInput) {
  const { adminBrand } = getServices();

  try {
    await adminBrand.update(id, input);
    revalidatePath("/admin/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Failed to update brand:", error);
    return { success: false, error: "Failed to update brand" };
  }
}

/**
 *
 */
export async function deleteBrandAction(id: number) {
  const { adminBrand } = getServices();

  try {
    await adminBrand.delete(id);
    revalidatePath("/admin/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete brand:", error);
    return { success: false, error: "Failed to delete brand" };
  }
}
