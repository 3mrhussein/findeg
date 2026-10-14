'use server';

import { createAuditLogService } from '@findeg/backend/features/audit';
/**
 * Inventory Actions (Dashboard Data Layer)
 *
 * Stock updates and inventory management.
 */

import { updateTag } from 'next/cache';
import { createAdminInventoryService } from '@findeg/inventory';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { requireStaffAction } from '@lib/auth-guard';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Update stock for a single variant
 */
export async function updateStock(input: { variantId: number; quantity: number }) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_INVENTORY_WRITE, 'update stock');
    const inventory = createAdminInventoryService(createAuditLogService());
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
    const inventory = createAdminInventoryService(createAuditLogService());
    await inventory.bulkUpdateStock(updates);

    // Invalidate inventory caches
    updateTag('inventory');
    updateTag('products');

    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkUpdateStock]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
