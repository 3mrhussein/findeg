/**
 * Order Feature Cache Path Builders
 *
 * Returns cache paths that should be invalidated when order data changes.
 * App-layer uses these paths to execute revalidatePath() calls.
 */

/**
 * Get all cache paths affected by order status/payment updates
 *
 * @param orderId - The order ID that was updated
 * @returns Array of cache paths to invalidate
 */
export function getOrderCachePaths(orderId: number): string[] {
  return [
    '/admin/orders', // Orders list
    `/admin/orders/${orderId}`, // Order detail
  ];
}

/**
 * Get all cache tags affected by order changes
 * (Can be extended for tag-based revalidation)
 *
 * @param orderId - The order ID that was changed
 * @returns Array of cache tags to invalidate
 */
export function getOrderCacheTags(orderId: number): string[] {
  return [
    'orders', // All orders
    `order-${orderId}`, // Specific order
  ];
}
