import { describe, expect, it } from 'vitest';
import { eligibleVariants, toCandidateVariant, toEligibilityItem } from '../index';

const candidate = (overrides: Record<string, unknown> = {}) => ({
  variantId: 5,
  categoryId: 2,
  attributes: { color: 'blue' },
  ...overrides,
});

describe('eligibility mapping', () => {
  it('maps an exact item to a domain item without a specification', () => {
    expect(toEligibilityItem({ variantId: 5, exactItem: true, specification: null })).toMatchObject(
      {
        specification: null,
      },
    );
  });

  it('maps a substitution specification to a domain item', () => {
    expect(
      toEligibilityItem({
        variantId: 5,
        exactItem: false,
        specification: { categoryId: 2, attributes: { color: 'blue' } },
      }),
    ).toMatchObject({ specification: { attributes: { color: 'blue' } } });
  });

  it('marks inactive variants and products as inactive, and defaults to active', () => {
    expect(toCandidateVariant(candidate())).toMatchObject({
      status: 'active',
      product: { status: 'active' },
    });
    expect(toCandidateVariant(candidate({ variantActive: false }))).toMatchObject({
      status: 'inactive',
    });
    expect(toCandidateVariant(candidate({ productActive: false }))).toMatchObject({
      product: { status: 'inactive' },
    });
  });
});

describe('eligibleVariants', () => {
  it('returns only the default for an exact item', () => {
    const pool = [candidate(), candidate({ variantId: 6, attributes: { color: 'red' } })];
    const result = eligibleVariants({ variantId: 5, exactItem: true, specification: null }, pool);
    expect(result.map((c) => c.variantId)).toEqual([5]);
  });

  it('returns substitutes matching the specification and keeps the candidate shape', () => {
    const pool = [
      candidate(),
      candidate({ variantId: 6, attributes: { color: 'red' } }),
      candidate({ variantId: 7, categoryId: 9 }),
    ];
    const result = eligibleVariants(
      {
        variantId: 5,
        exactItem: false,
        specification: { categoryId: 2, attributes: { color: 'blue' } },
      },
      pool,
    );
    expect(result).toEqual([pool[0]]);
  });
});
