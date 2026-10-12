import { describe, expect, it } from 'vitest';
import { DomainError, type ActiveStatus } from '@findeg/domain/common';
import type { CategoryId, VariantId } from '@findeg/domain/catalog';
import {
  eligibleVariants,
  type CandidateVariant,
  type ItemSpecification,
} from '@findeg/domain/school-lists';

const variantId = (n: number) => n as VariantId;
const categoryId = (n: number) => n as CategoryId;

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

function candidate(
  id: number,
  category: number,
  attributes: Record<string, string> = {},
  status: { variant?: ActiveStatus; product?: ActiveStatus } = {},
): CandidateVariant {
  return {
    id: variantId(id),
    attributes,
    status: status.variant ?? 'active',
    product: { categoryId: categoryId(category), status: status.product ?? 'active' },
  };
}

const ids = (variants: readonly CandidateVariant[]) => variants.map((v) => v.id);

const exact = (defaultVariant: number) => ({
  defaultVariantId: variantId(defaultVariant),
  specification: null,
});

function specified(
  defaultVariant: number,
  category: number,
  attributes: Record<string, string>,
): { defaultVariantId: VariantId; specification: ItemSpecification } {
  return {
    defaultVariantId: variantId(defaultVariant),
    specification: { categoryId: categoryId(category), attributes },
  };
}

describe('eligible variants (ADR-0004, CA-4)', () => {
  const candidates = [
    candidate(1, 10, { color: 'blue', size: 'A4' }),
    candidate(2, 10, { color: 'blue', size: 'A5' }),
    candidate(3, 10, { color: 'red', size: 'A4' }),
    candidate(4, 11, { color: 'blue', size: 'A4' }),
    candidate(5, 10, { size: 'A4' }),
  ];

  it('returns only the default variant for an Exact Item', () => {
    expect(ids(eligibleVariants(exact(2), candidates))).toEqual([2]);
  });

  it('returns nothing when the default variant is not a candidate', () => {
    expect(eligibleVariants(exact(99), candidates)).toEqual([]);
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
    expect(eligibleVariants(item, [candidate(5, 10, { size: 'A4' })])).toEqual([]);
  });

  it('excludes a differing value, and does not case-fold', () => {
    const item = specified(1, 10, { color: 'blue' });
    expect(eligibleVariants(item, [candidate(6, 10, { color: 'Blue' })])).toEqual([]);
  });

  it('does not match a different (e.g. child) category', () => {
    expect(eligibleVariants(specified(4, 10, {}), [candidate(4, 11)])).toEqual([]);
  });

  it('allows extra attributes on the variant', () => {
    expect(ids(eligibleVariants(specified(1, 10, { size: 'A4' }), candidates))).toEqual([1, 3, 5]);
  });

  it('matches every variant in the category when no attributes are specified', () => {
    expect(ids(eligibleVariants(specified(1, 10, {}), candidates))).toEqual([1, 2, 3, 5]);
  });

  it('does not treat an inherited property as a variant attribute', () => {
    const item = specified(1, 10, { toString: 'x' });
    expect(eligibleVariants(item, [candidate(1, 10)])).toEqual([]);
  });

  describe('an inactive variant is never eligible', () => {
    it.each([
      ['inactive variant', { variant: 'inactive' as const }],
      ['inactive product', { product: 'inactive' as const }],
    ])('excludes an %s from a specification', (_name, status) => {
      const item = specified(1, 10, {});
      expect(eligibleVariants(item, [candidate(1, 10, {}, status)])).toEqual([]);
    });

    it.each([
      ['inactive variant', { variant: 'inactive' as const }],
      ['inactive product', { product: 'inactive' as const }],
    ])('excludes an Exact Item default on an %s', (_name, status) => {
      expect(eligibleVariants(exact(1), [candidate(1, 10, {}, status)])).toEqual([]);
    });
  });
});
