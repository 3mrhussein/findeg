"use server";

import { CollectionInput } from "@findeg/backend/features/administration/domain/types";
import { updateTag } from "next/cache";
import { createAdministrationServices } from "@findeg/backend/features/administration";
import { getErrorMessage } from "@lib/type-guards";

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
  } catch (error: unknown) {
    console.error("[adminCreateCollectionAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminUpdateCollectionAction(id: number, input: CollectionInput) {
  try {
    const { collections } = createAdministrationServices();
    const result = await collections.update(id, input);

    updateTag("collections");
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[adminUpdateCollectionAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminDeleteCollectionAction(id: number) {
  try {
    const { collections } = createAdministrationServices();
    await collections.delete(id);

    updateTag("collections");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminDeleteCollectionAction]", error);
    return { success: false, error: getErrorMessage(error) };
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
  } catch (error: unknown) {
    console.error("[adminReorderCollectionsAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
