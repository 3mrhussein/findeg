/**
 * Inventory Queries (Dashboard Data Layer)
 *
 * Inventory and stock-related data with "use cache"
 * Uses "use cache" directive to wrap backend service calls.
 */
"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Get all products with inventory info
 *
 * Cache: Tagged with 'inventory', revalidated on stock changes
 */
export async function getInventoryWithProducts(options?: {
  includeZeroStock?: boolean;
  limit?: number;
  offset?: number;
}) {
  cacheLife("hours");
  cacheTag("inventory");

  const { inventory } = createAdministrationServices();
  const result = await inventory.getInventory({
    includeZeroStock: options?.includeZeroStock ?? false,
    limit: options?.limit,
    offset: options?.offset,
  });

  return result || [];
}

/**
 * Get low stock alerts
 *
 * Cache: Short TTL for dashboard widget freshness
 */
export async function getLowStockAlerts(threshold: number = 10) {
  cacheLife("minutes");
  cacheTag("inventory", "low-stock");

  const { inventory } = createAdministrationServices();
  const lowStockProducts = await inventory.getLowStockAlerts(threshold);

  return lowStockProducts || [];
}
