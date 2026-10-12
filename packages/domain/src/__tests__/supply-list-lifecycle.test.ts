import { describe, expect, it } from 'vitest';
import { DomainError, type ActiveStatus } from '@findeg/domain/common';
import type { CategoryId, VariantId } from '@findeg/domain/catalog';
import type { StockBalance, Warehouse, WarehouseId } from '@findeg/domain/inventory';
import type { ListOffer, ListOfferId } from '@findeg/domain/orders';
import {
  BUSINESS_PARTNER_STATUSES,
  type BusinessPartnerId,
  type BusinessPartnerStatus,
} from '@findeg/domain/partners';
import {
  SUPPLY_LIST_STATUSES,
  archiveSupplyList,
  assertDraftEditable,
  cloneSupplyList,
  publicCode,
  publishSupplyList,
  type CandidateVariant,
  type PublishSupplyListInput,
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

describe('publishing (SL-3 to SL-5, ADR-0007)', () => {
  const warehouse = (id: number, status: ActiveStatus = 'active'): Warehouse => ({
    id: id as WarehouseId,
    name: `W${id}`,
    status,
  });
  const balance = (variant: number, wh: number, onHand: number, reserved = 0): StockBalance => ({
    variantId: variantId(variant),
    warehouseId: wh as WarehouseId,
    onHand,
    reserved,
  });
  const defaultVariant = (
    id: number,
    over: { category?: number; attributes?: Record<string, string> } & {
      variant?: ActiveStatus;
      product?: ActiveStatus;
    } = {},
  ): CandidateVariant => ({
    id: variantId(id),
    attributes: over.attributes ?? { colour: 'blue' },
    status: over.variant ?? 'active',
    product: { categoryId: (over.category ?? 5) as CategoryId, status: over.product ?? 'active' },
  });

  const NEW_CODE = publicCode('d'.repeat(32));
  const draft = list('draft', { id: listId(2) });
  const draftItems = items.map((item) => ({ ...item, supplyListId: listId(2) }));

  function input(over: Partial<PublishSupplyListInput> = {}): PublishSupplyListInput {
    return {
      list: draft,
      items: draftItems,
      partnerStatus: 'active',
      defaultVariants: [defaultVariant(100), defaultVariant(200)],
      stock: {
        balances: [balance(100, 1, 10), balance(200, 1, 10)],
        warehouses: [warehouse(1)],
      },
      incumbent: null,
      incumbentOffer: null,
      publicCode: NEW_CODE,
      ...over,
    };
  }

  it('publishes a draft with its new public code and no warnings', () => {
    expect(publishSupplyList(input())).toEqual({
      list: { ...draft, status: 'published', publicCode: NEW_CODE },
      replaced: null,
      offer: null,
      warnings: [],
    });
  });

  it.each(['published', 'archived'] as const)('refuses a %s list', (status) => {
    expect(codeOf(() => publishSupplyList(input({ list: list(status) })))).toBe('NOT_DRAFT');
  });

  describe('over every Business Partner status, for a first publish and a replacement', () => {
    const allowed: Record<BusinessPartnerStatus, boolean> = {
      onboarding: true,
      active: true,
      suspended: false,
      closed: false,
    };
    const incumbent = list('published', { id: listId(1) });
    const clone = { ...draft, sourceListId: incumbent.id };

    it('covers every status', () => {
      expect(Object.keys(allowed).sort()).toEqual([...BUSINESS_PARTNER_STATUSES].sort());
    });

    it.each(BUSINESS_PARTNER_STATUSES)('%s', (partnerStatus) => {
      const code = allowed[partnerStatus] ? undefined : 'PARTNER_STATUS_NOT_ALLOWED';
      expect(codeOf(() => publishSupplyList(input({ partnerStatus })))).toBe(code);
      expect(
        codeOf(() => publishSupplyList(input({ partnerStatus, list: clone, incumbent }))),
      ).toBe(code);
    });

    it('checks the partner status before the list status', () => {
      const published = input({ partnerStatus: 'closed', list: list('published') });
      expect(codeOf(() => publishSupplyList(published))).toBe('PARTNER_STATUS_NOT_ALLOWED');
    });
  });

  describe('preconditions on the items', () => {
    it('refuses an empty list', () => {
      expect(codeOf(() => publishSupplyList(input({ items: [] })))).toBe('EMPTY_LIST');
    });

    it('refuses an item with no default variant', () => {
      const missing = [{ ...draftItems[0], defaultVariantId: null }, draftItems[1]];
      expect(codeOf(() => publishSupplyList(input({ items: missing })))).toBe(
        'DEFAULT_UNAVAILABLE',
      );
    });

    it('refuses a default variant it was not given', () => {
      const given = input({ defaultVariants: [defaultVariant(200)] });
      expect(codeOf(() => publishSupplyList(given))).toBe('DEFAULT_UNAVAILABLE');
    });

    it.each([
      ['an inactive variant', { variant: 'inactive' as const }],
      ['an inactive product', { product: 'inactive' as const }],
    ])('refuses a default that is %s', (_name, status) => {
      const given = input({ defaultVariants: [defaultVariant(100, status), defaultVariant(200)] });
      expect(codeOf(() => publishSupplyList(given))).toBe('DEFAULT_UNAVAILABLE');
    });

    it.each([
      ['another category', { category: 6 }],
      ['a differing attribute', { attributes: { colour: 'red' } }],
      ['a missing attribute', { attributes: {} }],
    ])('refuses a default that fails its own specification: %s', (_name, over) => {
      const given = input({ defaultVariants: [defaultVariant(100), defaultVariant(200, over)] });
      expect(codeOf(() => publishSupplyList(given))).toBe('DEFAULT_INELIGIBLE');
    });

    it('accepts an exact matching default, with extra attributes', () => {
      const extra = defaultVariant(200, { attributes: { colour: 'blue', size: 'A4' } });
      const given = input({ defaultVariants: [defaultVariant(100), extra] });
      expect(publishSupplyList(given).list.status).toBe('published');
    });

    it('reports an unavailable default before an ineligible one, and both before the slot', () => {
      const taken = { incumbent: list('published', { id: listId(1) }) };
      const ineligible = [defaultVariant(100), defaultVariant(200, { category: 6 })];
      const missing = [{ ...draftItems[0], defaultVariantId: null }, draftItems[1]];
      expect(
        codeOf(() =>
          publishSupplyList(input({ ...taken, items: missing, defaultVariants: ineligible })),
        ),
      ).toBe('DEFAULT_UNAVAILABLE');
      expect(
        codeOf(() => publishSupplyList(input({ ...taken, defaultVariants: ineligible }))),
      ).toBe('DEFAULT_INELIGIBLE');
      expect(codeOf(() => publishSupplyList(input({ ...taken, items: [] })))).toBe('EMPTY_LIST');
    });
  });

  describe('an out-of-stock default only warns', () => {
    it.each([
      ['no stock rows', []],
      ['nothing on hand', [balance(100, 1, 0)]],
      ['everything reserved', [balance(100, 1, 5, 5)]],
      ['stock only in an inactive warehouse', [balance(100, 2, 5)]],
    ])('%s', (_name, balances) => {
      const stock = {
        balances: [...balances, balance(200, 1, 3)],
        warehouses: [warehouse(1), warehouse(2, 'inactive')],
      };
      const published = publishSupplyList(input({ stock }));
      expect(published.list.status).toBe('published');
      expect(published.warnings).toEqual([
        { code: 'DEFAULT_OUT_OF_STOCK', supplyListItemId: itemId(11), variantId: variantId(100) },
      ]);
    });

    it('sums available stock across active warehouses', () => {
      const stock = {
        balances: [balance(100, 1, 0), balance(100, 2, 2, 1), balance(200, 1, 1)],
        warehouses: [warehouse(1), warehouse(2)],
      };
      expect(publishSupplyList(input({ stock })).warnings).toEqual([]);
    });
  });

  describe('one published list per partner, academic year and grade', () => {
    const incumbent = list('published', { id: listId(1) });
    const offer: ListOffer = {
      id: 40 as ListOfferId,
      supplyListId: incumbent.id,
      basisPoints: 1500,
      startsAt: new Date('2026-10-01T00:00:00.000Z'),
      endsAt: new Date('2026-12-01T00:00:00.000Z'),
    };

    it('refuses a list that is not a copy of the published list in its slot', () => {
      expect(codeOf(() => publishSupplyList(input({ incumbent })))).toBe('SLOT_TAKEN');
    });

    it('refuses a copy of an older version, so it cannot displace a newer list', () => {
      const olderCopy = { ...draft, sourceListId: listId(0) };
      expect(codeOf(() => publishSupplyList(input({ list: olderCopy, incumbent })))).toBe(
        'SLOT_TAKEN',
      );
    });

    it('replaces the published list it was copied from, archiving it (List Replacement)', () => {
      const clone = { ...draft, sourceListId: incumbent.id };
      const published = publishSupplyList(input({ list: clone, incumbent }));
      expect(published.list).toEqual({
        ...clone,
        status: 'published',
        publicCode: NEW_CODE,
        replacesListId: incumbent.id,
      });
      expect(published.replaced).toEqual({
        ...incumbent,
        status: 'archived',
        replacedById: clone.id,
      });
      expect(published.offer).toBeNull();
    });

    it("copies the replaced list's List Offer verbatim onto the replacement", () => {
      const clone = { ...draft, sourceListId: incumbent.id };
      const published = publishSupplyList(input({ list: clone, incumbent, incumbentOffer: offer }));
      expect(published.offer).toEqual({
        supplyListId: clone.id,
        basisPoints: 1500,
        startsAt: offer.startsAt,
        endsAt: offer.endsAt,
      });
    });

    it('copies an open-ended offer', () => {
      const clone = { ...draft, sourceListId: incumbent.id };
      const open = { ...offer, endsAt: null };
      const published = publishSupplyList(input({ list: clone, incumbent, incumbentOffer: open }));
      expect(published.offer?.endsAt).toBeNull();
    });

    it('a clone edited into another slot publishes beside its source', () => {
      const clone = { ...draft, grade: 'Grade 2', sourceListId: incumbent.id };
      const published = publishSupplyList(input({ list: clone }));
      expect(published.list).toMatchObject({ sourceListId: incumbent.id, replacesListId: null });
      expect(published.replaced).toBeNull();
    });

    it('a clone of an archived version publishes into an empty slot without replacing', () => {
      const revived = { ...draft, sourceListId: listId(1) };
      const published = publishSupplyList(input({ list: revived }));
      expect(published.list.replacesListId).toBeNull();
      expect(published.replaced).toBeNull();
    });

    it.each([
      ['in another slot', { ...incumbent, grade: 'Grade 2' }],
      ['not published', { ...incumbent, status: 'archived' as const }],
    ])('treats an incumbent %s as a caller error', (_name, wrong) => {
      expect(() => publishSupplyList(input({ incumbent: wrong }))).toThrow(TypeError);
    });

    it("treats an offer that is not the incumbent's as a caller error", () => {
      const clone = { ...draft, sourceListId: incumbent.id };
      const foreign = { ...offer, supplyListId: listId(99) };
      expect(() =>
        publishSupplyList(input({ list: clone, incumbent, incumbentOffer: foreign })),
      ).toThrow(TypeError);
    });
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
