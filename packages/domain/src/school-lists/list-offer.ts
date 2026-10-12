import { DomainError, type Id } from '../common';
import type { SupplyListId } from './index';

export type ListOfferId = Id<'ListOffer'>;

/** A percentage discount on one School Supply List, active for a time window. Basis points: 100 = 1%. */
export interface ListOffer {
  id: ListOfferId;
  supplyListId: SupplyListId;
  basisPoints: number;
  startsAt: Date;
  endsAt: Date | null;
}

/** A List Offer percentage in basis points: 100 = 1%. */
export const LIST_OFFER_MIN_BASIS_POINTS = 0;
export const LIST_OFFER_MAX_BASIS_POINTS = 10000;

export type ListOfferErrorCode = 'INVALID_BASIS_POINTS' | 'INVALID_LIST_OFFER_WINDOW';

/** A List Offer, or a price under one, that breaks a List Offer rule (ADR-0007). */
export class ListOfferError extends DomainError<ListOfferErrorCode> {
  constructor(code: ListOfferErrorCode, message: string) {
    super(code, message);
  }
}

/** A List Offer's basis points, refused unless they are a whole number from 0 to 10000. */
export function listOfferBasisPoints(basisPoints: number): number {
  if (
    !Number.isInteger(basisPoints) ||
    basisPoints < LIST_OFFER_MIN_BASIS_POINTS ||
    basisPoints > LIST_OFFER_MAX_BASIS_POINTS
  ) {
    throw new ListOfferError(
      'INVALID_BASIS_POINTS',
      `A List Offer is a whole number of basis points from ${LIST_OFFER_MIN_BASIS_POINTS} to ${LIST_OFFER_MAX_BASIS_POINTS}, received ${basisPoints}`,
    );
  }
  return basisPoints;
}

/** The time window of a List Offer. A `null` end is open-ended. */
export type ListOfferWindow = Pick<ListOffer, 'startsAt' | 'endsAt'>;

const isValidDate = (date: Date) => date instanceof Date && !Number.isNaN(date.getTime());

/**
 * A List Offer, checked (ADR-0007): a whole number of basis points from 0 to 10000, and a
 * window whose end, when set, is after its start. Staff may set it on a list at any time.
 */
export function listOffer<O extends ListOffer>(props: O): O {
  const { basisPoints, startsAt, endsAt } = props;
  listOfferBasisPoints(basisPoints);
  if (!isValidDate(startsAt) || (endsAt !== null && (!isValidDate(endsAt) || endsAt <= startsAt))) {
    throw new ListOfferError(
      'INVALID_LIST_OFFER_WINDOW',
      'A List Offer starts at a valid time and, when it ends, ends after it starts',
    );
  }
  return { ...props };
}

/** A List Offer applies at `at` when `startsAt ≤ at` and, unless it is open-ended, `at < endsAt`. */
export function isListOfferActive(offer: ListOfferWindow, at: Date): boolean {
  return offer.startsAt <= at && (offer.endsAt === null || at < offer.endsAt);
}

/**
 * The basis points a list's offer takes off at `at`, or `null` when there is no offer or it is
 * not active. They apply to every line of the List Selection alike, whether the line is the
 * default or a substitute and whether or not the list is complete.
 */
export function listOfferBasisPointsAt(
  offer: (ListOfferWindow & Pick<ListOffer, 'basisPoints'>) | null,
  at: Date,
): number | null {
  return offer !== null && isListOfferActive(offer, at) ? offer.basisPoints : null;
}
