"use server";

import { revalidatePath } from "next/cache";
import { getServices } from "@/server/getServices";

export async function duplicateProductAction(id: number, adminUserId?: number) {
  const { adminProduct } = getServices();
  const result = await adminProduct.duplicateProduct(id, adminUserId);
  revalidatePath("/admin/products");
  return result;
}

export async function bulkActivateAction(ids: number[], adminUserId?: number) {
  const { adminProduct } = getServices();
  await adminProduct.bulkActivate(ids, adminUserId);
  revalidatePath("/admin/products");
}

export async function bulkDeactivateAction(ids: number[], adminUserId?: number) {
  const { adminProduct } = getServices();
  await adminProduct.bulkDeactivate(ids, adminUserId);
  revalidatePath("/admin/products");
}

export async function bulkDeleteAction(ids: number[], adminUserId?: number) {
  const { adminProduct } = getServices();
  await adminProduct.bulkDelete(ids, adminUserId);
  revalidatePath("/admin/products");
}
