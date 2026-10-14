import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductService } from '../index';

const { productQueries } = vi.hoisted(() => ({
  productQueries: {
    getAllWithBrandAndCategory: vi.fn(),
    getVariantsByProductIds: vi.fn(),
    getProductTagsByProductIds: vi.fn(),
    getProductAttributesByProductIds: vi.fn(),
    getByIdsWithBrandAndCategory: vi.fn(),
    getFiltered: vi.fn(),
    getPriceBounds: vi.fn(),
    getProductsByTagIds: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@findeg/db/queries', () => ({ productQueries }));

const productRow = (id: number) => ({
  id,
  isActive: true,
  brandId: null,
  categoryId: null,
  slug: `p-${String(id)}`,
  localizedName: null,
  localizedDescription: null,
  localizedLongDescription: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('ProductService branches', () => {
  let service: ProductService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProductService();
  });
  afterEach(() => vi.restoreAllMocks());

  it('maps products without brand or category and with missing translations', async () => {
    productQueries.getAllWithBrandAndCategory.mockResolvedValue([
      { product: productRow(1), brand: { localizedName: null }, category: { localizedName: null } },
    ]);
    productQueries.getVariantsByProductIds.mockResolvedValue({});
    const [product] = await service.getAll();
    expect(product.brandName).toBe('');
    expect(product.categoryName).toBe('');
    expect(product.variants).toEqual([]);
    expect(product.hydratedDefaultVariant).toBeUndefined();
  });

  it('returns an empty batch for no ids or no tag matches', async () => {
    expect(await service.getByIds([])).toEqual([]);
    productQueries.getProductsByTagIds.mockResolvedValue([]);
    expect(await service.getProductsByTagIds([1])).toEqual([]);
  });

  it('hydrates tagged products by id order', async () => {
    productQueries.getProductsByTagIds.mockResolvedValue([{ id: 4 }]);
    const spy = vi
      .spyOn(ProductService.prototype, 'getByIds')
      .mockResolvedValue([{ id: 4 } as never]);
    expect(await service.getProductsByTagIds([9], 'ar')).toEqual([{ id: 4 }]);
    expect(spy).toHaveBeenCalledWith([4], 'ar');
  });

  it('pages filtered products through getByIds and returns an empty page when none match', async () => {
    productQueries.getFiltered.mockResolvedValueOnce({ products: [], total: 0 });
    expect(await service.getFilteredProducts({ isActive: true })).toEqual({
      products: [],
      total: 0,
    });

    productQueries.getFiltered.mockResolvedValueOnce({ products: [{ id: 2 }], total: 5 });
    vi.spyOn(ProductService.prototype, 'getByIds').mockResolvedValue([{ id: 2 } as never]);
    expect(
      await service.getFilteredProducts(
        { categoryId: 1, brandIds: [2], sort: 'price' } as never,
        'en',
      ),
    ).toEqual({ products: [{ id: 2 }], total: 5 });
  });

  it('returns related products without the product itself, capped to the limit', async () => {
    vi.spyOn(ProductService.prototype, 'getFilteredProducts').mockResolvedValue({
      products: [{ id: 1 }, { id: 2 }, { id: 3 }] as never,
      total: 3,
    });
    const related = await service.getRelatedProducts({ id: 1, categoryId: 5 } as never, 1);
    expect(related.map((p) => p.id)).toEqual([2]);
  });

  it('reads price bounds', async () => {
    productQueries.getPriceBounds.mockResolvedValue({ minPrice: 0, maxPrice: 0 });
    expect(await service.getPriceBounds()).toEqual({ minPrice: 0, maxPrice: 0 });
  });

  it('creates with active defaulting to true and updates only the given fields', async () => {
    productQueries.create.mockResolvedValue({ id: 3 });
    productQueries.update.mockResolvedValue(undefined);
    vi.spyOn(ProductService.prototype, 'getById').mockResolvedValue({ id: 3 } as never);
    const input = {
      translations: [{ language: 'ar', name: 'قلم', description: 'وصف', longDescription: 'طويل' }],
    } as never;
    await service.create(input);
    expect(productQueries.create).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true, localizedName: { en: '', ar: 'قلم' } }),
    );
    await service.update(3, input);
    expect(productQueries.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ isActive: undefined }),
    );
  });
});
