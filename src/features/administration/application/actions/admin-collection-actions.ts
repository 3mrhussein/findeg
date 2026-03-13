"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { CollectionInput } from "@/features/administration/domain/types";
import { resolveErrorMessage } from "@/features/core/domain/errors/error-catalog";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import { isSystemAdmin } from "@/features/core/domain/auth/authorization";

/**
 * Creates a new collection from the admin panel.
 */
export async function adminCreateCollectionAction(input: CollectionInput) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminCollectionService;
    const collection = await service.create(input, Number(session.userId));

    revalidatePath("/admin/collections");
    revalidateTag(CACHE_TAGS.CATALOG_COLLECTIONS, "max");

    return { success: true, collectionId: collection.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_COLLECTION_CREATE_FAILED" as any),
    };
  }
}

/**
 * Updates an existing collection from the admin panel.
 */
export async function adminUpdateCollectionAction(id: number, input: CollectionInput) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminCollectionService;
    const collection = await service.update(id, input, Number(session.userId));

    revalidatePath("/admin/collections");
    revalidateTag(CACHE_TAGS.CATALOG_COLLECTIONS, "max");
    revalidateTag(CACHE_TAGS.collectionDetail(id), "max");

    return { success: true, collectionId: collection.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_COLLECTION_UPDATE_FAILED" as any),
    };
  }
}

/**
 * Deletes a collection by its ID.
 */
export async function adminDeleteCollectionAction(id: number) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminCollectionService;
    await service.delete(id, Number(session.userId));

    revalidatePath("/admin/collections");
    revalidateTag(CACHE_TAGS.CATALOG_COLLECTIONS, "max");
    revalidateTag(CACHE_TAGS.collectionDetail(id), "max");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_COLLECTION_DELETE_FAILED" as any),
    };
  }
}

/**
 * Reorders collections in the catalog.
 */
export async function adminReorderCollectionsAction(items: { id: number; sortOrder: number }[]) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminCollectionService;
    await service.reorder(items, Number(session.userId));

    revalidatePath("/admin/collections");
    revalidateTag(CACHE_TAGS.CATALOG_COLLECTIONS, "max");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_COLLECTION_REORDER_FAILED" as any),
    };
  }
}
