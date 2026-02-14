"use server";

import { getServices } from "@/server/getServices";
import { AdminProductInput } from "@/domain/types/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 *
 */
export async function createProductAction(input: AdminProductInput) {
  const { adminProduct } = getServices();

  try {
    await adminProduct.create(input);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

/**
 *
 */
export async function updateProductAction(id: number, input: AdminProductInput) {
  const { adminProduct } = getServices();

  try {
    await adminProduct.update(id, input);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

/**
 *
 */
export async function deleteProductAction(id: number) {
  const { adminProduct } = getServices();

  try {
    await adminProduct.delete(id);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
