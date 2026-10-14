import type { Money } from '../../../common';

/** One line priced under a List Offer: `gross = lineTotal + discount`. */
export interface ListOfferLinePrice {
  gross: Money;
  lineTotal: Money;
  discount: Money;
}
