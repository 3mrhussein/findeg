import type { VariantId } from '../../../catalog';
import type { CurrencyCode, Money } from '../../../common';
import type { SupplyListItemId } from '../../../school-lists';
import type { LineDiscount } from '../quote';

/** One line as the Customer confirms it. */
export interface ConfirmationLine {
  /** Only on list lines. */
  supplyListItemId?: SupplyListItemId;
  variantId: VariantId;
  quantity: number;
  unitPrice: Money;
  discounts: readonly LineDiscount[];
  lineTotal: Money;
}

/**
 * The terms a Customer confirms before an Order is accepted (CO-3): the lines with their
 * per-line discounts, the list source with its public code and List Offer, shipping, the
 * totals and the currency. Lines are ordered by list item (or variant on a cart Order), and
 * discounts by source, so equal terms are equal whatever order they were priced in. Checkout
 * digests them; the domain never hashes.
 */
export interface ConfirmationTerms {
  source: 'cart' | 'list';
  /** Only on a list Order. */
  publicCode?: string;
  /** Only on a list Order: the active List Offer, or `null` when none applies. */
  listOfferBasisPoints?: number | null;
  currency: CurrencyCode;
  shipping: Money;
  subtotal: Money;
  total: Money;
  lines: readonly ConfirmationLine[];
}
