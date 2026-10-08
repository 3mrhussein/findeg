import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  brands,
  categories,
  inventoryBalances,
  products,
  productVariants,
  warehouses,
} from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { createSearchService } from '../index';

describe('Catalog search on real Postgres', () => {
  let testDb: TestDatabase;
  let sequence = 0;
  const search = createSearchService();

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());
  beforeEach(async () => {
    // Cascades remove variants and inventory balances.
    await testDb.db.delete(products);
    await testDb.db.delete(categories);
    await testDb.db.delete(brands);
  });

  /** Materialized path is inclusive of the category's own id: "/1/3/". */
  async function category(
    name: { en: string; ar?: string },
    parent?: { id: number; path: string },
  ) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(categories)
      .values({ slug: `search-cat-${sequence}`, localizedName: name, parentId: parent?.id })
      .returning();
    const path = `${parent?.path ?? '/'}${row.id}/`;
    const [withPath] = await testDb.db
      .update(categories)
      .set({ path })
      .where(eq(categories.id, row.id))
      .returning();
    return withPath;
  }

  async function product(input: {
    name: { en: string; ar?: string };
    description?: { en: string; ar?: string };
    sku?: string;
    price?: string;
    categoryId?: number;
    brandId?: number;
    isActive?: boolean;
    stock?: number;
  }) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(products)
      .values({
        slug: `search-product-${sequence}`,
        localizedName: input.name,
        localizedDescription: input.description ?? { en: '' },
        localizedLongDescription: { en: '' },
        categoryId: input.categoryId,
        brandId: input.brandId,
        isActive: input.isActive ?? true,
      })
      .returning();
    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: row.id,
        variantKey: 'default',
        sku: input.sku ?? `SEARCH-${sequence}`,
        basePrice: input.price ?? '10.00',
        isDefault: true,
      })
      .returning();
    if (input.stock !== undefined) {
      const [warehouse] = await testDb.db
        .insert(warehouses)
        .values({ code: `W${sequence}`, name: `Warehouse ${sequence}` })
        .returning();
      await testDb.db
        .insert(inventoryBalances)
        .values({ variantId: variant.id, warehouseId: warehouse.id, onHand: input.stock });
    }
    return row;
  }

  const ids = (result: { items: { id?: unknown }[] }) =>
    result.items.map((item) => Number(item.id));

  describe('search', () => {
    it('finds products by English name, ranking exact before partial matches', async () => {
      const partial = await product({ name: { en: 'Premium Keychains Set' } });
      const exact = await product({ name: { en: 'Keychains' } });
      await product({ name: { en: 'Notebook' } });

      const result = await search.search({ query: 'keychains', locale: 'en' });

      expect(ids(result)).toEqual([exact.id, partial.id]);
      expect(result.total).toBe(2);
    });

    it('finds products by Arabic name with letter-variant normalization', async () => {
      const pen = await product({ name: { en: 'Pen', ar: 'قلم أزرق' } });
      await product({ name: { en: 'Notebook', ar: 'دفتر' } });

      const result = await search.search({ query: 'ازرق', locale: 'ar' });

      expect(ids(result)).toEqual([pen.id]);
    });

    it('matches descriptions, SKUs and category names', async () => {
      const byDescription = await product({
        name: { en: 'Item A' },
        description: { en: 'Great for glitter crafts' },
      });
      const bySku = await product({ name: { en: 'Item B' }, sku: 'GLITTER-77' });
      const cat = await category({ en: 'Glitter Supplies' });
      const byCategory = await product({ name: { en: 'Item C' }, categoryId: cat.id });
      await product({ name: { en: 'Item D' } });

      const result = await search.search({ query: 'glitter', locale: 'en' });

      expect(new Set(ids(result))).toEqual(new Set([byDescription.id, bySku.id, byCategory.id]));
    });

    it('returns nothing for an unmatched query', async () => {
      await product({ name: { en: 'Keychains' } });

      const result = await search.search({ query: 'zzzz-unmatched', locale: 'en' });

      expect(result).toEqual({ items: [], total: 0 });
    });

    it('excludes inactive products', async () => {
      await product({ name: { en: 'Hidden Keychains' }, isActive: false });
      const visible = await product({ name: { en: 'Keychains' } });

      const result = await search.search({ query: 'keychains', locale: 'en' });

      expect(ids(result)).toEqual([visible.id]);
    });

    it('applies brand, category (including descendants), price and in-stock filters', async () => {
      const [brandA] = await testDb.db
        .insert(brands)
        .values({ slug: 'search-brand-a', localizedName: { en: 'Brand A' } })
        .returning();
      const root = await category({ en: 'Stationery' });
      const child = await category({ en: 'Pens' }, root);
      const cheap = await product({
        name: { en: 'Gel Pen' },
        price: '5.00',
        categoryId: child.id,
        brandId: brandA.id,
        stock: 3,
      });
      await product({ name: { en: 'Gel Pen Deluxe' }, price: '50.00', stock: 0 });

      const base = { query: 'pen', locale: 'en' as const };
      expect(ids(await search.search({ ...base, brandId: brandA.id }))).toEqual([cheap.id]);
      expect(ids(await search.search({ ...base, categoryId: root.id }))).toEqual([cheap.id]);
      expect(ids(await search.search({ ...base, maxPrice: 10 }))).toEqual([cheap.id]);
      expect(ids(await search.search({ ...base, minPrice: 20 }))).toHaveLength(1);
      expect(ids(await search.search({ ...base, inStockOnly: true }))).toEqual([cheap.id]);
    });

    it('does not fuzzy-match typos (documented: pg_trgm is not enabled)', async () => {
      await product({ name: { en: 'Keychains' } });

      const result = await search.search({ query: 'keychians', locale: 'en' });

      expect(result.total).toBe(0);
    });
  });

  describe('suggest', () => {
    it('suggests active products and categories by name prefix in the request locale', async () => {
      const pen = await product({ name: { en: 'Pencil Case', ar: 'مقلمة' } });
      await product({ name: { en: 'Pencil Hidden' }, isActive: false });
      await product({ name: { en: 'Notebook' } });
      const cat = await category({ en: 'Pencils', ar: 'أقلام' });

      const en = await search.suggest('pen', 'en');
      expect(en.products.map((s) => s.id)).toEqual([pen.id]);
      expect(en.categories.map((s) => s.id)).toEqual([cat.id]);

      const ar = await search.suggest('مقل', 'ar');
      expect(ar.products.map((s) => s.name)).toEqual(['مقلمة']);
    });

    it('returns nothing when no name matches', async () => {
      await product({ name: { en: 'Notebook' } });

      expect(await search.suggest('zzz', 'en')).toEqual({ products: [], categories: [] });
    });
  });
});
