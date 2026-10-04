import { createHash } from 'node:crypto';
import { fromPiasters } from './piasters';

export interface QuoteConfirmationDiscount {
  source: string;
  amount: bigint;
}

export interface QuoteConfirmationLine {
  listItemId?: number;
  variantId: number;
  quantity: number;
  unitPrice: bigint;
  discounts: QuoteConfirmationDiscount[];
  lineTotal: bigint;
}

export interface QuoteConfirmationTerms {
  source?: 'cart' | 'list';
  publicCode?: string;
  /** Active List Offer, so an offer starting, ending or changing invalidates the digest. */
  listOfferBasisPoints?: number | null;
  /**
   * The Partner's current Reward Rate (null when none). Only List checkout supplies it, so a rate
   * change between Quote and acceptance forces reconfirmation without appearing in the Quote DTO.
   */
  rewardRate?: { id: number; pointsPerEgp: string; egpPerPoint: string } | null;
  currency: string;
  shipping: bigint;
  subtotal: bigint;
  total: bigint;
  lines: QuoteConfirmationLine[];
}

/**
 * Computes a deterministic SHA-256 digest of quote terms (ADR-0005). Amounts are piasters; the digest
 * hashes their decimal form, so it matches the digest produced before Quotes moved to BigInt.
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
      unitPrice: fromPiasters(line.unitPrice),
      discounts: [...line.discounts]
        .sort((a, b) => a.source.localeCompare(b.source))
        .map((d) => ({
          source: d.source,
          amount: fromPiasters(d.amount),
        })),
      lineTotal: fromPiasters(line.lineTotal),
    }));

  const payload = {
    ...(terms.source ? { source: terms.source, publicCode: terms.publicCode ?? null } : {}),
    ...(terms.listOfferBasisPoints === undefined
      ? {}
      : { listOfferBasisPoints: terms.listOfferBasisPoints }),
    ...(terms.rewardRate === undefined ? {} : { rewardRate: terms.rewardRate }),
    currency: terms.currency,
    shipping: fromPiasters(terms.shipping),
    subtotal: fromPiasters(terms.subtotal),
    total: fromPiasters(terms.total),
    lines: normalizedLines,
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
