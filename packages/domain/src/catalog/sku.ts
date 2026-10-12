import { CatalogError } from './catalog-error';

declare const stockKeepingUnit: unique symbol;

/**
 * A Stock Keeping Unit: the code that names one Product Variant. It is any non-empty text with
 * no surrounding whitespace; FindEg has no SKU format. Uniqueness is the store's to enforce.
 */
export type Sku = string & { readonly [stockKeepingUnit]: 'Sku' };

/** A SKU from its text, as written. Blank or padded text is refused, never trimmed. */
export function sku(text: string): Sku {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected a SKU as a string, received ${typeof text}`);
  }
  if (text.length === 0 || text.trim() !== text) {
    throw new CatalogError(
      'INVALID_SKU',
      `Invalid SKU ${JSON.stringify(text)}: expected non-empty text with no surrounding whitespace`,
    );
  }
  return text as Sku;
}
