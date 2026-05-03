'use server';

import { BrandInput } from '@findeg/backend/features/administration/domain/types';
import { revalidateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Admin Brand Actions (Dashboard Data Layer)
 */

export async function createBrandAction(input: BrandInput) {
  try {
    const { brands } = createAdministrationServices();
    const result = await brands.create(input);
    revalidateTag('brands-admin', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createBrandAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateBrandAction(id: number, input: BrandInput) {
  try {
    const { brands } = createAdministrationServices();
    const result = await brands.update(id, input);
    revalidateTag('brands-admin', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateBrandAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteBrandAction(id: number) {
  try {
    const { brands } = createAdministrationServices();
    await brands.delete(id);
    revalidateTag('brands-admin', 'max');
    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteBrandAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleBrandStatusAction(id: number) {
  try {
    const { brands } = createAdministrationServices();
    const result = await brands.toggleBrandStatus(id);
    revalidateTag('brands-admin', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[toggleBrandStatusAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
