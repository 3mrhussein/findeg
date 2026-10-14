import type { Sku, VariantId } from '../../../catalog';
import type { CurrencyCode, Money } from '../../../common';
import type { ListOffer, PublicCode, SupplyListId, SupplyListItemId } from '../../../school-lists';
import type { DiscountSource } from '../../types';

/**
 * Where an Order's lines come from: the Cart, or exactly one School Supply List (CO-1). A list
 * Order records the List Offer basis points that applied when it was priced, or `null`.
 */
export type OrderSource =
  | { kind: 'cart' }
  | {
      kind: 'list';
      supplyListId: SupplyListId;
      publicCode: PublicCode;
      listOfferBasisPoints: number | null;
    };

/** Where the lines to price come from: the Cart, or one list with its List Offer, if any. */
export type QuoteSource =
  | { kind: 'cart' }
  | {
      kind: 'list';
      supplyListId: SupplyListId;
      publicCode: PublicCode;
      offer: Pick<ListOffer, 'basisPoints' | 'startsAt' | 'endsAt'> | null;
    };

/** A line to price: a variant at its current catalogue price, and what it fulfils on a list. */
export interface QuoteLineRequest {
  variantId: VariantId;
  productName: string;
  sku: Sku;
  unitPrice: Money;
  quantity: number;
  /** Only on list lines: the item it fulfils and that item's default variant. */
  listItem?: { supplyListItemId: SupplyListItemId; defaultVariantId: VariantId | null };
}

/** Money taken off one line, tagged with where the discount came from (ADR-0007). */
export interface LineDiscount {
  source: DiscountSource;
  amount: Money;
}

/** One priced line. Its name, SKU, unit price and substitute flag are what an Order freezes. */
export interface QuoteLine {
  variantId: VariantId;
  productName: string;
  sku: Sku;
  quantity: number;
  /** The gross price of one unit. */
  unitPrice: Money;
  discounts: readonly LineDiscount[];
  /** What the line costs: its gross less its discounts. */
  lineTotal: Money;
  /** The list item this line fulfils, or `null` on a cart line. */
  supplyListItemId: SupplyListItemId | null;
  /** Whether the chosen variant is not the list item's default, or `null` on a cart line. */
  isSubstitute: boolean | null;
}

/**
 * An Order's money: the net subtotal (the sum of line totals), the discount, the gross subtotal
 * (net + discount), shipping, and the total (net + shipping).
 */
export interface OrderTotals {
  netSubtotal: Money;
  discount: Money;
  grossSubtotal: Money;
  shipping: Money;
  total: Money;
}

/** The authoritative pricing of an Order's lines at one moment, which the Customer confirms. */
export interface Quote {
  source: OrderSource;
  lines: readonly QuoteLine[];
  totals: OrderTotals;
  currency: CurrencyCode;
}
