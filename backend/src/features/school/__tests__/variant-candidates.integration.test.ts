import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  attributes,
  categories,
  productVariants,
  products,
  variantAttributes,
} from '@findeg/db/schema';
import {
  findVariantCandidates,
  listAttributeValuesForCategory,
} from '@findeg/db/queries/school-supply-lists';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { eligibleVariants } from '../domain/eligibleVariants';

describe('School Supply List catalog queries', () => {
  let testDb: TestDatabase;
  let sequence = 0;

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });

  afterAll(async () => testDb.close());

  async function category() {
    sequence += 1;
    const [row] = await testDb.db
      .insert(categories)
      .values({ slug: `sl-category-${sequence}` })
      .returning();
    return row.id;
  }

  async function attribute(label: string, enumValues?: string[]) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(attributes)
      .values({
        key: `sl-${label}-${sequence}`,
        dataType: 'text',
        localizedLabel: { en: label },
        enumValues,
      })
      .returning();
    return row;
  }

  async function variant(
    categoryId: number,
    values: { attribute: { id: number }; value: string }[] = [],
    options: { productActive?: boolean; variantActive?: boolean } = {},
  ) {
    sequence += 1;
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `sl-product-${sequence}`,
        localizedName: { en: `Product ${sequence}` },
        localizedDescription: { en: 'Description' },
        localizedLongDescription: { en: 'Description' },
        categoryId,
        isActive: options.productActive ?? true,
      })
      .returning();
    const [row] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        sku: `SL-SKU-${sequence}`,
        variantKey: `v-${sequence}`,
        basePrice: '10.00',
        isActive: options.variantActive ?? true,
      })
      .returning();
    if (values.length > 0) {
      await testDb.db.insert(variantAttributes).values(
        values.map((v) => ({
          variantId: row.id,
          attributeId: v.attribute.id,
          valueText: v.value,
        })),
      );
    }
    return row.id;
  }

  describe('findVariantCandidates', () => {
    it('returns active variants of active products with their attributes', async () => {
      const cat = await category();
      const color = await attribute('color');
      const active = await variant(cat, [{ attribute: color, value: 'blue' }]);
      await variant(cat, [{ attribute: color, value: 'red' }], { variantActive: false });
      await variant(cat, [{ attribute: color, value: 'green' }], { productActive: false });

      const candidates = await findVariantCandidates(testDb.db, { categoryId: cat });

      expect(candidates).toEqual([
        { variantId: active, categoryId: cat, attributes: { [color.key]: 'blue' } },
      ]);
    });

    it('filters by exact category and by variant ids', async () => {
      const cat = await category();
      const other = await category();
      const a = await variant(cat);
      const b = await variant(cat);
      await variant(other);

      const inCategory = await findVariantCandidates(testDb.db, { categoryId: cat });
      expect(inCategory.map((c) => c.variantId)).toEqual([a, b]);

      const byIds = await findVariantCandidates(testDb.db, { variantIds: [b] });
      expect(byIds.map((c) => c.variantId)).toEqual([b]);
      expect(await findVariantCandidates(testDb.db, { variantIds: [] })).toEqual([]);
    });

    it('has no row limit', async () => {
      const cat = await category();
      for (let i = 0; i < 60; i += 1) await variant(cat);

      expect(await findVariantCandidates(testDb.db, { categoryId: cat })).toHaveLength(60);
    });

    it('feeds eligibleVariants end to end', async () => {
      const cat = await category();
      const color = await attribute('color');
      const size = await attribute('size');
      const blueA4 = await variant(cat, [
        { attribute: color, value: 'blue' },
        { attribute: size, value: 'A4' },
      ]);
      const blueA5 = await variant(cat, [
        { attribute: color, value: 'blue' },
        { attribute: size, value: 'A5' },
      ]);
      await variant(cat, [{ attribute: color, value: 'red' }]);
      await variant(cat, [{ attribute: color, value: 'blue' }], { variantActive: false });

      const candidates = await findVariantCandidates(testDb.db, { categoryId: cat });
      const result = eligibleVariants(
        {
          variantId: blueA4,
          exactItem: false,
          specification: { categoryId: cat, attributes: { [color.key]: 'blue' } },
        },
        candidates,
      );

      expect(result.map((c) => c.variantId)).toEqual([blueA4, blueA5]);
    });
  });

  it('keeps a `__proto__` attribute key as data so it still matches eligibility', async () => {
    const cat = await category();
    const odd = await attribute('odd');
    await testDb.db.update(attributes).set({ key: '__proto__' }).where(eq(attributes.id, odd.id));
    const matching = await variant(cat, [{ attribute: odd, value: 'x' }]);

    const candidates = await findVariantCandidates(testDb.db, { categoryId: cat });
    const result = eligibleVariants(
      {
        variantId: matching,
        exactItem: false,
        specification: {
          categoryId: cat,
          attributes: Object.fromEntries([['__proto__', 'x']]),
        },
      },
      candidates,
    );

    expect(result.map((c) => c.variantId)).toEqual([matching]);
  });

  describe('listAttributeValuesForCategory', () => {
    it('returns the distinct values in use, sorted, from active variants only', async () => {
      const cat = await category();
      const color = await attribute('color');
      await variant(cat, [{ attribute: color, value: 'red' }]);
      await variant(cat, [{ attribute: color, value: 'blue' }]);
      await variant(cat, [{ attribute: color, value: 'blue' }]);
      await variant(cat, [{ attribute: color, value: 'green' }], { variantActive: false });

      expect(await listAttributeValuesForCategory(testDb.db, cat)).toEqual([
        { attributeKey: color.key, values: ['blue', 'red'] },
      ]);
    });

    it('prefers an attribute’s enumerated values over values in use', async () => {
      const cat = await category();
      const size = await attribute('size', ['A5', 'A4', 'A3']);
      await variant(cat, [{ attribute: size, value: 'A4' }]);

      expect(await listAttributeValuesForCategory(testDb.db, cat)).toEqual([
        { attributeKey: size.key, values: ['A3', 'A4', 'A5'] },
      ]);
    });

    it('honors an explicitly empty enum instead of falling back to values in use', async () => {
      const cat = await category();
      const size = await attribute('size', []);
      await variant(cat, [{ attribute: size, value: 'A4' }]);

      expect(await listAttributeValuesForCategory(testDb.db, cat)).toEqual([]);
    });

    it('is scoped to the category and empty when nothing is in use', async () => {
      const cat = await category();
      const other = await category();
      const color = await attribute('color');
      await variant(other, [{ attribute: color, value: 'blue' }]);

      expect(await listAttributeValuesForCategory(testDb.db, cat)).toEqual([]);
    });
  });
});
