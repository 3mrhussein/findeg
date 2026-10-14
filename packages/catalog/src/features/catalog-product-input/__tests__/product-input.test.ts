import { describe, expect, it } from 'vitest';
import { ProductInputSchema, VariantInputSchema } from '../index';

const variant = (overrides: Record<string, unknown> = {}) => ({
  sku: 'SKU-1',
  variantKey: 'blue',
  basePrice: 10,
  isDefault: true,
  sortOrder: 0,
  ...overrides,
});

const translations = [{ language: 'en', name: 'Pen', description: '', longDescription: '' }];

describe('VariantInputSchema', () => {
  it('defaults sortOrder, isDefault and isActive', () => {
    const parsed = VariantInputSchema.parse({ sku: 'S', variantKey: 'k', basePrice: 1 });
    expect(parsed).toMatchObject({ sortOrder: 0, isDefault: false, isActive: true });
  });

  it('rejects negative prices and images with malformed URLs', () => {
    expect(VariantInputSchema.safeParse(variant({ basePrice: -1 })).success).toBe(false);
    expect(VariantInputSchema.safeParse(variant({ images: [{ url: 'nope' }] })).success).toBe(
      false,
    );
  });
});

describe('ProductInputSchema', () => {
  it('accepts one default variant with sequential sort orders', () => {
    const result = ProductInputSchema.safeParse({
      translations,
      variants: [
        variant({ sortOrder: 0 }),
        variant({ sku: 'SKU-2', isDefault: false, sortOrder: 1 }),
      ],
    });
    expect(result.success).toBe(true);
  });

  it('requires at least one translation and one variant', () => {
    expect(ProductInputSchema.safeParse({ translations: [], variants: [variant()] }).success).toBe(
      false,
    );
    expect(ProductInputSchema.safeParse({ translations, variants: [] }).success).toBe(false);
  });

  it('requires exactly one default variant', () => {
    const none = ProductInputSchema.safeParse({
      translations,
      variants: [variant({ isDefault: false })],
    });
    expect(none.error?.issues[0].message).toBe('Product must have exactly one default variant');

    const two = ProductInputSchema.safeParse({
      translations,
      variants: [variant({ sortOrder: 0 }), variant({ sku: 'B', sortOrder: 1 })],
    });
    expect(two.error?.issues[0].message).toBe('Product can only have one default variant');
  });

  it('reports sort orders that are not sequential from zero', () => {
    const result = ProductInputSchema.safeParse({
      translations,
      variants: [variant({ sortOrder: 0 }), variant({ sku: 'B', isDefault: false, sortOrder: 5 })],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain(
      'variants.1.sortOrder',
    );
  });
});
