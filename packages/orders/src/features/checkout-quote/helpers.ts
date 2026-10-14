import { createHash } from 'node:crypto';
import { confirmationTerms, moneyToDecimal, type Quote } from '@findeg/domain';
import type { ConfirmationTerms } from '@findeg/domain/types';
import type { CheckoutQuote } from '../checkout-input/types';

/** Checkout owns digest policy; Domain supplies canonical terms and decides reconfirmation. */
export function computeConfirmation(terms: ConfirmationTerms): string {
  const payload = {
    ...terms,
    shipping: moneyToDecimal(terms.shipping),
    subtotal: moneyToDecimal(terms.subtotal),
    total: moneyToDecimal(terms.total),
    lines: terms.lines.map((line) => ({
      ...line,
      unitPrice: moneyToDecimal(line.unitPrice),
      discounts: line.discounts.map((discount) => ({
        ...discount,
        amount: moneyToDecimal(discount.amount),
      })),
      lineTotal: moneyToDecimal(line.lineTotal),
    })),
  };
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/** HTTP amounts are exact decimal strings; Domain keeps Money throughout pricing. */
export function toCheckoutQuote(quote: Quote): CheckoutQuote {
  return {
    lines: quote.lines.map((line) => ({
      ...(line.supplyListItemId === null ? {} : { listItemId: line.supplyListItemId }),
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: moneyToDecimal(line.unitPrice),
      discounts: line.discounts.map((d) => ({
        source: d.source,
        amount: moneyToDecimal(d.amount),
      })),
      lineTotal: moneyToDecimal(line.lineTotal),
    })),
    shipping: moneyToDecimal(quote.totals.shipping),
    subtotal: moneyToDecimal(quote.totals.netSubtotal),
    total: moneyToDecimal(quote.totals.total),
    currency: quote.currency,
    confirmation: computeConfirmation(confirmationTerms(quote)),
  };
}
