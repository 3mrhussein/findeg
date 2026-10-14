import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import {
  LIST_OFFER_MAX_BASIS_POINTS,
  LIST_OFFER_MIN_BASIS_POINTS,
  ListOfferError,
  isListOfferActive,
  listOffer,
  listOfferBasisPointsAt,
  type ListOffer,
  type ListOfferId,
  type SupplyListId,
} from '@findeg/domain/school-lists';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code as string;
    throw error;
  }
}

const startsAt = new Date('2026-10-01T00:00:00.000Z');
const endsAt = new Date('2026-11-01T00:00:00.000Z');
const before = (date: Date) => new Date(date.getTime() - 1);

const offer: ListOffer = {
  id: 1 as ListOfferId,
  supplyListId: 2 as SupplyListId,
  basisPoints: 1500,
  startsAt,
  endsAt,
};

describe('List Offer (ADR-0007)', () => {
  describe('validity', () => {
    it.each([0, 1, 1500, 10000])('accepts %d basis points', (basisPoints) => {
      expect(listOffer({ ...offer, basisPoints })).toEqual({ ...offer, basisPoints });
    });

    it.each([-1, 10001, 1.5, Number.NaN])('refuses %d basis points', (basisPoints) => {
      expect(codeOf(() => listOffer({ ...offer, basisPoints }))).toBe('INVALID_BASIS_POINTS');
    });

    it('bounds an offer from 0 to 10000 basis points', () => {
      expect([LIST_OFFER_MIN_BASIS_POINTS, LIST_OFFER_MAX_BASIS_POINTS]).toEqual([0, 10000]);
    });

    it.each([
      ['its basis points', { basisPoints: 10001 }],
      ['its window', { endsAt: startsAt }],
    ])('refuses a bad offer for %s with a ListOfferError', (_name, over) => {
      expect(() => listOffer({ ...offer, ...over })).toThrow(ListOfferError);
    });

    it('accepts an open-ended offer', () => {
      expect(listOffer({ ...offer, endsAt: null }).endsAt).toBeNull();
    });

    it.each([
      ['ends when it starts', { endsAt: startsAt }],
      ['ends before it starts', { endsAt: before(startsAt) }],
      ['has an invalid start', { startsAt: new Date(Number.NaN) }],
      ['has an invalid end', { endsAt: new Date(Number.NaN) }],
    ])('refuses an offer that %s', (_name, over) => {
      expect(codeOf(() => listOffer({ ...offer, ...over }))).toBe('INVALID_LIST_OFFER_WINDOW');
    });
  });

  describe('window: startsAt ≤ at < endsAt', () => {
    it.each([
      ['just before the start', before(startsAt), false],
      ['at the start', startsAt, true],
      ['just before the end', before(endsAt), true],
      ['at the end', endsAt, false],
    ])('%s: active is %s', (_name, at, active) => {
      expect(isListOfferActive(offer, at)).toBe(active);
      expect(listOfferBasisPointsAt(offer, at)).toBe(active ? 1500 : null);
    });

    it('treats a null end as open-ended', () => {
      const open = { ...offer, endsAt: null };
      expect(isListOfferActive(open, new Date('2099-01-01T00:00:00.000Z'))).toBe(true);
      expect(isListOfferActive(open, before(startsAt))).toBe(false);
    });

    it('gives no basis points when the list has no offer', () => {
      expect(listOfferBasisPointsAt(null, startsAt)).toBeNull();
    });
  });
});
