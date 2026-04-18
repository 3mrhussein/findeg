/**
 * Catalog Data Layer (Storefront)
 *
 * Provides cached data for the storefront catalog features.
 * Adheres to Next.js 16 "use cache" standards.
 */
"use cache";

import { cacheTag, cacheLife } from "next/cache";
import {
  createCatalogServices,
  getShopPlpViewModel as getBackendPlpViewModel,
  getSearchPageViewModel as getBackendSearchViewModel,
  getCategoryPageViewModel as getBackendCategoryViewModel,
  getCollectionPageViewModel as getBackendCollectionViewModel,
  getProductPdpViewModel as getBackendPdpViewModel,
  getTopProductSlugsForStaticParams as getBackendTopSlugs,
  getProductIdsForStaticParams as getBackendProductIds,
  getHomePageData as getBackendHomePageData,
  getShopPageData as getBackendShopPageData,
  getProductDetailPageData as getBackendProductDetailData,
  getCategoriesPageData as getBackendCategoriesPageData,
  type ShopPlpViewModel,
  type SearchPageViewModel,
  type CategoryPageViewModel,
  type CollectionPageViewModel,
  type ProductPdpViewModel,
  type HomePageData,
  type ShopPageData,
  type ProductDetailPageData,
  getCollectionsPageData,
  type CollectionsPageData,
} from "@backend/features/catalog";
import { createReviewServices } from "@backend/features/review";
import { resolveLocale, type Locale } from "@backend/features/core";
import { getProductEnglishSlug } from "@backend/features/catalog/domain/utils/slug";

/**
 * Shop PLP Data
 */
export async function getShopPlpViewModel(
  locale: string,
  slug: string[],
  query: any,
): Promise<ShopPlpViewModel | null> {
  cacheTag("products", "categories", `plp-${locale}-${slug.join("-")}`);
  cacheLife("hours");

  return await getBackendPlpViewModel(locale, slug, query);
}

/**
 * Search Page Data
 */
export async function getSearchPageViewModel(
  locale: string,
  rawQuery: string,
  query: any,
): Promise<SearchPageViewModel> {
  const resolvedLocale = resolveLocale(locale);
  cacheTag("products", "categories", `search-${resolvedLocale}-${rawQuery}`);
  cacheLife("hours");

  return await getBackendSearchViewModel(locale, rawQuery, query);
}

/**
 * Category Page Data
 */
export async function getCategoryPageViewModel(
  slug: string,
  locale: string,
  query: any,
): Promise<CategoryPageViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  cacheTag("products", "categories", `category-${resolvedLocale}-${slug}`);
  cacheLife("hours");

  return await getBackendCategoryViewModel(slug, locale, query);
}

// Export the slug helper for convenience
export { getProductEnglishSlug };

/**
 * Metadata query for PDP
 */
export async function getProductBySlugOrIdForMetadata(locale: string, slug: string) {
  const resolvedLocale = resolveLocale(locale);
  const { products } = createCatalogServices();

  // Try by ID first if numeric, then by slug
  if (/^\d+$/.test(slug)) {
    return await products.getById(Number(slug), resolvedLocale);
  }
  return await products.getBySlug(slug, resolvedLocale);
}

/**
 * Top product slugs for static params
 */
export async function getTopProductSlugsForStaticParams(limit: number = 100) {
  const { products } = createCatalogServices();
  const allProducts = await products.getAll("en");

  return allProducts.slice(0, limit).map((p: any) => getProductEnglishSlug(p) || String(p.id));
}

/**
 * Full PDP View Model query
 */
/**
 * PDP Data
 */
export async function getProductPdpData(
  productId: number,
  locale: string,
): Promise<ProductPdpViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  cacheTag("products", `product-${productId}`);
  cacheLife("hours");

  return await getBackendPdpViewModel(resolvedLocale, String(productId));
}

/**
 * Product detail page data (Old structure)
 */
export async function getProductDetailPageData(
  productId: number,
  language: string,
): Promise<ProductDetailPageData | null> {
  const locale = resolveLocale(language);
  cacheTag("products", `product-${productId}`, `product-${productId}-${locale}`);
  cacheLife("hours");

  return await getBackendProductDetailData(productId, language);
}

/**
 * Product IDs for Static Params
 */
export async function getProductIdsForStaticParams(): Promise<number[]> {
  return await getBackendProductIds();
}

/**
 * Home page data
 *
 * Cache: Tagged with 'home-page', 'products', 'categories'
 * revalidated according to HOME_PAGE_CACHE_CONFIG logic
 */
export async function getHomePageData(language: string): Promise<HomePageData> {
  const locale = resolveLocale(language);
  cacheTag("home-page", "products", "categories", `home-${locale}`);
  cacheLife("hours");

  return await getBackendHomePageData(language);
}

/**
 * Shop listing page data
 */
export async function getShopPageData(language: string): Promise<ShopPageData> {
  const locale = resolveLocale(language);
  cacheTag("products", `shop-${locale}`);
  cacheLife("hours");

  return await getBackendShopPageData(language);
}

/**
 * Collections listing page data
 */
export async function getCollectionsPage(language: string): Promise<CollectionsPageData> {
  const locale = resolveLocale(language);
  cacheTag("collections", "categories", `collections-${locale}`);
  cacheLife("days");

  return await getCollectionsPageData(language);
}

/**
 * Categories listing page data
 */
export async function getCategoriesPageData(language: string): Promise<any[]> {
  const locale = resolveLocale(language);
  cacheTag("categories", `categories-${locale}`);
  cacheLife("days");

  return await getBackendCategoriesPageData(language);
}

/**
 * Collection Page Data
 */
export async function getCollectionPageViewModel(
  slug: string,
  locale: string,
  query: any,
): Promise<CollectionPageViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  cacheTag("products", "collections", `collection-${resolvedLocale}-${slug}`);
  cacheLife("hours");

  return await getBackendCollectionViewModel(slug, locale, query);
}
