/**
 * Order Services Factory (Pure TypeScript - Framework Agnostic)
 *
 * Exports factory function that returns order service instances.
 * Apps call this factory to get services, then wrap service calls in "use cache" directives.
 *
 * Note: For admin operations (order status updates), use AdminOrderService from administration feature.
 * This factory provides read-only order query functionality.
 */

import { OrderService } from './OrderService';

/**
 * Create order services with all dependencies wired
 *
 * @returns Object containing all order service instances
 *
 * @example
 * ```ts
 * // In app data layer (dashboard/src/data/orders/queries.ts):
 * "use cache";
 * import { createOrderServices } from '@findeg/backend/features/order';
 *
 * export async function getOrders(locale: string) {
 *   cacheTag('orders', `orders-${locale}`);
 *   cacheLife('minutes');
 *
 *   const { orders } = createOrderServices();
 *   return await orders.getAll(locale);
 * }
 * ```
 */
export function createOrderServices() {
  // Create services (no arguments - they use query primitives directly)
  return {
    orders: new OrderService(),
  };
}

/**
 * Type helper for order services
 */
export type OrderServices = ReturnType<typeof createOrderServices>;
