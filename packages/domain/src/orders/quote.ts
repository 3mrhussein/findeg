import type { Sku, VariantId } from '../catalog';
import {
  DEFAULT_CURRENCY,
  ZERO_MONEY,
  addMoney,
  moneyFromDecimal,
  sumMoney,
  type CurrencyCode,
  type Money,
} from '../common';
import {
  isSubstitute,
  listOfferBasisPointsAt,
  type ListOffer,
  type PublicCode,
  type SupplyListId,
  type SupplyListItemId,
} from '../school-lists';
import type { DiscountSource } from './index';
import { priceListOfferLine } from './list-offer-pricing';
import { OrderError } from './order-error';

/** The flat delivery fee on every Order. */
export const FLAT_SHIPPING_FEE: Money = moneyFromDecimal('50.00');

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

const LIST_OFFER: DiscountSource = 'list-offer';

/**
 * Prices an Order's lines at the moment `at` (ADR-0007). Cart lines of the same variant are
 * merged, in the order they first appear; list lines are ordered by list item. A list's offer,
 * when active at `at`, is applied to every line alike by the List Offer line rule and tagged
 * `list-offer` when it takes anything off. Shipping is the flat fee.
 */
export function priceQuote(
  source: QuoteSource,
  requests: readonly QuoteLineRequest[],
  at: Date,
): Quote {
  if (requests.length === 0) {
    throw new OrderError('EMPTY_ORDER', 'An Order needs at least one line');
  }
  for (const request of requests) requireSource(source, request);
  if (source.kind === 'cart') {
    const lines = mergeByVariant(requests).map((request) => priceLine(request, null));
    return quoteOf({ kind: 'cart' }, lines);
  }
  const basisPoints = listOfferBasisPointsAt(source.offer, at);
  const lines = [...requests]
    .sort((a, b) => a.listItem!.supplyListItemId - b.listItem!.supplyListItemId)
    .map((request) => priceLine(request, basisPoints));
  const { supplyListId, publicCode } = source;
  return quoteOf(
    { kind: 'list', supplyListId, publicCode, listOfferBasisPoints: basisPoints },
    lines,
  );
}

function quoteOf(source: OrderSource, lines: readonly QuoteLine[]): Quote {
  return { source, lines, totals: totalsOf(lines, FLAT_SHIPPING_FEE), currency: DEFAULT_CURRENCY };
}

function requireSource(source: QuoteSource, request: QuoteLineRequest): void {
  if ((source.kind === 'list') !== (request.listItem !== undefined)) {
    throw new OrderError(
      'MIXED_ORDER_SOURCE',
      'An Order comes from the Cart or from exactly one School Supply List, never both',
    );
  }
  if (!Number.isInteger(request.quantity) || request.quantity < 1) {
    throw new OrderError(
      'INVALID_LINE_QUANTITY',
      `An Order line holds a positive whole number of units, received ${request.quantity}`,
    );
  }
}

function mergeByVariant(requests: readonly QuoteLineRequest[]): QuoteLineRequest[] {
  const merged = new Map<VariantId, QuoteLineRequest>();
  for (const request of requests) {
    const existing = merged.get(request.variantId);
    merged.set(
      request.variantId,
      existing ? { ...existing, quantity: existing.quantity + request.quantity } : request,
    );
  }
  return [...merged.values()];
}

function priceLine(request: QuoteLineRequest, basisPoints: number | null): QuoteLine {
  const { lineTotal, discount } = priceListOfferLine(
    request.unitPrice,
    request.quantity,
    basisPoints,
  );
  return {
    variantId: request.variantId,
    productName: request.productName,
    sku: request.sku,
    quantity: request.quantity,
    unitPrice: request.unitPrice,
    discounts: discount > ZERO_MONEY ? [{ source: LIST_OFFER, amount: discount }] : [],
    lineTotal,
    supplyListItemId: request.listItem?.supplyListItemId ?? null,
    isSubstitute: request.listItem ? isSubstitute(request.listItem, request.variantId) : null,
  };
}

function totalsOf(lines: readonly QuoteLine[], shipping: Money): OrderTotals {
  const netSubtotal = sumMoney(lines.map((line) => line.lineTotal));
  const discount = sumMoney(lines.flatMap((line) => line.discounts.map((d) => d.amount)));
  return {
    netSubtotal,
    discount,
    grossSubtotal: addMoney(netSubtotal, discount),
    shipping,
    total: addMoney(netSubtotal, shipping),
  };
}
