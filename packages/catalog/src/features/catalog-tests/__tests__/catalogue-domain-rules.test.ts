import { describe, expect, it } from 'vitest';
import { defaultVariant as domainDefaultVariant } from '@findeg/domain';
import { ProductEntity, isNewProduct, type Product } from '../../catalog-product/index';
import { VariantEntity, getVariantAvailableStock, type Variant } from '../../catalog-variant/index';
import type { Tag } from '../../catalog-tag/index';

/** Builds an active tag fixture with the given key and a campaign group by default. */
function tag(key: string, group = 'campaign'): Tag {
  return {
    id: 1,
    group,
    key,
    slug: key,
    scope: 'campaign',
    isActive: true,
  } as unknown as Tag;
}

/** Builds a product fixture with no tags or variants unless supplied by the test. */
function product(overrides: Partial<Product>): Product {
  return {
    id: 1,
    slug: 'notebook',
    name: 'Notebook',
    description: '',
    longDescription: '',
    localizedContent: undefined,
    tags: [],
    variants: [],
    ...overrides,
  } as unknown as Product;
}

/** Builds an active, non-default variant fixture with test-specific overrides. */
function variant(overrides: Partial<Variant>): Variant {
  return {
    id: 1,
    productId: 1,
    sku: 'NB-1',
    variantKey: 'default',
    sortOrder: 0,
    isDefault: false,
    isActive: true,
    basePrice: '45.00',
    strikePrice: undefined,
    ...overrides,
  };
}

describe('New arrival', () => {
  it('is true for a product tagged new-arrival in the campaign group', () => {
    expect(isNewProduct(product({ tags: [tag('new-arrival')] }))).toBe(true);
  });

  it('is false for a product without the new-arrival tag', () => {
    expect(isNewProduct(product({ tags: [tag('best-seller')] }))).toBe(false);
  });
});

describe('Default variant in Backend reads', () => {
  it('matches the domain default variant when a flagged variant is inactive', () => {
    const variants = [variant({ id: 1 }), variant({ id: 2, isDefault: true, isActive: false })];
    const entity = new ProductEntity(product({ variants }));
    expect(entity.getDefaultVariant()?.id).toBe(2);
    expect(entity.getDefaultVariant()?.id).toBe(domainDefaultVariant(variants)?.id);
  });

  it('falls back to the first variant in display order when none is flagged', () => {
    const variants = [variant({ id: 7 }), variant({ id: 3 })];
    const entity = new ProductEntity(product({ variants }));
    expect(entity.getDefaultVariant()?.id).toBe(7);
  });
});

describe('Compare-at discount', () => {
  it('shows the saving as a whole percentage of the compare-at price', () => {
    expect(
      new VariantEntity(
        variant({ basePrice: '45.00', strikePrice: '60.00' }),
      ).getDiscountPercentage(),
    ).toBe(25);
  });

  it('is zero when the compare-at price is not above the price', () => {
    expect(
      new VariantEntity(
        variant({ basePrice: '45.00', strikePrice: '45.00' }),
      ).getDiscountPercentage(),
    ).toBe(0);
  });
});

describe('Stock availability', () => {
  it('counts only active warehouses and never goes below zero per balance', () => {
    const stocked = variant({
      inventory: [
        { warehouseCode: 'OLD', warehouseActive: false, onHand: 10, reserved: 3 },
        { warehouseCode: 'MAIN', warehouseActive: true, onHand: 5, reserved: 9 },
        { warehouseCode: 'EAST', warehouseActive: true, onHand: 8, reserved: 3 },
      ],
    });
    expect(getVariantAvailableStock(stocked)).toBe(5);
  });

  it('treats 1 to 5 available units as low stock, and 6 as not low', () => {
    /** Builds a variant entity with the given unreserved stock in one active warehouse. */
    const withUnits = (units: number) =>
      new VariantEntity(
        variant({
          inventory: [{ warehouseCode: 'MAIN', warehouseActive: true, onHand: units, reserved: 0 }],
        }),
      );
    expect(withUnits(1).isLowStock()).toBe(true);
    expect(withUnits(5).isLowStock()).toBe(true);
    expect(withUnits(6).isLowStock()).toBe(false);
    expect(withUnits(0).isLowStock()).toBe(false);
  });
});
