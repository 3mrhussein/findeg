'use server';

import { BrandInput } from '@findeg/catalog';
import { updateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { requireStaffAction } from '@lib/auth-guard';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Admin Brand Actions (Dashboard Data Layer)
 */

export async function createBrandAction(input: BrandInput) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_BRANDS_WRITE, 'create brand');
    const { brands } = createAdministrationServices();
    const result = await brands.create(input);
    updateTag('brands');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createBrandAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateBrandAction(id: number, input: BrandInput) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_BRANDS_WRITE, 'update brand');
    const { brands } = createAdministrationServices();
    const result = await brands.update(id, input);
    updateTag('brands');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateBrandAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteBrandAction(id: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_BRANDS_WRITE, 'delete brand');
    const { brands } = createAdministrationServices();
    await brands.delete(id);
    updateTag('brands');
    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteBrandAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleBrandStatusAction(id: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_BRANDS_WRITE, 'toggle brand status');
    const { brands } = createAdministrationServices();
    const result = await brands.toggleBrandStatus(id);
    updateTag('brands');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[toggleBrandStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function checkBrandSlugAvailableAction(slug: string, excludeId?: number) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_BRANDS_READ, 'check brand slug available');
    const { brands } = createAdministrationServices();
    const available = await brands.checkSlugAvailable(slug, excludeId);
    return { success: true, available };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error), available: true };
  }
}
