import { like } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { brands, categories, products, productVariants } from '@findeg/db/schema';
import type { ProductListingSort } from '@findeg/db/queries';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { createProductService } from '../index';

describe('Product listing (PLP) on real Postgres', () => {
  let testDb: TestDatabase;
  let sequence = 0;
  const service = createProductService();

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());
  // Other test files share this database, so every query is scoped to this suite's category.
  beforeEach(async () => {
    // Cascades remove variants.
    await testDb.db.delete(products).where(like(products.slug, 'listing-product-%'));
    await testDb.db.delete(categories).where(like(categories.slug, 'listing-cat-%'));
    await testDb.db.delete(brands).where(like(brands.slug, 'listing-brand-%'));
  });

  async function category() {
    sequence += 1;
    const [row] = await testDb.db
      .insert(categories)
      .values({ slug: `listing-cat-${sequence}`, localizedName: { en: `Cat ${sequence}` } })
      .returning();
    return row;
  }

  async function brand() {
    sequence += 1;
    const [row] = await testDb.db
      .insert(brands)
      .values({ slug: `listing-brand-${sequence}`, localizedName: { en: `Brand ${sequence}` } })
      .returning();
    return row;
  }

  async function product(input: {
    categoryId: number;
    price: string;
    brandId?: number;
    rating?: string;
    reviewsCount?: number;
    createdAt?: Date;
    extraVariantPrice?: string;
  }) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(products)
      .values({
        slug: `listing-product-${sequence}`,
        localizedName: { en: `Listing ${sequence}` },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
        categoryId: input.categoryId,
        brandId: input.brandId,
        rating: input.rating,
        reviewsCount: input.reviewsCount,
        createdAt: input.createdAt,
      })
      .returning();
    // The extra variant gets the lower id, so only the default-first order can surface the default.
    if (input.extraVariantPrice) {
      await testDb.db.insert(productVariants).values({
        productId: row.id,
        variantKey: 'extra',
        sku: `LISTING-${sequence}-X`,
        basePrice: input.extraVariantPrice,
      });
    }
    await testDb.db.insert(productVariants).values({
      productId: row.id,
      variantKey: 'default',
      sku: `LISTING-${sequence}`,
      basePrice: input.price,
      isDefault: true,
    });
    return row;
  }

  const ids = (result: { products: { id?: unknown }[] }) =>
    result.products.map((item) => Number(item.id));

  it('filters by any of several brands', async () => {
    const cat = await category();
    const [a, b, c] = [await brand(), await brand(), await brand()];
    const pa = await product({ categoryId: cat.id, price: '10', brandId: a.id });
    const pb = await product({ categoryId: cat.id, price: '10', brandId: b.id });
    await product({ categoryId: cat.id, price: '10', brandId: c.id });
    await product({ categoryId: cat.id, price: '10' });

    const result = await service.getFilteredProducts({
      categoryId: cat.id,
      brandIds: [a.id, b.id],
      sort: 'price_asc',
    });

    expect(ids(result).sort()).toEqual([pa.id, pb.id].sort());
    expect(result.total).toBe(2);
  });

  it("filters by an inclusive price range on the default variant's base price", async () => {
    const cat = await category();
    await product({ categoryId: cat.id, price: '4.99' });
    const low = await product({ categoryId: cat.id, price: '5.00' });
    // A cheaper non-default variant does not change the listing price.
    const high = await product({ categoryId: cat.id, price: '20.00', extraVariantPrice: '1.00' });
    await product({ categoryId: cat.id, price: '20.01' });

    const result = await service.getFilteredProducts({
      categoryId: cat.id,
      minPrice: 5,
      maxPrice: 20,
      sort: 'price_asc',
    });

    expect(ids(result)).toEqual([low.id, high.id]);
    expect(result.total).toBe(2);
    // Hydrated variants lead with the variant the listing priced, as cards display it.
    expect(Number(result.products[1].variants?.[0]?.basePrice)).toBe(20);
  });

  it('sorts by price, newest, rating and popularity', async () => {
    const cat = await category();
    const day = (n: number) => new Date(Date.UTC(2026, 0, n));
    const p1 = await product({
      categoryId: cat.id,
      price: '30',
      rating: '4.00',
      reviewsCount: 50,
      createdAt: day(1),
    });
    const p2 = await product({
      categoryId: cat.id,
      price: '10',
      rating: '5.00',
      reviewsCount: 2,
      createdAt: day(3),
    });
    const p3 = await product({
      categoryId: cat.id,
      price: '20',
      rating: '3.00',
      reviewsCount: 9,
      createdAt: day(2),
    });
    const list = (sort: ProductListingSort) =>
      service.getFilteredProducts({ categoryId: cat.id, sort }).then(ids);

    expect(await list('price_asc')).toEqual([p2.id, p3.id, p1.id]);
    expect(await list('price_desc')).toEqual([p1.id, p3.id, p2.id]);
    expect(await list('newest')).toEqual([p2.id, p3.id, p1.id]);
    expect(await list('rating')).toEqual([p2.id, p1.id, p3.id]);
    expect(await list('popular')).toEqual([p1.id, p3.id, p2.id]);
  });

  it('paginates a stable order and reports the unpaginated total', async () => {
    const cat = await category();
    const created = [];
    for (const price of ['1', '2', '3', '4', '5']) {
      created.push(await product({ categoryId: cat.id, price }));
    }
    const page = (offset: number) =>
      service.getFilteredProducts({ categoryId: cat.id, sort: 'price_asc', limit: 2, offset });

    const [first, second, last] = await Promise.all([page(0), page(2), page(4)]);

    expect(ids(first)).toEqual([created[0].id, created[1].id]);
    expect(ids(second)).toEqual([created[2].id, created[3].id]);
    expect(ids(last)).toEqual([created[4].id]);
    expect([first.total, second.total, last.total]).toEqual([5, 5, 5]);
  });
});
