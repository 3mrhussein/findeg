"use server";

import { revalidatePath } from "next/cache";

export async function duplicateProductAction(id: number, adminUserId?: number) {
  return { success: false, error: "Not implemented - needs repository-based refactoring" };
}

export async function bulkActivateAction(ids: number[], adminUserId?: number) {
  return { success: false, error: "Not implemented - needs repository-based refactoring" };
}

export async function bulkDeactivateAction(ids: number[], adminUserId?: number) {
  return { success: false, error: "Not implemented - needs repository-based refactoring" };
}

export async function bulkDeleteAction(ids: number[], adminUserId?: number) {
  return { success: false, error: "Not implemented - needs repository-based refactoring" };
}
