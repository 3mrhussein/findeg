import { describe, expect, it } from 'vitest';
import {
  VariantEntity,
  VariantSchema as variantSchema,
  getVariantAvailableStock,
  type Variant,
} from '../index';

const variant = (overrides: Partial<Variant> = {}): Variant =>
  ({
    id: 1,
    productId: 1,
    sku: 'SKU-1',
    variantKey: 'blue',
    basePrice: '10.00',
    localizedLabel: { en: 'Blue', ar: 'أزرق' },
    inventory: [{ warehouseActive: true, onHand: 3, reserved: 1 }],
    ...overrides,
  }) as Variant;

describe('VariantSchema', () => {
  it('defaults sortOrder, isDefault and isActive', () => {
    const parsed = variantSchema.parse({
      id: 1,
      productId: 1,
      sku: 'S',
      variantKey: 'k',
      basePrice: 1,
    });
    expect(parsed).toMatchObject({ sortOrder: 0, isDefault: false, isActive: true });
  });
});

describe('VariantEntity', () => {
  it('returns the localized label and display price', () => {
    const entity = new VariantEntity(variant());
    expect(entity.getLabel('ar')).toBe('أزرق');
    expect(entity.getDisplayPrice().toString()).toBe(
      new VariantEntity(variant()).getDisplayPrice().toString(),
    );
    expect(entity.getData().sku).toBe('SKU-1');
  });

  it('returns no strike price when none is set and a Money value when it is', () => {
    expect(new VariantEntity(variant()).getStrikePrice()).toBeUndefined();
    expect(new VariantEntity(variant({ strikePrice: '12.00' })).getStrikePrice()).toBeDefined();
  });

  it('computes the discount percentage against the strike price', () => {
    expect(new VariantEntity(variant({ strikePrice: '20.00' })).getDiscountPercentage()).toBe(50);
    expect(new VariantEntity(variant()).getDiscountPercentage()).toBe(0);
  });

  it('counts free units only in active warehouses', () => {
    const entity = new VariantEntity(
      variant({
        inventory: [
          { warehouseActive: true, onHand: 3, reserved: 1 },
          { warehouseActive: false, onHand: 10, reserved: 0 },
        ],
      }),
    );
    expect(entity.getAvailableStock()).toBe(2);
    expect(entity.isInStock()).toBe(true);
    expect(entity.isLowStock()).toBe(true);
  });

  it('reports out of stock when nothing is free to sell', () => {
    const entity = new VariantEntity(variant({ inventory: undefined }));
    expect(entity.getAvailableStock()).toBe(0);
    expect(entity.isInStock()).toBe(false);
    expect(entity.isLowStock()).toBe(false);
  });

  it('exposes the available stock accessor used by consumers', () => {
    expect(getVariantAvailableStock(variant())).toBe(2);
  });
});
