'use server';

import { CollectionInput } from '@findeg/backend/features/catalog';
import { revalidateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { getErrorMessage } from '@lib/type-guards';
import { requireDashboardPermission } from '@lib/require-dashboard-permission';

/**
 * Admin Collection Actions (Dashboard Data Layer)
 */

export async function createCollectionAction(input: CollectionInput) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE);
    const { collections } = createAdministrationServices();
    const result = await collections.create(input);
    revalidateTag('collections', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createCollectionAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCollectionAction(id: number, input: CollectionInput) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE);
    const { collections } = createAdministrationServices();
    const result = await collections.update(id, input);
    revalidateTag('collections', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateCollectionAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCollectionAction(id: number) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE);
    const { collections } = createAdministrationServices();
    await collections.delete(id);
    revalidateTag('collections', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteCollectionAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function reorderCollectionsAction(updates: Array<{ id: number; sortOrder: number }>) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE);
    const { collections } = createAdministrationServices();
    await collections.reorder(updates);
    revalidateTag('collections', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[reorderCollectionsAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
