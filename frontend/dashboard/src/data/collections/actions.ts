'use server';

import { CollectionInput } from '@findeg/backend/features/catalog';
import { updateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { requireStaffAction } from '@lib/auth-guard';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Admin Collection Actions (Dashboard Data Layer)
 */

export async function createCollectionAction(input: CollectionInput) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE, 'create collection');
    const { collections } = createAdministrationServices();
    const result = await collections.create(input);
    updateTag('collections');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createCollectionAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCollectionAction(id: number, input: CollectionInput) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE, 'update collection');
    const { collections } = createAdministrationServices();
    const result = await collections.update(id, input);
    updateTag('collections');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateCollectionAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCollectionAction(id: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE, 'delete collection');
    const { collections } = createAdministrationServices();
    await collections.delete(id);
    updateTag('collections');
    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteCollectionAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function reorderCollectionsAction(updates: Array<{ id: number; sortOrder: number }>) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE, 'reorder collections');
    const { collections } = createAdministrationServices();
    await collections.reorder(updates);
    updateTag('collections');
    return { success: true };
  } catch (error: unknown) {
    console.error('[reorderCollectionsAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function checkCollectionSlugAvailableAction(slug: string, excludeId?: number) {
  try {
    await requireStaffAction(
      PERMISSION_CODES.ADMIN_COLLECTIONS_READ,
      'check collection slug available',
    );
    const { collections } = createAdministrationServices();
    const available = await collections.checkSlugAvailable(slug, excludeId);
    return { success: true, available };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error), available: true };
  }
}
