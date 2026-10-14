import { DomainError, type Money, moneyToDecimal } from '../common';
import { NEW_ARRIVAL_TAG_KEY } from './constants';
import type { CatalogErrorCode, ProductVariant, ProductVariantProps, Sku, Tag } from './types';

/** A catalogue entry that breaks a catalogue rule. */
export class CatalogError extends DomainError<CatalogErrorCode> {}

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

/**
 * A Product Variant from catalogue data. The SKU must be non-empty with no surrounding
 * whitespace, and a compare-at price must be above the price, so a strike-through price is
 * always a real saving.
 */
export function productVariant(props: ProductVariantProps): ProductVariant {
  checkCompareAtPrice(props.price, props.compareAtPrice);
  return { ...props, sku: sku(props.sku) };
}

/**
 * The compare-at rule on its own: a compare-at price, when present, must be strictly above the
 * price. Equal prices are refused, so no strike-through shows without a saving.
 */
export function checkCompareAtPrice(price: Money, compareAtPrice: Money | null): void {
  if (compareAtPrice !== null && compareAtPrice <= price) {
    throw new CatalogError(
      'COMPARE_AT_PRICE_NOT_ABOVE_PRICE',
      `Compare-at price ${moneyToDecimal(compareAtPrice)} must be above the price ${moneyToDecimal(price)}`,
    );
  }
}

/**
 * A product's Default Variant: the variant flagged default, otherwise the first in display
 * order. Being inactive does not stop a flagged variant being the default. A product with no
 * variants has none.
 */
export function defaultVariant<V extends Pick<ProductVariant, 'isDefault'>>(
  variants: readonly V[],
): V | undefined {
  return variants.find((variant) => variant.isDefault) ?? variants[0];
}

/**
 * The saving a compare-at price shows, as a whole percentage of the compare-at price, rounded
 * half up: `round((compareAt - price) / compareAt x 100)`. It is 0 with no compare-at price.
 */
export function discountPercentage(
  variant: Pick<ProductVariant, 'price' | 'compareAtPrice'>,
): number {
  const { compareAtPrice, price } = variant;
  if (compareAtPrice === null || compareAtPrice <= price) return 0;
  const saving = compareAtPrice - price;
  // Half up in whole numbers: floor((2 x saving x 100 + compareAt) / (2 x compareAt)).
  return Number((2n * saving * 100n + compareAtPrice) / (2n * compareAtPrice));
}

/** A product is a New Arrival when it carries the `new-arrival` tag. Its age plays no part. */
export function isNewArrival(productTags: readonly Pick<Tag, 'key'>[]): boolean {
  return productTags.some((tag) => tag.key === NEW_ARRIVAL_TAG_KEY);
}
