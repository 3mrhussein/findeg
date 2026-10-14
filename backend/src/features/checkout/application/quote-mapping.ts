import { moneyToDecimal } from '@findeg/domain';
import { confirmationTerms, type Quote } from '@findeg/domain';
import { computeConfirmation } from '../domain/confirmation';
import type { CheckoutQuote } from '../schemas';

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
