/** List Offer activity window (ADR-0007). Piaster pricing lives in `piasters.ts`. */
export interface OfferWindow {
  startsAt: Date;
  endsAt: Date | null;
}

/** Active when `startsAt <= at < endsAt`; a null end is open-ended. */
export function isOfferActive(offer: OfferWindow, at: Date): boolean {
  return offer.startsAt <= at && (offer.endsAt === null || at < offer.endsAt);
}
