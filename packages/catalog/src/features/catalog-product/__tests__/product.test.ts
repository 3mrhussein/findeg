import { describe, expect, it } from 'vitest';
import {
  ProductEntity,
  getProductDisplayPrice,
  isNewProduct,
  ProductSchema,
  type Product,
} from '../index';
import type { Variant } from '../../catalog-variant/index';

const variant = (overrides: Partial<Variant> = {}): Variant =>
  ({
    id: 1,
    productId: 1,
    sku: 'S-1',
    variantKey: 'a',
    basePrice: '10.00',
    isActive: true,
    isDefault: false,
    sortOrder: 0,
    inventory: [{ warehouseActive: true, onHand: 5, reserved: 0 }],
    ...overrides,
  }) as Variant;

const product = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 1,
    slug: 'pen',
    name: 'Pen',
    description: 'Fallback description',
    longDescription: 'Fallback long',
    localizedContent: {
      name: { en: 'Pen', ar: 'قلم' },
      description: { en: 'A pen', ar: '' },
      longDescription: { en: '', ar: '' },
    },
    variants: [
      variant({ id: 1, isDefault: true }),
      variant({ id: 2, variantKey: 'b', basePrice: '5' }),
    ],
    tags: [],
    ...overrides,
  }) as Product;

describe('ProductSchema', () => {
  it('requires a slug and name', () => {
    expect(ProductSchema.safeParse({ id: 1 }).success).toBe(false);
  });
});

describe('ProductEntity', () => {
  it('localizes content and falls back to the base text', () => {
    const entity = new ProductEntity(product());
    expect(entity.getName('ar')).toBe('قلم');
    expect(entity.getDescription('ar')).toBe('Fallback description');
    expect(entity.getLongDescription('en')).toBe('Fallback long');
    expect(entity.getSlug()).toBe('pen');
    expect(entity.getAvailableLocales()).toEqual(['en', 'ar']);
  });

  it('reads the default variant, preferring the hydrated one', () => {
    expect(new ProductEntity(product()).getDefaultVariant()?.id).toBe(1);
    const hydrated = variant({ id: 9 });
    expect(
      new ProductEntity(product({ hydratedDefaultVariant: hydrated })).getDefaultVariant()?.id,
    ).toBe(9);
    expect(new ProductEntity(product({ variants: undefined })).getDefaultVariant()).toBeUndefined();
  });

  it('finds variants by key and by id', () => {
    const entity = new ProductEntity(product());
    expect(entity.getVariantByKey('b')?.id).toBe(2);
    expect(entity.getVariantById(1)?.variantKey).toBe('a');
    expect(entity.getVariantByKey('missing')).toBeUndefined();
  });

  it('delegates price and discount to the default variant', () => {
    const entity = new ProductEntity(product({ variants: [variant({ strikePrice: '20.00' })] }));
    expect(entity.getDisplayPrice()).toBe(10);
    expect(entity.getStrikePrice()).toBe(20);
    expect(entity.getDiscountPercentage()).toBe(50);
    expect(entity.hasDiscount()).toBe(true);
    expect(new ProductEntity(product({ variants: [] })).getDiscountPercentage()).toBe(0);
    expect(new ProductEntity(product({ variants: [] })).getDisplayPrice()).toBe(0);
    expect(new ProductEntity(product({ variants: [variant()] })).getStrikePrice()).toBeUndefined();
  });

  it('reports stock across active variants only', () => {
    const inStock = new ProductEntity(
      product({
        variants: [variant({ inventory: [{ warehouseActive: true, onHand: 20, reserved: 0 }] })],
      }),
    );
    expect(inStock.isInStock()).toBe(true);
    expect(inStock.isLowStock()).toBe(false);

    const none = new ProductEntity(product({ variants: [variant({ isActive: false })] }));
    expect(none.isInStock()).toBe(false);
    expect(none.isLowStock()).toBe(false);

    const low = new ProductEntity(
      product({
        variants: [variant({ inventory: [{ warehouseActive: true, onHand: 2, reserved: 0 }] })],
      }),
    );
    expect(low.isLowStock()).toBe(true);
  });

  it('recognises the new-arrival tag and exposes the data and accessors', () => {
    const newTag = {
      id: 1,
      group: 'status',
      key: 'new-arrival',
      slug: 'new-arrival',
      isActive: true,
      scope: 'catalog',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(new ProductEntity(product({ tags: [newTag as never] })).isNew()).toBe(true);
    expect(new ProductEntity(product()).isNew()).toBe(false);
    expect(new ProductEntity(product()).getData().slug).toBe('pen');
    expect(isNewProduct(product())).toBe(false);
    expect(getProductDisplayPrice(product())).toBe(10);
  });
});
