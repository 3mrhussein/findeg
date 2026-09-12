import { describe, expect, it } from 'vitest';
import { isProductVariantInput, isProductVariantUpdate } from '../public.js';

describe('Catalog management input', () => {
  it('rejects inactive Product Variant creation requests', () => {
    expect(
      isProductVariantInput({
        productId: 4,
        sku: 'PEN-BLUE',
        variantKey: 'blue',
        label: { en: 'Blue', ar: 'أزرق' },
        basePrice: '15.50',
        isActive: false,
      }),
    ).toBe(false);
  });

  it('allows updates to deactivate an existing Product Variant', () => {
    expect(
      isProductVariantUpdate({
        variantId: 19,
        productId: 4,
        sku: 'PEN-BLUE',
        variantKey: 'blue',
        label: { en: 'Blue', ar: 'أزرق' },
        basePrice: '15.50',
        isActive: false,
      }),
    ).toBe(true);
  });
});
