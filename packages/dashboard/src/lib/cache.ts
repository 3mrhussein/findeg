import { revalidatePath, revalidateTag } from "next/cache";
import type { ServiceResult } from "@findeg/backend/features/core";

/**
 * Dashboard Cache Invalidation Helpers
 *
 * Wraps Next.js cache functions to execute cache invalidation based on
 * ServiceResult metadata returned by backend services.
 *
 * Backend services return cache tags/paths, app-layer executes the invalidation.
 * This decouples backend from framework while enabling cache control.
 *
 * @example
 * const result = await backend.updateProduct(data);
 * await invalidateCaches(result);
 *
 * @example Manual cache invalidation
 * await invalidatePaths(["/admin/products", "/admin/dashboard"]);
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
      revalidateTag(tag, "max");
    }
  }
}

/**
 * Manually revalidate specific paths.
 * Used when backend doesn't return cache metadata or for manual control.
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
 * @param tags - Array of cache tags to revalidate
 */
export async function invalidateTags(tags: string[]): Promise<void> {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}

/**
 * Comprehensive cache invalidation for common operations.
 *
 * @param options - Specific paths and/or tags to invalidate
 */
export async function invalidate(options: { paths?: string[]; tags?: string[] }): Promise<void> {
  if (options.paths?.length) {
    await invalidatePaths(options.paths);
  }
  if (options.tags?.length) {
    await invalidateTags(options.tags);
  }
}
