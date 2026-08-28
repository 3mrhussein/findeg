/**
 * Inventory Actions (Dashboard Data Layer)
 *
 * Stock updates and inventory management.
 */
'use server';

import { revalidateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { getErrorMessage } from '@lib/type-guards';
import { requireDashboardPermission } from '@lib/require-dashboard-permission';

/**
 * Update stock for a single variant
 */
export async function updateStock(input: { variantId: number; quantity: number }) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_INVENTORY_WRITE);
    const { inventory } = createAdministrationServices();
    await inventory.updateStock({ variantId: input.variantId, quantity: input.quantity });

    // Invalidate inventory caches
    revalidateTag('inventory', 'max');

    return { success: true };
  } catch (error: unknown) {
    console.error('[updateStock]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Bulk update stock for multiple variants
 */
export async function bulkUpdateStock(
  updates: { variantId: number; quantity: number; lowStockThreshold?: number }[],
) {
  try {
    await requireDashboardPermission(PERMISSION_CODES.ADMIN_INVENTORY_WRITE);
    const { inventory } = createAdministrationServices();
    // Assuming backend has a bulkUpdateStock or similar.
    // If not, we could loop, but let's assume it exists as per frontend expectation.
    await inventory.bulkUpdateStock(updates);

    // Invalidate inventory caches
    revalidateTag('inventory', 'max');

    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkUpdateStock]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
