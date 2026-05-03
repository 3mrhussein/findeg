import { revalidatePath, revalidateTag } from 'next/cache';
import type { ServiceResult } from '@findeg/backend/features/core';

/**
 * Storefront Cache Invalidation Helpers
 *
 * Wraps Next.js cache functions to execute cache invalidation based on
 * ServiceResult metadata returned by backend services.
 *
 * Used primarily for product catalog and order updates that affect
 * customer-facing pages (shop, product detail, cart, orders).
 *
 * @example
 * const result = await backend.createOrder(data);
 * await invalidateCaches(result);
 */

/**
 * Executes cache invalidation based on ServiceResult metadata.
 * Calls revalidatePath() and/or revalidateTag() as needed.
 *
 * @param result - ServiceResult from backend with cache metadata
 */
export async function invalidateCaches<T>(result: ServiceResult<T>): Promise<void> {
  // Revalidate specific paths
  if (result.cachePaths?.length) {
    for (const path of result.cachePaths) {
      revalidatePath(path);
    }
  }

  // Revalidate by tags
  if (result.cacheTags?.length) {
    for (const tag of result.cacheTags) {
      revalidateTag(tag, 'max');
    }
  }
}

/**
 * Manually revalidate specific paths (shop pages, product detail, etc).
 *
 * @param paths - Array of paths to revalidate
 */
export async function invalidatePaths(paths: string[]): Promise<void> {
  for (const path of paths) {
    revalidatePath(path);
  }
}

/**
 * Manually revalidate specific cache tags.
 * Used with `"use cache"` + `cacheTag()` directives.
 *
 * @param tags - Array of cache tags (e.g., "products", "catalog")
 */
export async function invalidateTags(tags: string[]): Promise<void> {
  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }
}
