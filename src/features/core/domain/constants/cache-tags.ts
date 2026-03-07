/**
 * Cache tag constants and factories for `'use cache'` invalidation.
 *
 * - Flat tags (e.g. `CATALOG_PRODUCTS`) bust all entries in a collection.
 * - Tag factories (e.g. `productDetail`) bust a single entity precisely.
 */
export const CACHE_TAGS = {
  // Collection-level tags — use with revalidateTag after any write to that table
  CATALOG_PRODUCTS: "catalog:products",
  CATALOG_CATEGORIES: "catalog:categories",
  CATALOG_BRANDS: "catalog:brands",
  CATALOG_REVIEWS: "catalog:reviews",

  // Entity-level tag factories — use for surgical per-item invalidation
  /** Tag for a single product detail cache entry. */
  productDetail: (id: number) => `catalog:product:${id}`,
  /** Tag for a single category detail cache entry. */
  categoryDetail: (slug: string) => `catalog:category:${slug}`,
} as const;
