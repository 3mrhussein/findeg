"use server";

import { CollectionInput } from "@backend/features/administration/domain/types";
import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Admin Collection Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend service factories.
 * Implements cache invalidation via updateTag().
 */

export async function adminCreateCollectionAction(input: CollectionInput) {
  try {
    const { collections } = createAdministrationServices();
    const result = await collections.create(input);

    updateTag("collections");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[adminCreateCollectionAction]", error);
    return { success: false, error: error?.message || "Failed to create collection" };
  }
}

export async function adminUpdateCollectionAction(id: number, input: CollectionInput) {
  try {
    const { collections } = createAdministrationServices();
    const result = await collections.update(id, input);

    updateTag("collections");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[adminUpdateCollectionAction]", error);
    return { success: false, error: error?.message || "Failed to update collection" };
  }
}

export async function adminDeleteCollectionAction(id: number) {
  try {
    const { collections } = createAdministrationServices();
    await collections.delete(id);

    updateTag("collections");
    return { success: true };
  } catch (error: any) {
    console.error("[adminDeleteCollectionAction]", error);
    return { success: false, error: error?.message || "Failed to delete collection" };
  }
}

export async function adminReorderCollectionsAction(
  updates: Array<{ id: number; sortOrder: number }>,
) {
  try {
    const { collections } = createAdministrationServices();
    await collections.reorder(updates);

    updateTag("collections");
    return { success: true };
  } catch (error: any) {
    console.error("[adminReorderCollectionsAction]", error);
    return { success: false, error: error?.message || "Failed to reorder collections" };
  }
}
