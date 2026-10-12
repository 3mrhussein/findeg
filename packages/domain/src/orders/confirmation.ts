import type { VariantId } from '../catalog';
import { DomainError, type CurrencyCode, type Money } from '../common';
import type { SupplyListItemId } from '../school-lists';
import type { LineDiscount, Quote } from './quote';

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

/** The Confirmation terms of a Quote. */
export function confirmationTerms(quote: Quote): ConfirmationTerms {
  const { source, totals } = quote;
  const lines = quote.lines
    .map((line): ConfirmationLine => ({
      ...(line.supplyListItemId === null ? {} : { supplyListItemId: line.supplyListItemId }),
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discounts: [...line.discounts].sort((a, b) => a.source.localeCompare(b.source)),
      lineTotal: line.lineTotal,
    }))
    .sort(
      (a, b) =>
        (a.supplyListItemId ?? a.variantId) - (b.supplyListItemId ?? b.variantId) ||
        a.variantId - b.variantId,
    );
  return {
    source: source.kind,
    ...(source.kind === 'list'
      ? { publicCode: source.publicCode, listOfferBasisPoints: source.listOfferBasisPoints }
      : {}),
    currency: quote.currency,
    shipping: totals.shipping,
    subtotal: totals.netSubtotal,
    total: totals.total,
    lines,
  };
}

/** The terms changed since the Customer confirmed them; they must confirm the fresh Quote. */
export class ReconfirmationRequiredError extends DomainError<'RECONFIRMATION_REQUIRED'> {
  readonly quote: Quote;

  constructor(quote: Quote) {
    super(
      'RECONFIRMATION_REQUIRED',
      'The Order terms changed since they were confirmed; confirm the new Quote',
    );
    this.quote = quote;
  }
}

/**
 * Same terms or reconfirm (CO-3): a fresh Quote is accepted only when its terms digest to the
 * confirmation the Customer gave. `digestTerms` is checkout's digest, passed in.
 */
export function confirmQuote(
  quote: Quote,
  confirmation: string,
  digestTerms: (terms: ConfirmationTerms) => string,
): Quote {
  if (digestTerms(confirmationTerms(quote)) !== confirmation) {
    throw new ReconfirmationRequiredError(quote);
  }
  return quote;
}
