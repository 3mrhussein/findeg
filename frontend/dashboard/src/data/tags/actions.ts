'use server';

import { TagInput } from '@findeg/backend/features/catalog';
import { revalidateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Admin Tag Actions (Dashboard Data Layer)
 */

export async function createTagAction(input: TagInput) {
  try {
    const { tags } = createAdministrationServices();
    const result = await tags.create(input);
    revalidateTag('tags', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createTagAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTagAction(id: number, input: TagInput) {
  try {
    const { tags } = createAdministrationServices();
    const result = await tags.update(id, input);
    revalidateTag('tags', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateTagAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteTagAction(id: number) {
  try {
    const { tags } = createAdministrationServices();
    await tags.delete(id);
    revalidateTag('tags', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteTagAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkUpdateTagsStatusAction(ids: number[], isActive: boolean) {
  try {
    const { tags } = createAdministrationServices();
    await tags.bulkUpdateStatus(ids, isActive);
    revalidateTag('tags', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkUpdateTagsStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkDeleteTagsAction(ids: number[]) {
  try {
    const { tags } = createAdministrationServices();
    await tags.bulkDelete(ids);
    revalidateTag('tags', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkDeleteTagsAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleTagStatusAction(id: number) {
  try {
    const { tags } = createAdministrationServices();
    const result = await tags.toggleTagStatus(id);
    revalidateTag('tags', 'max');
    return { success: true, isActive: result.isActive, data: result };
  } catch (error: unknown) {
    console.error('[toggleTagStatusAction]', error);
    return { success: false, error: getErrorMessage(error), isActive: false };
  }
}

export async function getTagProductCountAction(tagId: number) {
  try {
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
    const { tags } = createAdministrationServices();
    const groups = await tags.getDistinctGroups();
    return { success: true, groups };
  } catch (error: unknown) {
    console.error('[getDistinctTagGroupsAction]', error);
    return { success: false, error: getErrorMessage(error), groups: [] };
  }
}
