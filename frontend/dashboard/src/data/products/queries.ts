/**
 * Product Queries (Dashboard Data Layer)
 *
 * Uses "use cache" directive to wrap backend service calls.
 * Apps own caching strategy - backend stays pure TypeScript.
 */
"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createAdministrationServices } from "@backend/features/administration";
import { createCatalogServices } from "@backend/features/catalog";
import { type Locale } from "@backend/features/core";

import type { ProductListResult, ProductListFilters } from "@backend/features/administration";

/**
 * Get all products with optional filters
 *
 * Cache: Tagged with 'products', revalidated on product mutations
 */
export async function getProducts(
  locale: string,
  filters?: ProductListFilters,
): Promise<ProductListResult> {
  cacheTag("products", `products-${locale}`);
  cacheLife("hours");

  const { products } = createAdministrationServices();
  return await products.getProductsList(filters || {});
}

/**
 * Get product by ID
 *
 * Cache: Tagged with product ID, revalidated on that product's mutation
 */
export async function getProductById(id: number, locale: string) {
  cacheTag("products", `product-${id}`, `product-${id}-${locale}`);
  cacheLife("hours");

  const { products } = createCatalogServices();
  return await products.getById(id, locale as Locale);
}

/**
 * Search products by query
 *
 * Cache: Tagged with search scope, shorter cache lifetime for freshness
 */
export async function searchProducts(query: string, locale: string, filters?: any) {
  cacheTag("products", `search-${locale}`);
  cacheLife("hours");

  const { products } = createCatalogServices();
  return await products.searchProducts(query, locale as Locale);
}
