export type { IProductRepository, ProductFilters } from './IProductRepository';
export type { IVariantRepository } from './IVariantRepository';
export type { BrandInput } from '../dtos/BrandInput';
export type { CategoryInput } from '../dtos/CategoryInput';
export type { ProductInput, VariantInput } from '../dtos/ProductInput';
export type {
  IInventoryRepository,
  InventoryBalanceResult,
  StockMovementInput,
  LowStockResult,
} from './IInventoryRepository';
export type {
  ISchoolListRepository,
  SchoolListResult,
  SchoolListItemResult,
  SchoolListAlternativeResult,
  SchoolListInput,
  SchoolListItemInput,
} from './ISchoolListRepository';
export type { IProductService } from './IProductService';
export type { IVariantService } from './IVariantService';
export type { ICategoryService } from './ICategoryService';
export type { ISearchService } from './ISearchService';
export type { ISchoolListService } from '../services/SchoolListService';
export type { ICategoryRepository } from './ICategoryRepository';
export type { IBrandRepository, BrandCreateInput, BrandUpdateInput } from './IBrandRepository';
export type {
  IAdminSearchAnalyticsRepository,
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from './IAdminSearchAnalyticsRepository';
export type { IAdminSearchAnalyticsService } from './IAdminSearchAnalyticsService';
export type { ITagRepository } from './ITagRepository';
export type { ITagService } from './ITagService';
export type { IAttributeRepository, AttributeFilter } from './IAttributeRepository';
export type { ICollectionRepository } from './ICollectionRepository';
export type { ICollectionService } from './ICollectionService';
