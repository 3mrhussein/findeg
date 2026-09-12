/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { categories } from '../../schema/catalog/categories.js';
export { brands } from '../../schema/catalog/brands.js';
export { collections, collectionTags } from '../../schema/catalog/collections.js';
export { tags, productTags } from '../../schema/catalog/tags.js';
export { products } from '../../schema/catalog/products.js';
export {
  productVariants,
  variantImages,
  variantAttributes,
} from '../../schema/catalog/product-variants.js';
export { attributes, productAttributes } from '../../schema/catalog/product-attributes.js';
export { reviews, reviewHelpfulVotes } from '../../schema/sales/reviews.js';
export { searchLogs } from '../../schema/system/search-logs.js';
