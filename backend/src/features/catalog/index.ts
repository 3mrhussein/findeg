// Public barrel for the catalog feature. Only types/DTOs, service interfaces,
// plain-function domain accessors, and service factories are exported here
// — concrete service classes (ProductService, CategoryService, etc.) and
// domain entity classes (ProductEntity, VariantEntity) stay internal to the
// backend package. See docs/adr/0001-backend-feature-barrels.md.

// ─── Domain types ──────────────────────────────────────────────────────────
export type { Product } from './domain/entities/Product';
export type { Variant } from './domain/entities/Variant';
export type { Category } from './domain/entities/Category';
export type { Brand } from './domain/entities/Brand';
export type { Tag } from './domain/entities/Tag';
export type { Collection } from './domain/entities/Collection';

// Plain-function accessors wrapping ProductEntity/VariantEntity, which stay
// internal (concrete classes are never barrel-exported).
export { isNewProduct, getProductDisplayPrice } from './domain/entities/Product';
export { getVariantAvailableStock } from './domain/entities/Variant';

// ─── DTOs ───────────────────────────────────────────────────────────────────
export type { BrandInput } from './application/dtos/BrandInput';
export { BrandInputSchema } from './application/dtos/BrandInput';
export type { TagInput } from './application/dtos/TagInput';
export { TagInputSchema } from './application/dtos/TagInput';
export type { CollectionInput } from './application/dtos/CollectionInput';
export { CollectionInputSchema } from './application/dtos/CollectionInput';
export type { CategoryInput } from './application/dtos/CategoryInput';
export type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
} from './application/dtos/VariantInput';
export type {
  CatalogHealthStats,
  CategoryProductDistribution,
} from './application/dtos/CatalogHealthStats';

// ─── Interface-adjacent types ───────────────────────────────────────────────
export type { ProductFilters } from './application/interfaces/ProductFilters';
export type { SchoolListResult } from './application/interfaces/ISchoolListRepository';
export type { ISchoolListService } from './application/services/SchoolListService';
export type {
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from './application/interfaces/IAdminSearchAnalyticsRepository';

// ─── Service factories ────────────────────────────────────────────────────────
export {
  createProductService,
  createCategoryService,
  createVariantService,
  createTagService,
  createCollectionService,
  createSearchService,
  createInventoryService,
  createSchoolListService,
  createBrandService,
  createAdminSearchAnalyticsService,
} from './application/services/factory';
