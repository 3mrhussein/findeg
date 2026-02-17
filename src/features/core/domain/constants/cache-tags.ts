/**
 * Cache tag constants for Next.js `use cache` invalidation.
 */

export const CACHE_TAGS = {
  CATALOG_PRODUCTS: "catalog:products",
  CATALOG_CATEGORIES: "catalog:categories",
  CATALOG_BRANDS: "catalog:brands",
  CATALOG_REVIEWS: "catalog:reviews",
} as const;
