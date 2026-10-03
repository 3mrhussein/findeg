import { createHash } from 'node:crypto';

export interface QuoteConfirmationDiscount {
  source: string;
  amount: number;
}

export interface QuoteConfirmationLine {
  listItemId?: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  discounts: QuoteConfirmationDiscount[];
  lineTotal: number;
}

export interface QuoteConfirmationTerms {
  source?: 'cart' | 'list';
  publicCode?: string;
  currency: string;
  shipping: number;
  subtotal: number;
  total: number;
  lines: QuoteConfirmationLine[];
}

/**
 * Computes a deterministic SHA-256 digest of quote terms (ADR-0005).
 * Stable for equal inputs regardless of line ordering.
 * Changes if any term (price, variant, quantity, shipping, discount, currency) changes.
 */
export function computeConfirmation(terms: QuoteConfirmationTerms): string {
  const normalizedLines = [...terms.lines]
    .sort(
      (a, b) =>
        (a.listItemId ?? a.variantId) - (b.listItemId ?? b.variantId) || a.variantId - b.variantId,
    )
    .map((line) => ({
      ...(line.listItemId === undefined ? {} : { listItemId: line.listItemId }),
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: Number(line.unitPrice.toFixed(2)),
      discounts: [...line.discounts]
        .sort((a, b) => a.source.localeCompare(b.source))
        .map((d) => ({
          source: d.source,
          amount: Number(d.amount.toFixed(2)),
        })),
      lineTotal: Number(line.lineTotal.toFixed(2)),
    }));

  const payload = {
    ...(terms.source ? { source: terms.source, publicCode: terms.publicCode ?? null } : {}),
    currency: terms.currency,
    shipping: Number(terms.shipping.toFixed(2)),
    subtotal: Number(terms.subtotal.toFixed(2)),
    total: Number(terms.total.toFixed(2)),
    lines: normalizedLines,
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
