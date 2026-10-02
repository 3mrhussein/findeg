import { describe, expect, it } from 'vitest';
import {
  eligibleVariants,
  type EligibilityCandidate,
  type EligibilityItem,
} from '../domain/eligibleVariants';

function candidate(
  variantId: number,
  categoryId: number,
  attributes: Record<string, string> = {},
): EligibilityCandidate {
  return { variantId, categoryId, attributes };
}

const ids = (variants: EligibilityCandidate[]) => variants.map((v) => v.variantId);

function specified(
  variantId: number,
  categoryId: number,
  attributes: Record<string, string>,
): EligibilityItem {
  return { variantId, exactItem: false, specification: { categoryId, attributes } };
}

describe('eligibleVariants', () => {
  const candidates = [
    candidate(1, 10, { color: 'blue', size: 'A4' }),
    candidate(2, 10, { color: 'blue', size: 'A5' }),
    candidate(3, 10, { color: 'red', size: 'A4' }),
    candidate(4, 11, { color: 'blue', size: 'A4' }),
    candidate(5, 10, { size: 'A4' }),
  ];

  it('returns only the default variant for an Exact Item', () => {
    const item: EligibilityItem = {
      variantId: 2,
      exactItem: true,
      specification: { categoryId: 10, attributes: { color: 'blue' } },
    };
    expect(ids(eligibleVariants(item, candidates))).toEqual([2]);
  });

  it('fails closed to the default variant when there is no specification', () => {
    const item: EligibilityItem = { variantId: 3, exactItem: false, specification: null };
    expect(ids(eligibleVariants(item, candidates))).toEqual([3]);
  });

  it('returns nothing when the default variant is not a candidate (inactive)', () => {
    const item: EligibilityItem = { variantId: 99, exactItem: true, specification: null };
    expect(eligibleVariants(item, candidates)).toEqual([]);
  });

  it('matches category exactly and every specified attribute by string equality', () => {
    expect(ids(eligibleVariants(specified(1, 10, { color: 'blue' }), candidates))).toEqual([1, 2]);
  });

  it('requires all specified attributes', () => {
    const item = specified(1, 10, { color: 'blue', size: 'A4' });
    expect(ids(eligibleVariants(item, candidates))).toEqual([1]);
  });

  it('excludes variants missing a specified attribute', () => {
    const item = specified(1, 10, { color: 'blue' });
    expect(ids(eligibleVariants(item, [candidate(5, 10, { size: 'A4' })]))).toEqual([]);
  });

  it('excludes a differing value, and does not case-fold', () => {
    const item = specified(1, 10, { color: 'blue' });
    expect(ids(eligibleVariants(item, [candidate(6, 10, { color: 'Blue' })]))).toEqual([]);
  });

  it('does not match a different (e.g. child) category', () => {
    expect(ids(eligibleVariants(specified(4, 10, {}), [candidate(4, 11)]))).toEqual([]);
  });

  it('allows extra attributes on the variant', () => {
    expect(ids(eligibleVariants(specified(1, 10, { size: 'A4' }), candidates))).toEqual([1, 3, 5]);
  });

  it('matches every variant in the category when no attributes are specified', () => {
    expect(ids(eligibleVariants(specified(1, 10, {}), candidates))).toEqual([1, 2, 3, 5]);
  });
});
