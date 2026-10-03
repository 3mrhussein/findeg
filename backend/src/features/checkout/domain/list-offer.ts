/**
 * List Offer arithmetic (ADR-0007). Money is integer piasters and the per-line
 * rounding uses exact BigInt math, so a Customer can recompute a receipt by hand.
 */

const BASIS_POINTS = 10_000n;

/** Converts a catalog `decimal(12,2)` string such as "37.50" to piasters without floating point. */
export function toPiasters(price: string): bigint {
  const [whole, fraction = ''] = price.trim().split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0').slice(0, 2));
}

export function fromPiasters(piasters: bigint): number {
  return Number(piasters) / 100;
}

export interface OfferWindow {
  startsAt: Date;
  endsAt: Date | null;
}

/** Active when `startsAt <= at < endsAt`; a null end is open-ended. */
export function isOfferActive(offer: OfferWindow, at: Date): boolean {
  return offer.startsAt <= at && (offer.endsAt === null || at < offer.endsAt);
}

export interface PricedLine {
  gross: bigint;
  lineTotal: bigint;
  discount: bigint;
}

/** `gross x (10000 - bps) / 10000`, rounded half-up to a piaster once for the whole line. */
export function priceLine(
  unitPrice: bigint,
  quantity: number,
  basisPoints: number | null,
): PricedLine {
  const gross = unitPrice * BigInt(quantity);
  if (basisPoints === null) return { gross, lineTotal: gross, discount: 0n };
  const lineTotal =
    (gross * (BASIS_POINTS - BigInt(basisPoints)) + BASIS_POINTS / 2n) / BASIS_POINTS;
  return { gross, lineTotal, discount: gross - lineTotal };
}
