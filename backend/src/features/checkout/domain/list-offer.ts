/**
 * List Offer arithmetic (ADR-0007). Money is integer piasters and the per-line
 * rounding uses exact BigInt math, so a Customer can recompute a receipt by hand.
 */

export interface OfferWindow {
  startsAt: Date;
  endsAt: Date | null;
}

/** Active when `startsAt <= at < endsAt`; a null end is open-ended. */
export function isOfferActive(offer: OfferWindow, at: Date): boolean {
  return offer.startsAt <= at && (offer.endsAt === null || at < offer.endsAt);
}
