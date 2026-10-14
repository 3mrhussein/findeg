import { describe, expect, expectTypeOf, it } from 'vitest';
import { DomainError, moneyFromDecimal, type ActiveStatus } from '../../common';
import * as catalog from '@findeg/domain/catalog';
import {
  defaultVariant,
  discountPercentage,
  isNewArrival,
  productVariant,
  sku,
  type Attribute,
  type AttributeId,
  type Brand,
  type BrandId,
  type Category,
  type CategoryId,
  type Collection,
  type CollectionId,
  type Product,
  type ProductId,
  type ProductVariant,
  type Tag,
  type TagId,
  type VariantId,
} from '@findeg/domain/catalog';

const variantId = (n: number) => n as VariantId;

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error: unknown) {
    if (error instanceof DomainError) return error.code as string;
    throw error;
  }
}

describe('catalogue entities', () => {
  it('pins the catalogue value sets', () => {
    expect(catalog.TAG_SCOPES).toEqual([
      'catalog',
      'school',
      'campaign',
      'system',
      'search',
      'editorial',
    ]);
    expect(catalog.DEFAULT_TAG_SCOPE).toBe('catalog');
    expect(catalog.ATTRIBUTE_DATA_TYPES).toEqual(['string', 'number', 'boolean', 'enum']);
  });

  it('are Active or Inactive, never Draft', () => {
    expectTypeOf<Product['status']>().toEqualTypeOf<ActiveStatus>();
    expectTypeOf<ProductVariant['status']>().toEqualTypeOf<ActiveStatus>();
    expectTypeOf<Category['status']>().toEqualTypeOf<ActiveStatus>();
    expectTypeOf<'draft'>().not.toExtend<ActiveStatus>();
  });

  // Checked by `tsc`: each entity has its own id, and links use the parent's id type.
  it('are identified and linked by branded ids', () => {
    expectTypeOf<Product['id']>().toEqualTypeOf<ProductId>();
    expectTypeOf<Category['id']>().toEqualTypeOf<CategoryId>();
    expectTypeOf<Brand['id']>().toEqualTypeOf<BrandId>();
    expectTypeOf<Collection['id']>().toEqualTypeOf<CollectionId>();
    expectTypeOf<Tag['id']>().toEqualTypeOf<TagId>();
    expectTypeOf<Attribute['id']>().toEqualTypeOf<AttributeId>();
    expectTypeOf<ProductVariant['productId']>().toEqualTypeOf<ProductId>();
    expectTypeOf<Product['categoryId']>().toEqualTypeOf<CategoryId>();
    expectTypeOf<Product['brandId']>().toEqualTypeOf<BrandId | null>();
    expectTypeOf<Product['tagIds']>().toEqualTypeOf<readonly TagId[]>();
    expectTypeOf<Category['parentId']>().toEqualTypeOf<CategoryId | null>();
    expectTypeOf<Collection['tagIds']>().toEqualTypeOf<readonly TagId[]>();
    expectTypeOf<CategoryId>().not.toExtend<BrandId>();
  });

  it('carry no slugs, SEO fields or image URLs', () => {
    type NonBusiness = 'slug' | 'seoTitle' | 'metaDescription' | 'imageUrl' | 'images';
    type Keys = keyof Product | keyof ProductVariant | keyof Category | keyof Brand;
    expectTypeOf<Extract<NonBusiness, Keys>>().toBeNever();
  });

  it('exports no input schemas', () => {
    const schemas = Object.entries(catalog).filter(
      ([, value]) => typeof value === 'object' && 'safeParse' in value,
    );
    expect(schemas.map(([name]) => name)).toEqual([]);
  });
});

describe('SKU', () => {
  it.each(['PEN-BLUE-01', 'a', 'any format at all', 'قلم-1'])('accepts %j as written', (text) => {
    expect(sku(text)).toBe(text);
  });

  it.each(['', '   ', ' PEN-1', 'PEN-1 ', '\tPEN-1\n'])('refuses blank or padded %j', (text) => {
    expect(codeOf(() => sku(text))).toBe('INVALID_SKU');
  });
});

// Characterised from the Backend's Product.getDefaultVariant: the variant flagged default,
// otherwise the first variant in the product's display order.
describe('Default Variant', () => {
  const v = (id: number, isDefault: boolean, status: 'active' | 'inactive' = 'active') => ({
    id: variantId(id),
    isDefault,
    status,
  });

  it('is the variant flagged default, wherever it sits', () => {
    expect(defaultVariant([v(1, false), v(2, true), v(3, false)])?.id).toBe(2);
  });

  it('is the first variant when none is flagged', () => {
    expect(defaultVariant([v(7, false), v(3, false)])?.id).toBe(7);
  });

  it('is the first flagged variant when several are flagged', () => {
    expect(defaultVariant([v(1, false), v(4, true), v(2, true)])?.id).toBe(4);
  });

  it('does not exist for a product with no variants', () => {
    const noVariants: { isDefault: boolean }[] = [];
    expect(defaultVariant(noVariants)).toBeUndefined();
  });

  it('change: an inactive flagged variant is still the default (the product page skipped it)', () => {
    expect(defaultVariant([v(1, false), v(2, true, 'inactive')])?.id).toBe(2);
  });
});

describe('Product Variant', () => {
  const props = {
    id: variantId(1),
    productId: 10 as ProductId,
    sku: 'NB-A4-80',
    label: { en: 'A4, 80 sheets' },
    attributes: { size: 'A4' },
    price: moneyFromDecimal('45.00'),
    compareAtPrice: moneyFromDecimal('60.00'),
    isDefault: true,
    status: 'active' as const,
  };

  it('is made from valid catalogue data', () => {
    const variant = productVariant(props);
    expect(variant.sku).toBe('NB-A4-80');
    expect(variant.compareAtPrice).toBe(moneyFromDecimal('60.00'));
  });

  it('may have no compare-at price', () => {
    expect(productVariant({ ...props, compareAtPrice: null }).compareAtPrice).toBeNull();
  });

  it('refuses a blank or padded SKU', () => {
    expect(codeOf(() => productVariant({ ...props, sku: ' NB-A4-80' }))).toBe('INVALID_SKU');
  });

  it.each(['45.00', '44.99'])(
    'change: refuses a compare-at price of %s against a 45.00 price (the Backend ignored it)',
    (compareAt) => {
      expect(
        codeOf(() => productVariant({ ...props, compareAtPrice: moneyFromDecimal(compareAt) })),
      ).toBe('COMPARE_AT_PRICE_NOT_ABOVE_PRICE');
    },
  );
});

// Characterised from the Backend's Variant.getDiscountPercentage:
// round((compareAt - price) / compareAt x 100), half up, and 0 with no compare-at price.
describe('discount percentage', () => {
  it.each([
    // [price, compare-at, expected %]
    ['75.00', '100.00', 25],
    ['20.00', '30.00', 33], // 33.33
    ['10.00', '30.00', 67], // 66.67
    ['7.00', '8.00', 13], // 12.5 rounds half up
    ['39.00', '40.00', 3], // 2.5 rounds half up
    ['999.99', '1000.00', 0], // 0.001 rounds to nothing
    ['0.00', '12.50', 100],
  ])('price %s against compare-at %s is %s%%', (price, compareAt, expected) => {
    expect(
      discountPercentage({
        price: moneyFromDecimal(price),
        compareAtPrice: moneyFromDecimal(compareAt),
      }),
    ).toBe(expected);
  });

  it('is 0 when a stored compare-at price is not above the price', () => {
    const price = moneyFromDecimal('45.00');
    expect(discountPercentage({ price, compareAtPrice: price })).toBe(0);
  });

  it('is 0 with no compare-at price', () => {
    expect(discountPercentage({ price: moneyFromDecimal('45.00'), compareAtPrice: null })).toBe(0);
  });
});

describe('New Arrival', () => {
  const tag = (group: string, key: string) => ({ group, key });

  it('is not a product with no tags', () => {
    expect(isNewArrival([])).toBe(false);
  });

  it('is not a product with only other tags', () => {
    expect(isNewArrival([tag('audience', 'kids'), tag('campaign', 'back-to-school')])).toBe(false);
  });

  it('change: is a product carrying the seeded campaign/new-arrival tag (the Backend never matched it)', () => {
    expect(isNewArrival([tag('audience', 'kids'), tag('campaign', 'new-arrival')])).toBe(true);
  });

  it('matches the tag key exactly', () => {
    expect(isNewArrival([tag('campaign', 'campaign:new-arrival')])).toBe(false);
    expect(isNewArrival([tag('campaign', 'New-Arrival')])).toBe(false);
  });
});
