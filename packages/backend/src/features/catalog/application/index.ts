export * from "./interfaces";
export * from "./services";

// Pure action functions (no framework dependencies)
export { createProduct, updateProduct, deleteProduct } from "./actions/product";
export { createBrand, updateBrand, deleteBrand, toggleBrandStatus } from "./actions/brand";
export {
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategoryUp,
  moveCategoryDown,
  reorderCategories,
  checkSlugAvailable,
} from "./actions/category";

// Cached queries for storefront
export {
  getHomePageData,
  getShopPageData,
  getSearchPageData,
  getProductDetailPageData,
} from "./queries/storefront";
export type {
  HomePageData,
  ShopPageData,
  SearchPageData,
  ProductDetailPageData,
} from "./queries/storefront";

// Cache configuration
export {
  HOME_PAGE_CACHE_CONFIG,
  SHOP_PAGE_CACHE_CONFIG,
  CATEGORY_PAGE_CACHE_CONFIG,
} from "./queries/cache-config";
