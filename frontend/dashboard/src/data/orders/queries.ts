/**
 * Order Queries (Dashboard Data Layer)
 *
 * Uses "use cache" directive to wrap backend service calls.
 */
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { createOrders } from '@findeg/backend/features/order';

/**
 * Get all orders with optional filters
 *
 * Cache: Shorter TTL (minutes) since orders change frequently
 */
export async function getOrders(filters?: Parameters<ReturnType<typeof createOrders>['list']>[0]) {
  cacheTag('orders');
  cacheLife('minutes');

  const orders = createOrders();
  return await orders.list(filters || {});
}

/**
 * Get order by ID
 *
 * Cache: Tagged with order ID
 */
export async function getOrderById(id: number | string) {
  cacheTag('orders');
  cacheLife('minutes');

  const orders = createOrders();
  return await orders.get(Number(id));
}

/**
 * Get recent orders
 *
 * Cache: Short TTL for dashboard widgets
 */
export async function getRecentOrders(limit: number = 10) {
  cacheTag('orders');
  cacheLife('minutes');

  return await createOrders().recent(limit);
}

/** Staff detail and activity share Order list invalidation. */
export async function getOrderDetail(id: number) {
  cacheTag('orders', `order-${id}`);
  cacheLife('minutes');
  return await createOrders().detail(id);
}
