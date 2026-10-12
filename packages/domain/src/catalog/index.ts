/** Catalog vocabulary (GLOSSARY: Exact Item, Allowed Alternative). */
import type { Id } from '../common';

export { CatalogError } from './catalog-error';
export type { CatalogErrorCode } from './catalog-error';
export { sku } from './sku';
export type { Sku } from './sku';

export type ProductId = Id<'Product'>;
export type VariantId = Id<'ProductVariant'>;

/** A sellable variant of a product. Lists and Orders reference variants by id. */
export interface ProductVariant {
  id: VariantId;
  productId: ProductId;
  /** Stock Keeping Unit, unique per variant. */
  sku: string;
  attributes: Readonly<Record<string, string>>;
}
