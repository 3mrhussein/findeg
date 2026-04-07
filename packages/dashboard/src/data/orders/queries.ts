/**
 * Order Queries (Dashboard Data Layer)
 *
 * Uses "use cache" directive to wrap backend service calls.
 */
"use cache";

import { cacheLife, cacheTag } from "next/cache";
// Use AdminOrderService from administration feature
import { createAdministrationServices } from "@backend/features/administration";

/**
 * Get all orders with optional filters
 *
 * Cache: Shorter TTL (minutes) since orders change frequently
 */
export async function getOrders(filters?: any) {
  cacheTag("orders");
  cacheLife("minutes");

  const { orders } = createAdministrationServices();
  return await orders.getAll(filters);
}

/**
 * Get order by ID
 *
 * Cache: Tagged with order ID
 */
export async function getOrderById(id: number | string) {
  cacheTag("orders");
  cacheLife("minutes");

  const { orders } = createAdministrationServices();
  return await orders.getById(id);
}

/**
 * Get recent orders
 *
 * Cache: Short TTL for dashboard widgets
 */
export async function getRecentOrders(limit: number = 10) {
  cacheTag("orders");
  cacheLife("minutes");

  // Use dashboard service which has getRecentOrders method
  const { dashboard } = createAdministrationServices();
  return await dashboard.getRecentOrders(limit);
}
