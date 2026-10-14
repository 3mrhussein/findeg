import { money, multiplyMoney, subtractMoney, type Money } from '../../../common';
import { LIST_OFFER_MAX_BASIS_POINTS, listOfferBasisPoints } from '../../../school-lists';
import type { ListOfferLinePrice } from './types';

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
  const kept = BASIS_POINTS - BigInt(listOfferBasisPoints(basisPoints));
  const lineTotal = money((gross * kept + BASIS_POINTS / 2n) / BASIS_POINTS);
  return { gross, lineTotal, discount: subtractMoney(gross, lineTotal) };
}
