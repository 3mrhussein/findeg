import type { ActiveStatus, Id, LocalizedText, Money } from '../common';
import * as constants from './constants';

declare const stockKeepingUnit: unique symbol;

/**
 * A Stock Keeping Unit: the code that names one Product Variant. It is any non-empty text with
 * no surrounding whitespace; FindEg has no SKU format. Uniqueness is the store's to enforce.
 */
export type Sku = string & { readonly [stockKeepingUnit]: 'Sku' };

export type CatalogErrorCode = 'INVALID_SKU' | 'COMPARE_AT_PRICE_NOT_ABOVE_PRICE';

export type ProductId = Id<'Product'>;
export type VariantId = Id<'ProductVariant'>;
export type CategoryId = Id<'Category'>;
export type BrandId = Id<'Brand'>;
export type CollectionId = Id<'Collection'>;
export type TagId = Id<'Tag'>;
export type AttributeId = Id<'Attribute'>;

/**
 * An item FindEg sells. It sits in one Category, has an optional Brand and carries Tags.
 * Customers buy its variants, never the product itself.
 */
export interface Product {
  id: ProductId;
  name: LocalizedText;
  description: LocalizedText | null;
  categoryId: CategoryId;
  brandId: BrandId | null;
  tagIds: readonly TagId[];
  status: ActiveStatus;
}

/** The data a Product Variant is made from, with its SKU still as plain text. */
export type ProductVariantProps = Omit<ProductVariant, 'sku'> & { sku: string };

/**
 * One buyable version of a Product, such as a colour or size. A product's variants are listed
 * in display order, which decides its Default Variant when none is flagged.
 */
export interface ProductVariant {
  id: VariantId;
  productId: ProductId;
  sku: Sku;
  /** What tells this variant apart from its siblings, e.g. "Blue, A4". */
  label: LocalizedText | null;
  /** Attribute key → value, e.g. `{ colour: 'blue' }`. Specifications match on these. */
  attributes: Readonly<Record<string, string>>;
  price: Money;
  /** The strike-through "was" price. When present it is always above `price`. */
  compareAtPrice: Money | null;
  /** The variant shown first for its product. */
  isDefault: boolean;
  status: ActiveStatus;
}

/** A node in the strict category tree, such as Stationery › Notebooks. */
export interface Category {
  id: CategoryId;
  /** The parent category, or `null` for a top-level category. */
  parentId: CategoryId | null;
  name: LocalizedText;
  status: ActiveStatus;
}

/** The manufacturer of a Product. */
export interface Brand {
  id: BrandId;
  name: LocalizedText;
  status: ActiveStatus;
}

export type TagScope = (typeof constants.TAG_SCOPES)[number];

/**
 * A cross-cutting label in a tag group, such as `campaign` / `new-arrival`. Filters combine
 * tags in one group with OR and tags in different groups with AND.
 */
export interface Tag {
  id: TagId;
  group: string;
  key: string;
  scope: TagScope;
  status: ActiveStatus;
}

/** A marketing grouping, filled by the products that carry any of its tags. */
export interface Collection {
  id: CollectionId;
  title: LocalizedText;
  tagIds: readonly TagId[];
  status: ActiveStatus;
}

export type AttributeDataType = (typeof constants.ATTRIBUTE_DATA_TYPES)[number];

/**
 * A named, typed property such as colour or paper weight. Its values sit on variants under its
 * `key`, and drive filters and School Supply List Specifications.
 */
export interface Attribute {
  id: AttributeId;
  key: string;
  name: LocalizedText;
  dataType: AttributeDataType;
  /** The unit its values are in, e.g. `gsm`, or `null`. */
  unit: string | null;
  /** The allowed values of an `enum` attribute; empty for other types. */
  allowedValues: readonly string[];
}
