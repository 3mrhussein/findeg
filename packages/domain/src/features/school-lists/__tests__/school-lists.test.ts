import { describe, expect, it } from 'vitest';
import { DomainError, type ActiveStatus } from '@findeg/domain';
import type { CategoryId, VariantId } from '@findeg/domain/types';
import { BUSINESS_PARTNER_STATUSES, type BusinessPartnerStatus } from '@findeg/domain';
import {
  STAFF_LIST_AUTHORING_ACTIONS,
  assertStaffListAuthoring,
  eligibleVariants,
  generatePublicCode,
  staffListAuthoringAllows,
  isExactItem,
  publicCode,
  supplyListItem,
  type CandidateVariant,
  type ItemSpecification,
  type SupplyListId,
  type SupplyListItemId,
} from '@findeg/domain';

const variantId = (n: number) => n as VariantId;
const categoryId = (n: number) => n as CategoryId;
const listId = (n: number) => n as SupplyListId;
const itemId = (n: number) => n as SupplyListItemId;

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code as string;
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

describe('School Supply List Item', () => {
  const props = {
    id: itemId(1),
    supplyListId: listId(1),
    defaultVariantId: variantId(10),
    specification: null,
    required: true,
    quantity: 3,
  };

  it('is an Exact Item without a specification, and accepts alternatives with one', () => {
    expect(isExactItem(supplyListItem(props))).toBe(true);
    const alternative = supplyListItem({ ...props, ...specified(10, 5, { colour: 'blue' }) });
    expect(isExactItem(alternative)).toBe(false);
  });

  it('may lack its default variant while the list is a draft', () => {
    expect(supplyListItem({ ...props, defaultVariantId: null }).defaultVariantId).toBeNull();
  });

  it.each([1, 2, 999])('accepts quantity %d', (quantity) => {
    expect(supplyListItem({ ...props, quantity }).quantity).toBe(quantity);
  });

  it.each([0, -1, 1000, 1.5, Number.NaN])('refuses quantity %d', (quantity) => {
    expect(codeOf(() => supplyListItem({ ...props, quantity }))).toBe('INVALID_ITEM_QUANTITY');
  });
});

describe('public code (SL-6)', () => {
  const bytes = (values: number[]) => () => Uint8Array.from(values);

  it('is 32 lowercase hex characters from 16 bytes of the supplied random source', () => {
    const requested: number[] = [];
    const random = (length: number) => {
      requested.push(length);
      return Uint8Array.from({ length }, (_, i) => i * 17);
    };
    expect(generatePublicCode(random)).toBe('00112233445566778899aabbccddeeff');
    expect(requested).toEqual([16]);
  });

  it('keeps leading zero nibbles', () => {
    expect(generatePublicCode(bytes(Array.from({ length: 16 }, () => 1)))).toBe('01'.repeat(16));
  });

  it('refuses a random source that returns the wrong number of bytes', () => {
    expect(() => generatePublicCode(bytes([1, 2, 3]))).toThrow(TypeError);
  });

  it('parses a valid code', () => {
    expect(publicCode('a'.repeat(32))).toBe('a'.repeat(32));
  });

  it.each([
    ['too short', 'a'.repeat(31)],
    ['too long', 'a'.repeat(33)],
    ['uppercase', 'A'.repeat(32)],
    ['not hex', 'g'.repeat(32)],
    ['a UUID with dashes', '01234567-89ab-cdef-0123-456789abcdef'],
    ['padded', ` ${'a'.repeat(31)}`],
    ['empty', ''],
  ])('refuses a code that is %s', (_name, text) => {
    expect(codeOf(() => publicCode(text))).toBe('INVALID_PUBLIC_CODE');
  });
});

describe('change: Staff list authoring is its own named rule (ADR-0014), apart from the ADR-0012 table', () => {
  // Characterisation of the Backend's partnerListAuthoring and its lifecycle table.
  const table: Record<BusinessPartnerStatus, { publish: boolean; draft: boolean }> = {
    onboarding: { publish: true, draft: true },
    active: { publish: true, draft: true },
    suspended: { publish: false, draft: true },
    closed: { publish: false, draft: false },
  };

  it('covers every Business Partner status', () => {
    expect(Object.keys(table).sort()).toEqual([...BUSINESS_PARTNER_STATUSES].sort());
    expect(STAFF_LIST_AUTHORING_ACTIONS).toEqual(['draft', 'publish']);
  });

  it.each(BUSINESS_PARTNER_STATUSES)('%s: publishing and drafting', (status) => {
    for (const action of STAFF_LIST_AUTHORING_ACTIONS) {
      expect(staffListAuthoringAllows(status, action), action).toBe(table[status][action]);
      expect(
        codeOf(() => {
          assertStaffListAuthoring(status, action);
        }),
        action,
      ).toBe(table[status][action] ? undefined : 'PARTNER_STATUS_NOT_ALLOWED');
    }
  });
});
