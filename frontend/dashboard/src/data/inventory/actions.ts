/**
 * Inventory Actions (Dashboard Data Layer)
 *
 * Stock updates and inventory management.
 */
'use server';

import { revalidateTag, updateTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { requireStaffAction } from '@lib/auth-guard';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Update stock for a single variant
 */
export async function updateStock(input: { variantId: number; quantity: number }) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_INVENTORY_WRITE, 'update stock');
    const { inventory } = createAdministrationServices();
    await inventory.updateStock({ variantId: input.variantId, quantity: input.quantity });

    // Invalidate inventory caches; the product list shows stock levels too.
    updateTag('inventory');
    updateTag('products');

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
    await requireStaffAction(PERMISSION_CODES.ADMIN_INVENTORY_WRITE, 'bulk update stock');
    const { inventory } = createAdministrationServices();
    await inventory.bulkUpdateStock(updates);

    // Invalidate inventory caches
    revalidateTag('inventory', 'max');

    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkUpdateStock]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
