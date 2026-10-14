// Public barrel for the catalog feature. Only types/DTOs, service interfaces,
// plain-function domain accessors, and service factories are exported here
// — concrete service classes (ProductService, CategoryService, etc.) and
// domain entity classes (ProductEntity, VariantEntity) stay internal to the
// backend package. See docs/adr/0001-backend-feature-barrels.md.

// ─── Domain types ──────────────────────────────────────────────────────────
export type { Product } from '../catalog-product/index';
export type { Variant } from '../catalog-variant/index';
export type { Category } from '../catalog-category/index';
export type { Brand } from '../catalog-brand/index';
export type { Tag } from '../catalog-tag/index';
export type { Collection } from '../catalog-collection/index';

// Plain-function accessors wrapping ProductEntity/VariantEntity, which stay
// internal (concrete classes are never barrel-exported).
export { isNewProduct, getProductDisplayPrice } from '../catalog-product/index';
export { getVariantAvailableStock } from '../catalog-variant/index';

// ─── DTOs ───────────────────────────────────────────────────────────────────
export type { BrandInput } from '../catalog-brand-input/index';
export { BrandInputSchema } from '../catalog-brand-input/index';
export type { TagInput } from '../catalog-tag-input/index';
export { TagInputSchema } from '../catalog-tag-input/index';
export type { CollectionInput } from '../catalog-collection-input/index';
export { CollectionInputSchema } from '../catalog-collection-input/index';
export type { CategoryInput } from '../catalog-category-input/index';
export type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
} from '../catalog-variant-input/index';
export type {
  CatalogHealthStats,
  CategoryProductDistribution,
} from '../catalog-catalog-health-stats/index';

// ─── Interface-adjacent types ───────────────────────────────────────────────
export type { ProductFilters } from '../catalog-product-filters/types';
export type { SearchParams } from '../catalog-i-search-service/types';
export type {
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from '../catalog-i-admin-search-analytics-repository/types';

// ─── Service factories ────────────────────────────────────────────────────────
export {
  createProductService,
  createCategoryService,
  createVariantService,
  createTagService,
  createCollectionService,
  createSearchService,
  createInventoryService,
  createBrandService,
  createAdminSearchAnalyticsService,
} from '../catalog-factory/index';

export * from '../catalog-contracts/index';
export { TagScopeSchema, type TagScope } from '../catalog-tag/index';
export * from '../catalog-inventory-update/index';
