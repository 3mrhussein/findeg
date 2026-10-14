import {
  DEFAULT_CURRENCY,
  LINE_QUANTITY_MAX,
  LINE_QUANTITY_MIN,
  ZERO_MONEY,
  addMoney,
  isLineQuantity,
  sumMoney,
  type Money,
} from '../../../common';
import type { VariantId } from '../../../catalog';
import { isSubstitute, listOfferBasisPointsAt } from '../../../school-lists';
import { OrderError } from '../../helpers';
import { priceListOfferLine } from '../list-offer-pricing';
import { FLAT_SHIPPING_FEE, LIST_OFFER } from './constants';
import type {
  OrderSource,
  OrderTotals,
  Quote,
  QuoteLine,
  QuoteLineRequest,
  QuoteSource,
} from './types';

/**
 * Prices an Order's lines at the moment `at` (ADR-0007). Each line holds 1 to 999 units. Cart
 * lines of the same variant are merged, in the order they first appear, and the merged line
 * holds 1 to 999 units too; list lines are ordered by list item. A list's offer,
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
    const merged = mergeByVariant(requests);
    for (const request of merged) requireLineQuantity(request.quantity);
    const lines = merged.map((request) => priceLine(request, null));
    return quoteOf({ kind: 'cart' }, lines);
  }
  const basisPoints = listOfferBasisPointsAt(source.offer, at);
  const lines = [...requests]
    .sort((a, b) => (a.listItem?.supplyListItemId ?? 0) - (b.listItem?.supplyListItemId ?? 0))
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
  requireLineQuantity(request.quantity);
}

function requireLineQuantity(quantity: number): void {
  if (!isLineQuantity(quantity)) {
    throw new OrderError(
      'INVALID_LINE_QUANTITY',
      `An Order line holds ${String(LINE_QUANTITY_MIN)} to ${String(LINE_QUANTITY_MAX)} units, received ${String(quantity)}`,
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
