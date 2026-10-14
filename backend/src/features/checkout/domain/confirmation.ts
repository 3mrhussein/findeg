import { createHash } from 'node:crypto';
import { moneyToDecimal } from '@findeg/domain';
import type { ConfirmationTerms } from '@findeg/domain/types';

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
