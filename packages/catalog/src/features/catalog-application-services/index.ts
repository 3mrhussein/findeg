export { ProductService } from '../catalog-product-service/index';
export { VariantService } from '../catalog-variant-service/index';
export { CategoryService } from '../catalog-category-service/index';
export { TagService } from '../catalog-tag-service/index';
export { CollectionService } from '../catalog-collection-service/index';

// Service factories for apps to create service instances
export {
  createProductService,
  createCategoryService,
  createVariantService,
  createTagService,
  createCollectionService,
  createSearchService,
  createBrandService,
  createAdminSearchAnalyticsService,
} from '../catalog-factory/index';
