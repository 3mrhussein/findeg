export { ProductService } from './ProductService';
export { VariantService } from './VariantService';
export { InventoryService } from './InventoryService';
export { SchoolListService } from './SchoolListService';
export { CategoryService } from './CategoryService';
export { TagService } from './TagService';
export { CollectionService } from './CollectionService';

// Service factories for apps to create service instances
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
} from './factory';
