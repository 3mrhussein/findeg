/**
 * Storefront Catalog Cached Queries (Legacy Bridge)
 *
 * This file acts as a bridge between legacy component imports and the new
 * storefront data layer in src/data/catalog/queries.ts.
 *
 * Future components should import directly from @/data/catalog/queries.
 */

'use cache';

export {
  getHomePageData,
  getShopPageData,
  getProductDetailPageData as getProductDetailData,
  getSearchPageViewModel as getSearchPageData,
} from '@/data/catalog/queries';

// Re-export types from the new central types file if needed by legacy components
export type {
  HomePageData,
  ShopPageData,
  SearchPageViewModel as SearchPageData,
  ProductDetailPageData,
} from '@/data/catalog/types';
