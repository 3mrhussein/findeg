/**
 * Catalogue vocabulary (GLOSSARY: Product, Product Variant, Default Variant, Category, Brand,
 * Tag, Collection, Attribute). Slugs, SEO fields, images and input DTOs are not business and
 * stay outside the domain.
 */
export {
  ATTRIBUTE_DATA_TYPES,
  DEFAULT_TAG_SCOPE,
  NEW_ARRIVAL_TAG_KEY,
  TAG_SCOPES,
} from './constants';
export type {
  Attribute,
  AttributeDataType,
  AttributeId,
  Brand,
  BrandId,
  Category,
  CategoryId,
  Collection,
  CollectionId,
  Product,
  ProductId,
  ProductVariant,
  ProductVariantProps,
  Sku,
  Tag,
  TagId,
  TagScope,
  VariantId,
  CatalogErrorCode,
} from './types';
export {
  CatalogError,
  checkCompareAtPrice,
  defaultVariant,
  discountPercentage,
  isNewArrival,
  productVariant,
  sku,
} from './helpers';
