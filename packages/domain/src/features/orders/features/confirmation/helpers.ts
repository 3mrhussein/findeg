import { DomainError } from '../../../common';
import type { Quote } from '../quote';
import type { ConfirmationTerms, ConfirmationLine } from './types';

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
