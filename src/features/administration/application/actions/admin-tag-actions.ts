"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { TagInput } from "@/features/administration/domain/types";
import { resolveErrorMessage } from "@/features/core/domain/errors/error-catalog";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import { isSystemAdmin } from "@/features/core/domain/auth/authorization";

/**
 * Creates a new tag from the admin panel.
 */
export async function adminCreateTagAction(input: TagInput) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminTagService;
    const tag = await service.create(input, Number(session.userId));

    revalidatePath("/admin/tags");
    revalidateTag(CACHE_TAGS.CATALOG_TAGS, "max");

    return { success: true, tagId: tag.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_TAG_CREATE_FAILED" as any),
    };
  }
}

/**
 * Updates an existing tag from the admin panel.
 */
export async function adminUpdateTagAction(id: number, input: TagInput) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminTagService;
    const tag = await service.update(id, input, Number(session.userId));

    revalidatePath("/admin/tags");
    revalidateTag(CACHE_TAGS.CATALOG_TAGS, "max");
    revalidateTag(CACHE_TAGS.tagDetail(id), "max");

    return { success: true, tagId: tag.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_TAG_UPDATE_FAILED" as any),
    };
  }
}

/**
 * Deletes a tag by its ID.
 */
export async function adminDeleteTagAction(id: number) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminTagService;
    await service.delete(id, Number(session.userId));

    revalidatePath("/admin/tags");
    revalidateTag(CACHE_TAGS.CATALOG_TAGS, "max");
    revalidateTag(CACHE_TAGS.tagDetail(id), "max");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_TAG_DELETE_FAILED" as any),
    };
  }
}

/**
 * Fetches distinct groups for tag management.
 */
export async function adminGetDistinctTagGroupsAction() {
  try {
    const session = await container.authService.validateAdmin();
    if (!session) throw new Error("Unauthorized");

    const service = container.adminTagService;
    const groups = await service.getDistinctGroups();
    return { success: true, groups };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Bulk updates the status of multiple tags.
 */
export async function adminBulkUpdateTagsStatusAction(ids: number[], isActive: boolean) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminTagService;
    await service.bulkUpdateStatus(ids, isActive, Number(session.userId));

    revalidatePath("/admin/tags");
    revalidateTag(CACHE_TAGS.CATALOG_TAGS, "max");
    ids.forEach((id) => revalidateTag(CACHE_TAGS.tagDetail(id), "max"));

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_TAG_BULK_UPDATE_FAILED" as any),
    };
  }
}

/**
 * Bulk deletes multiple tags.
 */
export async function adminBulkDeleteTagsAction(ids: number[]) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminTagService;
    await service.bulkDelete(ids, Number(session.userId));

    revalidatePath("/admin/tags");
    revalidateTag(CACHE_TAGS.CATALOG_TAGS, "max");
    ids.forEach((id) => revalidateTag(CACHE_TAGS.tagDetail(id), "max"));

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_TAG_BULK_DELETE_FAILED" as any),
    };
  }
}

/**
 * Toggles the active status of a tag.
 */
export async function adminToggleTagStatusAction(id: number) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminTagService;
    const tag = await service.toggleTagStatus(id, Number(session.userId));

    revalidatePath("/admin/tags");
    revalidateTag(CACHE_TAGS.CATALOG_TAGS, "max");
    revalidateTag(CACHE_TAGS.tagDetail(id), "max");

    return { success: true, isActive: tag.isActive };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_TAG_UPDATE_FAILED" as any),
    };
  }
}

/**
 * Gets the number of products assigned to a tag.
 */
export async function adminGetTagProductCountAction(id: number) {
  try {
    const session = await container.authService.validateAdmin();
    if (!session) throw new Error("Unauthorized");

    const service = container.adminTagService;
    const count = await service.getTagProductCount(id);

    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
