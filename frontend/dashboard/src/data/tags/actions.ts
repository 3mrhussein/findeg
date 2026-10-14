'use server';

import { TagInput } from '@findeg/backend/features/catalog';
import { updateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { requireStaffAction } from '@lib/auth-guard';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Admin Tag Actions (Dashboard Data Layer)
 */

export async function createTagAction(input: TagInput) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_WRITE, 'create tag');
    const { tags } = createAdministrationServices();
    const result = await tags.create(input);
    updateTag('tags');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createTagAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTagAction(id: number, input: TagInput) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_WRITE, 'update tag');
    const { tags } = createAdministrationServices();
    const result = await tags.update(id, input);
    updateTag('tags');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateTagAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteTagAction(id: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_WRITE, 'delete tag');
    const { tags } = createAdministrationServices();
    await tags.delete(id);
    updateTag('tags');
    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteTagAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkUpdateTagsStatusAction(ids: number[], isActive: boolean) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_WRITE, 'bulk update tags status');
    const { tags } = createAdministrationServices();
    await tags.bulkUpdateStatus(ids, isActive);
    updateTag('tags');
    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkUpdateTagsStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkDeleteTagsAction(ids: number[]) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_WRITE, 'bulk delete tags');
    const { tags } = createAdministrationServices();
    await tags.bulkDelete(ids);
    updateTag('tags');
    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkDeleteTagsAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleTagStatusAction(id: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_WRITE, 'toggle tag status');
    const { tags } = createAdministrationServices();
    const result = await tags.toggleTagStatus(id);
    updateTag('tags');
    return { success: true, isActive: result.isActive, data: result };
  } catch (error: unknown) {
    console.error('[toggleTagStatusAction]', error);
    return { success: false, error: getErrorMessage(error), isActive: false };
  }
}

export async function getTagProductCountAction(tagId: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_READ, 'get tag product count');
    const { tags } = createAdministrationServices();
    const count = await tags.getTagProductCount(tagId);
    return { success: true, count };
  } catch (error: unknown) {
    console.error('[getTagProductCountAction]', error);
    return { success: false, error: getErrorMessage(error), count: 0 };
  }
}

export async function getDistinctTagGroupsAction() {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_READ, 'get distinct tag groups');
    const { tags } = createAdministrationServices();
    const groups = await tags.getDistinctGroups();
    return { success: true, groups };
  } catch (error: unknown) {
    console.error('[getDistinctTagGroupsAction]', error);
    return { success: false, error: getErrorMessage(error), groups: [] };
  }
}

export async function checkTagSlugAvailableAction(slug: string, excludeId?: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_TAGS_READ, 'check tag slug available');
    const { tags } = createAdministrationServices();
    const available = await tags.checkSlugAvailable(slug, excludeId);
    return { success: true, available };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error), available: true };
  }
}
