import { describe, expect, it, vi } from 'vitest';
import {
  buildGeneratedProductVariants,
  buildVariantKeyUpdates,
  mapAdminProductEditData,
  mapAdminProductListResult,
} from '../index';

vi.mock('@findeg/db/queries', () => ({}));

const listRow = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  categoryId: 2,
  isActive: true,
  hasImages: true,
  defaultVariantPrice: 10,
  defaultVariantSku: 'SKU-1',
  localizedName: { en: 'Pen', ar: 'قلم' },
  ...overrides,
});

describe('mapAdminProductListResult', () => {
  it('derives a completeness status from the first failing check', () => {
    const result = mapAdminProductListResult({
      rows: [
        listRow(),
        listRow({ id: 2, categoryId: null }),
        listRow({ id: 3, isActive: false }),
        listRow({ id: 4, hasImages: false }),
        listRow({ id: 5, defaultVariantPrice: 0 }),
        listRow({ id: 6, defaultVariantSku: null, localizedName: { en: 'Pen' } }),
      ],
      total: 6,
      page: 1,
      pageSize: 20,
    } as never);
    expect(result.total).toBe(6);
    expect(result.products.map((p) => p.completeness)).toEqual([
      'complete',
      'no-category',
      'draft',
      'no-images',
      'no-price',
      'complete',
    ]);
    expect(result.products[5].sku).toBe('');
    expect(result.products[5].localizedName).toEqual({ en: 'Pen', ar: '' });
  });
});

describe('mapAdminProductEditData', () => {
  it('converts prices to numbers, nests localized content and flattens tags', () => {
    const edit = mapAdminProductEditData({
      id: 1,
      rating: '4.5',
      localizedName: { en: 'Pen', ar: 'قلم' },
      localizedDescription: { en: 'd', ar: 'و' },
      localizedLongDescription: { en: 'l', ar: 'ط' },
      variants: [
        {
          id: 1,
          basePrice: '10.5',
          strikePrice: '12',
          costPrice: null,
          images: [],
          attributes: [{ attributeId: 1, definition: { key: 'color' } }, { attributeId: 2 }],
        },
      ],
      tags: [{ tag: { id: 9, key: 'new' } }],
    } as never);
    expect(edit.rating).toBe(4.5);
    expect(edit.localizedContent?.name).toEqual({ en: 'Pen', ar: 'قلم' });
    expect(edit.variants[0]).toMatchObject({ basePrice: 10.5, strikePrice: 12, costPrice: null });
    expect(edit.variants[0].attributes.map((a: { key: string }) => a.key)).toEqual(['color', '']);
    expect(edit.tags).toEqual([{ id: 9, key: 'new' }]);
  });
});

describe('buildGeneratedProductVariants', () => {
  it('builds one variant per combination with keys, suggested SKUs and the first marked default', () => {
    const variants = buildGeneratedProductVariants(
      [{ attributeKey: 'color', options: ['Blue', 'Red'] } as never],
      { sku: undefined, basePrice: 5 },
    );
    expect(variants.map((v) => v.variantKey)).toEqual(['blue', 'red']);
    expect(variants.map((v) => v.isDefault)).toEqual([true, false]);
    expect(variants[0]).toMatchObject({
      sku: 'SKU-BLUE',
      basePrice: 5,
      sortOrder: 0,
      isActive: true,
    });
    expect(variants[1].sortOrder).toBe(1);
  });

  it('honours explicit defaults for SKU, label and flags', () => {
    const [variant] = buildGeneratedProductVariants(
      [{ attributeKey: 'size', options: ['L'] } as never],
      {
        sku: 'FIXED',
        isDefault: false,
        isActive: false,
        localizedLabel: { en: 'Large', ar: 'كبير' },
        strikePrice: 9,
        costPrice: 3,
        weightGrams: 10,
        barcode: 'B',
      },
    );
    expect(variant).toMatchObject({
      sku: 'FIXED',
      isDefault: false,
      isActive: false,
      localizedLabel: { en: 'Large', ar: 'كبير' },
      strikePrice: 9,
      costPrice: 3,
      weightGrams: 10,
      barcode: 'B',
    });
  });

  it('defaults the first variant to default unless told otherwise', () => {
    const [first] = buildGeneratedProductVariants(
      [{ attributeKey: 'size', options: ['M'] } as never],
      {
        isDefault: undefined,
      },
    );
    expect(first.isDefault).toBe(true);
    expect(buildGeneratedProductVariants([], {})).toEqual([]);
  });
});

describe('buildVariantKeyUpdates', () => {
  it('rebuilds one key per variant from its attribute rows', () => {
    expect(
      buildVariantKeyUpdates([
        { variantId: 1, key: 'color', valueText: 'Blue' },
        { variantId: 1, key: 'tip_size', valueText: '0.7' },
        { variantId: 2, key: 'color', valueText: 'Red' },
      ]),
    ).toEqual([
      { variantId: 1, variantKey: 'blue-0.7' },
      { variantId: 2, variantKey: 'red' },
    ]);
  });

  it('rejects a variant whose attribute values are all empty', () => {
    expect(() => buildVariantKeyUpdates([{ variantId: 3, key: 'color', valueText: null }])).toThrow(
      'all attribute values were empty',
    );
  });
});
