import { DomainError, money, multiplyMoney, subtractMoney, type Money } from '../common';

/** A List Offer percentage in basis points: 100 = 1%. */
export const LIST_OFFER_MIN_BASIS_POINTS = 0;
export const LIST_OFFER_MAX_BASIS_POINTS = 10000;

export class ListOfferError extends DomainError<'INVALID_BASIS_POINTS'> {
  constructor(basisPoints: number) {
    super(
      'INVALID_BASIS_POINTS',
      `A List Offer is a whole number of basis points from ${LIST_OFFER_MIN_BASIS_POINTS} to ${LIST_OFFER_MAX_BASIS_POINTS}, received ${basisPoints}`,
    );
  }
}

/** One line priced under a List Offer: `gross = lineTotal + discount`. */
export interface ListOfferLinePrice {
  gross: Money;
  lineTotal: Money;
  discount: Money;
}

const BASIS_POINTS = BigInt(LIST_OFFER_MAX_BASIS_POINTS);

/**
 * The List Offer line rule (ADR-0007): `lineTotal = roundHalfUp(gross × (10000 − bps) / 10000)`,
 * rounded once for the whole line to two decimals, and `discount = gross − lineTotal`. A line
 * with no offer (`null`) is priced at its gross.
 */
export function priceListOfferLine(
  unitPrice: Money,
  quantity: number,
  basisPoints: number | null,
): ListOfferLinePrice {
  const gross = multiplyMoney(unitPrice, quantity);
  if (basisPoints === null) return { gross, lineTotal: gross, discount: money(0n) };
  if (
    !Number.isInteger(basisPoints) ||
    basisPoints < LIST_OFFER_MIN_BASIS_POINTS ||
    basisPoints > LIST_OFFER_MAX_BASIS_POINTS
  ) {
    throw new ListOfferError(basisPoints);
  }
  const lineTotal = money(
    (gross * (BASIS_POINTS - BigInt(basisPoints)) + BASIS_POINTS / 2n) / BASIS_POINTS,
  );
  return { gross, lineTotal, discount: subtractMoney(gross, lineTotal) };
}
