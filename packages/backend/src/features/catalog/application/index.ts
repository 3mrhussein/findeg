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
