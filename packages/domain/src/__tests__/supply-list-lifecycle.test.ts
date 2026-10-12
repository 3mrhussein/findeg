import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import type { CategoryId, VariantId } from '@findeg/domain/catalog';
import type { BusinessPartnerId } from '@findeg/domain/partners';
import {
  SUPPLY_LIST_STATUSES,
  archiveSupplyList,
  assertDraftEditable,
  cloneSupplyList,
  publicCode,
  type SchoolSupplyList,
  type SchoolSupplyListItem,
  type SupplyListId,
  type SupplyListItemId,
  type SupplyListStatus,
} from '@findeg/domain/school-lists';

const variantId = (n: number) => n as VariantId;
const listId = (n: number) => n as SupplyListId;
const itemId = (n: number) => n as SupplyListItemId;

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

const CODE = publicCode('c'.repeat(32));

function list(status: SupplyListStatus, over: Partial<SchoolSupplyList> = {}): SchoolSupplyList {
  return {
    id: listId(1),
    businessPartnerId: 7 as BusinessPartnerId,
    academicYear: '2026/2027',
    grade: 'Grade 1',
    title: { en: 'Grade 1' },
    status,
    publicCode: status === 'draft' ? null : CODE,
    sourceListId: null,
    replacesListId: null,
    replacedById: null,
    ...over,
  };
}

const items: SchoolSupplyListItem[] = [
  {
    id: itemId(11),
    supplyListId: listId(1),
    defaultVariantId: variantId(100),
    specification: null,
    required: true,
    quantity: 2,
  },
  {
    id: itemId(12),
    supplyListId: listId(1),
    defaultVariantId: variantId(200),
    specification: { categoryId: 5 as CategoryId, attributes: { colour: 'blue' } },
    required: false,
    quantity: 1,
  },
];

describe('list lifecycle over every list status (SL-1, SL-2)', () => {
  // Draft → Published → Archived; clone only from a non-draft; archive only from published.
  const table: Record<SupplyListStatus, { edit: boolean; clone: boolean; archive: boolean }> = {
    draft: { edit: true, clone: false, archive: false },
    published: { edit: false, clone: true, archive: true },
    archived: { edit: false, clone: true, archive: false },
  };

  it('covers every list status', () => {
    expect(Object.keys(table).sort()).toEqual([...SUPPLY_LIST_STATUSES].sort());
  });

  it.each(SUPPLY_LIST_STATUSES)('%s: edit, clone and archive', (status) => {
    const allowed = table[status];
    expect(codeOf(() => assertDraftEditable(list(status), 'active'))).toBe(
      allowed.edit ? undefined : 'NOT_DRAFT',
    );
    expect(codeOf(() => cloneSupplyList(list(status), items, 'active'))).toBe(
      allowed.clone ? undefined : 'INVALID_TRANSITION',
    );
    expect(codeOf(() => archiveSupplyList(list(status)))).toBe(
      allowed.archive ? undefined : 'INVALID_TRANSITION',
    );
  });
});

describe('editing a draft', () => {
  it('checks the partner status before the list status', () => {
    expect(codeOf(() => assertDraftEditable(list('published'), 'closed'))).toBe(
      'PARTNER_STATUS_NOT_ALLOWED',
    );
  });

  it.each(['onboarding', 'active', 'suspended'] as const)('is allowed while %s', (status) => {
    expect(codeOf(() => assertDraftEditable(list('draft'), status))).toBeUndefined();
  });
});

describe('cloning', () => {
  it('makes a fresh draft that records its source and copies the authoring fields only', () => {
    const source = list('published', { id: listId(3), replacesListId: listId(2) });
    const clone = cloneSupplyList(source, items, 'active');
    expect(clone.list).toEqual({
      businessPartnerId: source.businessPartnerId,
      academicYear: '2026/2027',
      grade: 'Grade 1',
      title: { en: 'Grade 1' },
      status: 'draft',
      publicCode: null,
      sourceListId: listId(3),
      replacesListId: null,
      replacedById: null,
    });
    expect(clone.items).toEqual([
      { defaultVariantId: variantId(100), specification: null, required: true, quantity: 2 },
      {
        defaultVariantId: variantId(200),
        specification: { categoryId: 5, attributes: { colour: 'blue' } },
        required: false,
        quantity: 1,
      },
    ]);
  });

  it('can clone an archived version', () => {
    const archived = list('archived', { replacedById: listId(9) });
    expect(cloneSupplyList(archived, items, 'active').list.sourceListId).toBe(archived.id);
  });

  it.each([
    ['suspended', undefined],
    ['closed', 'PARTNER_STATUS_NOT_ALLOWED'],
  ] as const)('is drafting, so a %s partner gives %s', (status, code) => {
    expect(codeOf(() => cloneSupplyList(list('published'), items, status))).toBe(code);
  });

  it('does not share the specification with the source', () => {
    const clone = cloneSupplyList(list('published'), items, 'active');
    expect(clone.items[1].specification).not.toBe(items[1].specification);
  });
});

describe('archiving', () => {
  it('archives a published list without a replacement', () => {
    expect(archiveSupplyList(list('published'))).toEqual(list('archived'));
  });

  it('never un-archives', () => {
    expect(codeOf(() => archiveSupplyList(list('archived')))).toBe('INVALID_TRANSITION');
  });
});
