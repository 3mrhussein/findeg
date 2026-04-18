"use server";

import { TagInput } from "@backend/features/administration/domain/types";
import { updateTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";
import { getErrorMessage } from "@lib/type-guards";

/**
 * Admin Tag Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend service factories.
 * Implements cache invalidation via updateTag().
 */

export async function adminCreateTagAction(input: TagInput) {
  try {
    const { tags } = createAdministrationServices();
    const result = await tags.create(input);

    updateTag("tags");
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[adminCreateTagAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminUpdateTagAction(id: number, input: TagInput) {
  try {
    const { tags } = createAdministrationServices();
    const result = await tags.update(id, input);

    updateTag("tags");
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[adminUpdateTagAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminDeleteTagAction(id: number) {
  try {
    const { tags } = createAdministrationServices();
    await tags.delete(id);

    updateTag("tags");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminDeleteTagAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminBulkUpdateTagsStatusAction(ids: number[], isActive: boolean) {
  try {
    const { tags } = createAdministrationServices();
    await tags.bulkUpdateStatus(ids, isActive);

    updateTag("tags");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminBulkUpdateTagsStatusAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminBulkDeleteTagsAction(ids: number[]) {
  try {
    const { tags } = createAdministrationServices();
    await tags.bulkDelete(ids);

    updateTag("tags");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminBulkDeleteTagsAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminToggleTagStatusAction(id: number) {
  try {
    const { tags } = createAdministrationServices();
    const result = await tags.toggleTagStatus(id);

    updateTag("tags");
    return {
      success: true,
      isActive: result.isActive,
      data: result,
    };
  } catch (error: unknown) {
    console.error("[adminToggleTagStatusAction]", error);
    return {
      success: false,
      error: getErrorMessage(error),
      isActive: false,
    };
  }
}

export async function adminGetTagProductCountAction(tagId: number) {
  try {
    const { tags } = createAdministrationServices();
    const count = await tags.getTagProductCount(tagId);

    return { success: true, count };
  } catch (error: unknown) {
    console.error("[adminGetTagProductCountAction]", error);
    return { success: false, error: getErrorMessage(error), count: 0 };
  }
}

export async function adminGetDistinctTagGroupsAction() {
  try {
    const { tags } = createAdministrationServices();
    const groups = await tags.getDistinctGroups();

    return { success: true, groups };
  } catch (error: unknown) {
    console.error("[adminGetDistinctTagGroupsAction]", error);
    return { success: false, error: getErrorMessage(error), groups: [] };
  }
}
