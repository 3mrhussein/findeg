import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchoolSupplyListReader } from '../index';

const mocks = vi.hoisted(() => ({
  getPublicSupplyListByCode: vi.fn(),
  findVariantCandidates:
    vi.fn<(_tx: unknown, filter: { categoryId?: number }) => Promise<unknown>>(),
  getVariantDisplayDetails: vi.fn(),
  getAvailableQuantities: vi.fn(),
  getListOffer: vi.fn(),
}));

vi.mock('@findeg/db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@findeg/db')>()),
  ...mocks,
}));

const CODE = '0123456789abcdef0123456789abcdef';
const transaction = vi.fn((run: (tx: unknown) => unknown) => run({}));
const db = { transaction } as never;
const reader = () => new SchoolSupplyListReader(() => Promise.resolve().then(() => db));

const found = (overrides: Record<string, unknown> = {}, items: unknown[] = []) => ({
  list: {
    id: 7,
    status: 'published',
    grade: 'Grade 5',
    academicYear: '2026-2027',
    localizedTitle: { en: 'Grade 5' },
    localizedDescription: null,
    heroImageUrl: null,
  },
  school: { id: 3, nameEn: 'Nile School', nameAr: 'مدرسة النيل', logoUrl: null },
  replacementPublicCode: null,
  items,
  ...overrides,
});

const specItem = {
  id: 11,
  variantId: 5,
  exactItem: false,
  specification: { categoryId: 2, attributes: {} },
  required: true,
  quantity: 2,
  localizedLabel: { en: 'Notebook' },
  localizedNote: null,
};

const details = (variantId: number, productName = { en: 'Notebook' }) => ({
  variantId,
  sku: `SKU-${String(variantId)}`,
  productName,
  variantLabel: { en: 'Blue' },
  brandName: null,
  price: '50.00',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findVariantCandidates.mockImplementation((_tx, filter) =>
    Promise.resolve().then(() =>
      filter.categoryId !== undefined
        ? [
            { variantId: 5, categoryId: 2, attributes: { color: 'blue' } },
            { variantId: 6, categoryId: 2, attributes: { color: 'red' } },
          ]
        : [{ variantId: 5, categoryId: 2, attributes: { color: 'blue' } }],
    ),
  );
  mocks.getVariantDisplayDetails.mockImplementation((_tx, ids: number[]) =>
    Promise.resolve().then(() => ids.map((id) => details(id))),
  );
  mocks.getAvailableQuantities.mockResolvedValue(new Map([[5, 4]]));
  mocks.getListOffer.mockResolvedValue(null);
});

describe('SchoolSupplyListReader', () => {
  it('answers not-found for a malformed public code without reading', async () => {
    expect(await reader().getByPublicCode('nope')).toEqual({ success: false, error: 'not-found' });
    expect(transaction).not.toHaveBeenCalled();
  });

  it('answers not-found when no list has the code', async () => {
    mocks.getPublicSupplyListByCode.mockResolvedValue(null);
    expect(await reader().getByPublicCode(CODE)).toEqual({ success: false, error: 'not-found' });
  });

  it('returns a published list with its eligible substitutes and stock flags', async () => {
    mocks.getPublicSupplyListByCode.mockResolvedValue(found({}, [specItem]));
    const result = await reader().getByPublicCode(CODE);
    expect(result).toMatchObject({
      success: true,
      data: {
        publicCode: CODE,
        status: 'published',
        offer: null,
        items: [
          {
            id: 11,
            defaultVariant: { variantId: 5, sku: 'SKU-5', price: '50.00', inStock: true },
            eligibleVariants: [
              expect.objectContaining({ variantId: 5, differingAttributes: {} }),
              expect.objectContaining({
                variantId: 6,
                inStock: false,
                differingAttributes: { color: 'red' },
              }),
            ],
          },
        ],
      },
    });
  });

  it('reports archived lists and an active List Offer', async () => {
    mocks.getPublicSupplyListByCode.mockResolvedValue(
      found({ list: { ...found().list, status: 'archived' }, replacementPublicCode: CODE }, []),
    );
    mocks.getListOffer.mockResolvedValue({
      basisPoints: 500,
      startsAt: new Date('2020-01-01T00:00:00Z'),
      endsAt: null,
    });
    const result = await reader().getByPublicCode(CODE);
    expect(result).toMatchObject({
      success: true,
      data: {
        status: 'archived',
        replacementPublicCode: CODE,
        offer: { basisPoints: 500, startsAt: '2020-01-01T00:00:00.000Z', endsAt: null },
      },
    });
  });

  it('drops items whose default variant was deleted and uses exact items as-is', async () => {
    mocks.getPublicSupplyListByCode.mockResolvedValue(
      found({}, [
        { ...specItem, id: 12, variantId: null },
        { ...specItem, id: 13, exactItem: true, specification: null },
      ]),
    );
    const result = await reader().getByPublicCode(CODE);
    expect(result.success && result.data.items.map((item) => item.id)).toEqual([13]);
  });

  it('fails loudly when a visible variant has no display details', async () => {
    mocks.getPublicSupplyListByCode.mockResolvedValue(found({}, [specItem]));
    mocks.getVariantDisplayDetails.mockResolvedValue([]);
    await expect(reader().getByPublicCode(CODE)).rejects.toThrow('missing from the list read');
  });
});
