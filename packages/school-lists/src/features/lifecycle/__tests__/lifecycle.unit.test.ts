import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchoolSupplyListService } from '../index';
import { PERMISSION_CODES } from '@findeg/db';
import type { SupplyListStaffActor } from '../../../types';

const mocks = vi.hoisted(() => ({
  getSupplyList: vi.fn(),
  lockSupplyList: vi.fn(),
  lockSupplyListPartner: vi.fn(),
  getSupplyListItems: vi.fn(),
  insertSupplyListDraft: vi.fn(),
  insertSupplyListItem: vi.fn(),
  updateSupplyListDraft: vi.fn(),
  updateSupplyListItem: vi.fn(),
  deleteSupplyListItem: vi.fn(),
  getSupplyListDefaults: vi.fn(),
  findVariantCandidates: vi.fn(),
  getPublishedSupplyListInSlot: vi.fn(),
  getListOffer: vi.fn(),
  getSupplyListStockFacts: vi.fn(),
  snapshotSupplyListItem: vi.fn(),
  archiveSupplyList: vi.fn(),
  publishSupplyList: vi.fn(),
  upsertListOffer: vi.fn(),
  deleteListOffer: vi.fn(),
  listSupplyListsForPartner: vi.fn(),
  isSupplyListSlotTakenError: vi.fn(() => false),
}));

vi.mock('@findeg/db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@findeg/db')>()),
  ...mocks,
}));

const staff = (
  permissionCodes: string[] = [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE],
): SupplyListStaffActor => ({
  kind: 'staff',
  userId: 1,
  permissionCodes,
});

const list = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  businessPartnerId: 3,
  grade: 'Grade 5',
  academicYear: '2026-2027',
  localizedTitle: { en: 'Grade 5 list' },
  localizedDescription: null,
  heroImageUrl: null,
  status: 'draft',
  publicCode: null,
  sourceListId: null,
  replacesListId: null,
  replacedById: null,
  publishedAt: null,
  archivedAt: null,
  createdAt: new Date('2026-10-01T10:00:00Z'),
  updatedAt: new Date('2026-10-01T10:00:00Z'),
  ...overrides,
});

const item = (overrides: Record<string, unknown> = {}) => ({
  id: 11,
  listId: 7,
  variantId: 5,
  exactItem: false,
  specification: null,
  required: true,
  quantity: 1,
  localizedLabel: { en: 'Notebook' },
  localizedNote: null,
  sortOrder: 0,
  productNameEnSnapshot: null,
  productNameArSnapshot: null,
  skuSnapshot: null,
  createdAt: new Date('2026-10-01T10:00:00Z'),
  updatedAt: new Date('2026-10-01T10:00:00Z'),
  ...overrides,
});

const fakeDb = { transaction: (run: (tx: unknown) => unknown) => run({}) };
const service = () =>
  new SchoolSupplyListService(
    async () => fakeDb as never,
    () => new Date('2026-10-14T00:00:00Z'),
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isSupplyListSlotTakenError.mockReturnValue(false);
  mocks.getSupplyList.mockResolvedValue(list());
  mocks.lockSupplyList.mockResolvedValue(list());
  mocks.lockSupplyListPartner.mockResolvedValue({ id: 3, status: 'active' });
  mocks.getSupplyListItems.mockResolvedValue([item()]);
  mocks.insertSupplyListDraft.mockResolvedValue(list());
  mocks.insertSupplyListItem.mockResolvedValue(item());
  mocks.updateSupplyListDraft.mockResolvedValue(list({ grade: 'Grade 6' }));
  mocks.updateSupplyListItem.mockResolvedValue(item());
  mocks.deleteSupplyListItem.mockResolvedValue(item());
  mocks.getSupplyListDefaults.mockResolvedValue([]);
  mocks.findVariantCandidates.mockResolvedValue([]);
  mocks.getPublishedSupplyListInSlot.mockResolvedValue(null);
  mocks.getListOffer.mockResolvedValue(null);
  mocks.getSupplyListStockFacts.mockResolvedValue({ balances: [], warehouses: [] });
  mocks.listSupplyListsForPartner.mockResolvedValue([list()]);
});

describe('SchoolSupplyListService authorization and input', () => {
  it('refuses writes without the write permission and reads without any Staff permission', async () => {
    const reader = staff([]);
    expect(await service().createDraft(reader, {} as never)).toEqual({
      success: false,
      error: 'forbidden',
    });
    expect(await service().getById(reader, 7)).toEqual({ success: false, error: 'forbidden' });
  });

  it('rejects malformed input before touching the database', async () => {
    expect(await service().createDraft(staff(), { businessPartnerId: 'x' } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().removeItem(staff(), 0, 1)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(mocks.getSupplyList).not.toHaveBeenCalled();
  });
});

describe('SchoolSupplyListService draft authoring', () => {
  it('creates a draft for an active Partner School and returns it with its items', async () => {
    const result = await service().createDraft(staff(), {
      businessPartnerId: 3,
      grade: 'Grade 5',
      academicYear: '2026-2027',
      localizedTitle: { en: 'Grade 5 list' },
    } as never);
    expect(result.success).toBe(true);
    expect(mocks.insertSupplyListDraft).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ data: { id: 7, items: [expect.objectContaining({ id: 11 })] } });
  });

  it('reports a missing Partner School', async () => {
    mocks.lockSupplyListPartner.mockResolvedValueOnce(null);
    const result = await service().createDraft(staff(), {
      businessPartnerId: 3,
      grade: 'Grade 5',
      academicYear: '2026-2027',
      localizedTitle: { en: 'Grade 5 list' },
    } as never);
    expect(result).toEqual({ success: false, error: 'partner-school-not-found' });
  });

  it('reports not-found when the list does not exist', async () => {
    mocks.getSupplyList.mockResolvedValueOnce(null);
    expect(await service().updateDraft(staff(), 7, { grade: 'Grade 6' } as never)).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('refuses to edit a list that is no longer a draft', async () => {
    mocks.getSupplyList.mockResolvedValue(list({ status: 'published' }));
    mocks.lockSupplyList.mockResolvedValue(list({ status: 'published' }));
    expect(await service().updateDraft(staff(), 7, { grade: 'Grade 6' } as never)).toEqual({
      success: false,
      error: 'not-draft',
    });
  });

  it('updates a draft and returns the aggregate', async () => {
    const result = await service().updateDraft(staff(), 7, { grade: 'Grade 6' } as never);
    expect(result).toMatchObject({
      success: true,
      data: { grade: 'Grade 6', items: [expect.anything()] },
    });
  });

  it('clears the specification of an exact item when adding it', async () => {
    await service().addItem(staff(), 7, {
      exactItem: true,
      specification: { categoryId: 2, attributes: { size: 'A4' } },
      variantId: 5,
      required: true,
      quantity: 1,
      localizedLabel: { en: 'Notebook' },
    } as never);
    expect(mocks.insertSupplyListItem).toHaveBeenCalledWith(
      expect.anything(),
      7,
      expect.objectContaining({ specification: null }),
    );
  });

  it('reports a missing item on update and remove', async () => {
    expect(await service().updateItem(staff(), 7, 999, { quantity: 2 } as never)).toEqual({
      success: false,
      error: 'item-not-found',
    });
    mocks.deleteSupplyListItem.mockResolvedValueOnce(null);
    expect(await service().removeItem(staff(), 7, 999)).toEqual({
      success: false,
      error: 'item-not-found',
    });
  });

  it('updates an item and clears its specification when it becomes exact', async () => {
    mocks.getSupplyListItems.mockResolvedValue([item({ id: 11, exactItem: false })]);
    await service().updateItem(staff(), 7, 11, { exactItem: true } as never);
    expect(mocks.updateSupplyListItem).toHaveBeenCalledWith(
      expect.anything(),
      7,
      11,
      expect.objectContaining({ specification: null }),
    );
  });

  it('removes an item', async () => {
    expect(await service().removeItem(staff(), 7, 11)).toEqual({ success: true, data: undefined });
  });

  it('reorders all items once each, in the requested order', async () => {
    mocks.getSupplyListItems.mockResolvedValue([item({ id: 11 }), item({ id: 12 })]);
    const result = await service().reorderItems(staff(), 7, [12, 11]);
    expect(result.success).toBe(true);
    expect(mocks.updateSupplyListItem).toHaveBeenNthCalledWith(1, expect.anything(), 7, 12, {
      sortOrder: 0,
    });
    expect(mocks.updateSupplyListItem).toHaveBeenNthCalledWith(2, expect.anything(), 7, 11, {
      sortOrder: 1,
    });
  });

  it('rejects reorders that repeat, omit or invent item IDs', async () => {
    mocks.getSupplyListItems.mockResolvedValue([item({ id: 11 }), item({ id: 12 })]);
    expect(await service().reorderItems(staff(), 7, [11, 11])).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().reorderItems(staff(), 7, [11])).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().reorderItems(staff(), 7, [11, 99])).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });
});

describe('SchoolSupplyListService publication and archive', () => {
  it('publishes a draft, snapshots its items and records the public code', async () => {
    mocks.getSupplyListDefaults.mockResolvedValue([
      { variantId: 5, sku: 'NB-1', localizedName: { en: 'Notebook', ar: 'دفتر' } },
    ]);
    mocks.findVariantCandidates.mockResolvedValue([
      { variantId: 5, categoryId: 2, attributes: {}, variantActive: true, productActive: true },
    ]);
    mocks.getSupplyListStockFacts.mockResolvedValue({ balances: [], warehouses: [] });
    mocks.publishSupplyList.mockImplementation(async (_tx, id, publicCode) =>
      list({ id, status: 'published', publicCode }),
    );
    const result = await service().publish(staff(), 7);
    expect(result.success).toBe(true);
    expect(mocks.snapshotSupplyListItem).toHaveBeenCalledWith(expect.anything(), 11, {
      productNameEnSnapshot: 'Notebook',
      productNameArSnapshot: 'دفتر',
      skuSnapshot: 'NB-1',
    });
    expect(mocks.publishSupplyList).toHaveBeenCalledOnce();
  });

  it('reports a slot taken by a concurrent publication', async () => {
    mocks.publishSupplyList.mockRejectedValueOnce(new Error('slot'));
    mocks.isSupplyListSlotTakenError.mockReturnValueOnce(true);
    mocks.getSupplyListDefaults.mockResolvedValue([
      { variantId: 5, sku: 'NB-1', localizedName: { en: 'Notebook' } },
    ]);
    mocks.findVariantCandidates.mockResolvedValue([
      { variantId: 5, categoryId: 2, attributes: {}, variantActive: true, productActive: true },
    ]);
    mocks.getSupplyListStockFacts.mockResolvedValue({ balances: [], warehouses: [] });
    expect(await service().publish(staff(), 7)).toEqual({ success: false, error: 'slot-taken' });
  });

  it('archives a published list and returns it', async () => {
    mocks.getSupplyList.mockResolvedValue(
      list({ status: 'published', publicCode: '0123456789abcdef0123456789abcdef' }),
    );
    mocks.lockSupplyList.mockResolvedValue(
      list({ status: 'published', publicCode: '0123456789abcdef0123456789abcdef' }),
    );
    mocks.archiveSupplyList.mockResolvedValue(list({ status: 'archived' }));
    const result = await service().archive(staff(), 7);
    expect(result).toMatchObject({ success: true, data: { status: 'archived' } });
  });
});

describe('SchoolSupplyListService reads and offers', () => {
  it('reads a list by ID and lists a partner’s versions', async () => {
    expect(await service().getById(staff(), 7)).toMatchObject({ success: true, data: { id: 7 } });
    expect(await service().listForPartner(staff(), 3)).toEqual({ success: true, data: [list()] });
    expect(await service().listForPartner(staff(), 0)).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('returns null when a list has no offer, and sets or clears one', async () => {
    expect(await service().getOffer(staff(), 7)).toEqual({ success: true, data: null });
    mocks.upsertListOffer.mockResolvedValue({ listId: 7, basisPoints: 500 });
    const offer = { basisPoints: 500, startsAt: new Date('2026-10-01T00:00:00Z'), endsAt: null };
    expect(await service().setOffer(staff(), 7, offer as never)).toMatchObject({
      success: true,
      data: { basisPoints: 500 },
    });
    expect(await service().setOffer(staff(), 7, { basisPoints: -1 } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().clearOffer(staff(), 7)).toEqual({ success: true, data: undefined });
    expect(mocks.deleteListOffer).toHaveBeenCalledOnce();
  });

  it('clones a published list into a new draft with its items', async () => {
    mocks.getSupplyList.mockResolvedValue(
      list({ status: 'published', publicCode: '0123456789abcdef0123456789abcdef' }),
    );
    mocks.lockSupplyList.mockResolvedValue(
      list({ status: 'published', publicCode: '0123456789abcdef0123456789abcdef' }),
    );
    mocks.insertSupplyListDraft.mockResolvedValue(list({ id: 8 }));
    const result = await service().cloneToDraft(staff(), 7);
    expect(result.success).toBe(true);
    expect(mocks.insertSupplyListDraft).toHaveBeenCalledOnce();
    expect(mocks.insertSupplyListItem).toHaveBeenCalledOnce();
  });
});

describe('SchoolSupplyListService remaining rejections', () => {
  it('rejects malformed input for clone, update, item and reorder commands', async () => {
    expect(await service().cloneToDraft(staff(), 7, { grade: 1 } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().updateDraft(staff(), 7, { grade: 1 } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().addItem(staff(), 7, { quantity: 0 } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().updateItem(staff(), 7, 11, { quantity: 0 } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().updateItem(staff(), 7, 0, {} as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().reorderItems(staff(), 7, [0] as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service().setOffer(staff(), 7, { basisPoints: 500 } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('refuses authoring when the Partner School status forbids it', async () => {
    mocks.lockSupplyListPartner.mockResolvedValue({ id: 3, status: 'suspended' });
    mocks.getSupplyList.mockResolvedValue(list());
    mocks.lockSupplyList.mockResolvedValue(list());
    expect(await service().publish(staff(), 7)).toEqual({
      success: false,
      error: 'partner-status-not-allowed',
    });
  });

  it('reports a missing list for a clone and a missing item for a reorder', async () => {
    mocks.getSupplyList.mockResolvedValueOnce(null);
    expect(await service().cloneToDraft(staff(), 7)).toEqual({
      success: false,
      error: 'not-found',
    });
    mocks.lockSupplyListPartner.mockResolvedValueOnce(null);
    expect(await service().getById(staff(), 7)).toEqual({
      success: false,
      error: 'partner-school-not-found',
    });
  });

  it('publishing over an incumbent archives it and records the replacement', async () => {
    mocks.getSupplyList.mockResolvedValue(list({ sourceListId: 6 }));
    mocks.lockSupplyList.mockResolvedValue(list({ sourceListId: 6 }));
    mocks.getPublishedSupplyListInSlot.mockResolvedValue(
      list({
        id: 6,
        status: 'published',
        publicCode: '1123456789abcdef0123456789abcdef',
        publishedAt: new Date('2026-09-01T00:00:00Z'),
      }),
    );
    mocks.getSupplyListDefaults.mockResolvedValue([
      { variantId: 5, sku: 'NB-1', localizedName: { en: 'Notebook' } },
    ]);
    mocks.findVariantCandidates.mockResolvedValue([
      { variantId: 5, categoryId: 2, attributes: {}, variantActive: true, productActive: true },
    ]);
    mocks.getSupplyListStockFacts.mockResolvedValue({ balances: [], warehouses: [] });
    mocks.publishSupplyList.mockImplementation(async (_tx, id, publicCode) =>
      list({ id, status: 'published', publicCode }),
    );
    const result = await service().publish(staff(), 7);
    expect(result.success).toBe(true);
    expect(mocks.archiveSupplyList).toHaveBeenCalledWith(expect.anything(), 6, expect.any(Date), 7);
  });
});

describe('SchoolSupplyListService branch coverage', () => {
  it('clones with default options and adds non-exact items unchanged', async () => {
    mocks.getSupplyList.mockResolvedValue(
      list({ status: 'archived', publicCode: '0123456789abcdef0123456789abcdef' }),
    );
    mocks.lockSupplyList.mockResolvedValue(
      list({ status: 'archived', publicCode: '0123456789abcdef0123456789abcdef' }),
    );
    mocks.insertSupplyListDraft.mockResolvedValue(list({ id: 9 }));
    expect((await service().cloneToDraft(staff(), 7)).success).toBe(true);
    const substitution = {
      exactItem: false,
      specification: { categoryId: 2, attributes: {} },
      variantId: 5,
      required: true,
      quantity: 1,
      localizedLabel: { en: 'Notebook' },
    };
    mocks.lockSupplyList.mockResolvedValue(list());
    expect(await service().addItem(staff(), 7, substitution as never)).toMatchObject({
      success: true,
    });
  });

  it('keeps the specification of a non-exact item when only its quantity changes', async () => {
    mocks.getSupplyListItems.mockResolvedValue([
      item({ id: 11, exactItem: false, specification: { categoryId: 2, attributes: {} } }),
    ]);
    await service().updateItem(staff(), 7, 11, { quantity: 3 } as never);
    expect(mocks.updateSupplyListItem).toHaveBeenLastCalledWith(expect.anything(), 7, 11, {
      quantity: 3,
    });
  });

  it('reports a list that vanished between the first read and the lock', async () => {
    mocks.lockSupplyList.mockResolvedValueOnce(null);
    expect(await service().archive(staff(), 7)).toEqual({ success: false, error: 'not-found' });
  });

  it('returns the List Offer when one exists', async () => {
    mocks.getListOffer.mockResolvedValue({
      listId: 7,
      basisPoints: 500,
      startsAt: new Date(),
      endsAt: null,
    });
    expect(await service().getOffer(staff(), 7)).toMatchObject({
      success: true,
      data: { basisPoints: 500 },
    });
  });

  it('rethrows technical publication failures so the transaction rolls back', async () => {
    mocks.getSupplyListDefaults.mockResolvedValue([
      { variantId: 5, sku: 'NB-1', localizedName: { en: 'Notebook' } },
    ]);
    mocks.findVariantCandidates.mockResolvedValue([
      { variantId: 5, categoryId: 2, attributes: {}, variantActive: true, productActive: true },
    ]);
    mocks.getSupplyListStockFacts.mockResolvedValue({ balances: [], warehouses: [] });
    mocks.publishSupplyList.mockRejectedValueOnce(new Error('connection lost'));
    await expect(service().publish(staff(), 7)).rejects.toThrow('connection lost');
  });
});
