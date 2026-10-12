import { moneyToDecimal, type Money } from '../common';
import { CatalogError } from './catalog-error';
import { sku } from './sku';
import type { ProductVariant } from './index';

/** The data a Product Variant is made from, with its SKU still as plain text. */
export type ProductVariantProps = Omit<ProductVariant, 'sku'> & { sku: string };

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
