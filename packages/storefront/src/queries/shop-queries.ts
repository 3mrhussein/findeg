/**
 * Storefront Catalog Cached Queries
 *
 * Re-exports backend queries with Next.js "use cache" directives.
 * Cache configs are imported from backend and applied here.
 *
 * This layer adds caching without modifying backend pure functions.
 */

"use cache";

import { cacheTag, cacheLife } from "next/cache";
import {
  getHomePageData as getHomePageDataBackend,
  getShopPageData as getShopPageDataBackend,
  getSearchPageData as getSearchPageDataBackend,
  getProductDetailPageData as getProductDetailDataBackend,
  HOME_PAGE_CACHE_CONFIG,
  SHOP_PAGE_CACHE_CONFIG,
  CATEGORY_PAGE_CACHE_CONFIG,
} from "@backend/features/catalog";
import type {
  HomePageData,
  ShopPageData,
  SearchPageData,
  ProductDetailPageData,
} from "@backend/features/catalog";

/**
 * Cached storefront query: Home page data
 *
 * Uses "use cache" with stale/revalidate/expire profile: hours
 * - stale: 5 min
 * - revalidate: 1 hr
 * - expire: 1 day
 */
export async function getHomePageData(language: string): Promise<HomePageData> {
  cacheTag(...HOME_PAGE_CACHE_CONFIG.tags);
  cacheLife(HOME_PAGE_CACHE_CONFIG.revalidationProfile);
  return getHomePageDataBackend(language);
}

/**
 * Cached storefront query: Shop/listing page data
 *
 * Uses "use cache" with hours profile.
 * Server-side filter/sort logic operates on this cached data.
 */
export async function getShopPageData(language: string): Promise<ShopPageData> {
  cacheTag(...SHOP_PAGE_CACHE_CONFIG.tags);
  cacheLife(SHOP_PAGE_CACHE_CONFIG.revalidationProfile);
  return getShopPageDataBackend(language);
}

/**
 * Uncached storefront query: Search page data
 *
 * Intentionally NOT cached — search results are query-dependent.
 * Must reflect latest product data on every request.
 */
export async function getSearchPageData(language: string, query: string): Promise<SearchPageData> {
  // No caching for search results
  return getSearchPageDataBackend(language, query);
}

/**
 * Cached storefront query: Product detail page data
 *
 * Uses "use cache" with hours profile.
 * Individual product pages are cached per product.
 */
export async function getProductDetailData(
  productId: number,
  language: string,
): Promise<ProductDetailPageData | null> {
  cacheTag(`product-${productId}`);
  cacheLife("hours");
  return getProductDetailDataBackend(productId, language);
}
