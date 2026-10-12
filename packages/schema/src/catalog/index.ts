/** Catalog vocabulary (GLOSSARY: Exact Item, Allowed Alternative). */

/** A sellable variant of a product. Lists and Orders reference variants by id. */
export interface ProductVariant {
  id: number;
  productId: number;
  /** Stock Keeping Unit, unique per variant. */
  sku: string;
  attributes: Readonly<Record<string, string>>;
}
