export * from "./interfaces";
export * from "./services";

// NOTE: Action functions (createProduct, createBrand, etc.) are NOT exported because they:
// 1. Use old ServiceContainer pattern with @ imports that break Turbopack bundling
// 2. Should be reimplemented in the app data layer using service factories
// Apps should create their own server actions using createCatalogServices()

// Cache configuration
export {
  HOME_PAGE_CACHE_CONFIG,
  SHOP_PAGE_CACHE_CONFIG,
  CATEGORY_PAGE_CACHE_CONFIG,
} from "./queries/cache-config";

export { buildHomeFeaturedGroups } from "./queries/home-page";
export { getShopPlpViewModel } from "./queries/shop-plp";
export { getSearchPageViewModel } from "./queries/search-page";
export { getCategoryPageViewModel } from "./queries/category-page";
export { getCollectionPageViewModel } from "./queries/collection-page";
export type { SearchPageViewModel } from "./queries/search-page";
export type { CategoryPageViewModel } from "./queries/category-page";
export type { CollectionPageViewModel } from "./queries/collection-page";
export type {
  ShopPlpViewModel,
  ShopPlpFilters,
  ShopPlpFacetCounts,
  ShopPlpSort,
  ShopPlpPerPage,
  ShopPlpDiscount,
  ShopPlpView,
} from "./queries/shop-plp";
export { getProductPdpViewModel } from "./queries/product-pdp";
export type { ProductPdpViewModel } from "./queries/product-pdp";
export {
  getTopProductSlugsForStaticParams,
  getProductBySlugOrIdForMetadata,
} from "./queries/product-pdp";

// Storefront direct data queries
export {
  getHomePageData,
  getShopPageData,
  getSearchPageData,
  getProductIdsForStaticParams,
  getProductDetailPageData,
  getCategoriesPageData,
  getCollectionsPageData,
} from "./queries/storefront";

export type {
  HomePageData,
  ShopPageData,
  SearchPageData,
  ProductDetailPageData,
  CollectionsPageData,
} from "./queries/storefront";
