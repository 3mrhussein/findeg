/**
 * Catalog Query Cache Configuration
 *
 * Defines cache behavior for storefront queries.
 * App-layer uses these configs in "use cache" directives.
 */

import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";

/**
 * Cache configuration for home page query
 *
 * - stale: 5 minutes (data can be served stale briefly)
 * - revalidate: 1 hour (background revalidation)
 * - expire: 1 day (absolute expiration)
 *
 * Tags: Include both products and categories since admin writes to either
 * can invalidate this entry via revalidateTag
 */
export const HOME_PAGE_CACHE_CONFIG = {
  tags: [CACHE_TAGS.CATALOG_PRODUCTS, CACHE_TAGS.CATALOG_CATEGORIES],
  revalidationProfile: "hours" as const, // matches "use cache" directive in Next.js
} as const;

/**
 * Cache configuration for shop/listing page query
 *
 * Uses same stale/revalidate/expire profile as home page.
 * Server-side filter/sort logic operates on cached product data.
 *
 * Tag: Only products (categories don't directly affect shop list)
 */
export const SHOP_PAGE_CACHE_CONFIG = {
  tags: [CACHE_TAGS.CATALOG_PRODUCTS],
  revalidationProfile: "hours" as const,
} as const;

/**
 * Cache configuration for category detail page query
 *
 * Uses same stale/revalidate/expire profile.
 * Server-side filter/sort logic operates on cached category products.
 *
 * Tags: Both categories and products (changes to either affect category pages)
 */
export const CATEGORY_PAGE_CACHE_CONFIG = {
  tags: [CACHE_TAGS.CATALOG_CATEGORIES, CACHE_TAGS.CATALOG_PRODUCTS],
  revalidationProfile: "hours" as const,
} as const;