import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductService } from '../index';

const { productQueries } = vi.hoisted(() => ({
  productQueries: {
    getAllWithBrandAndCategory: vi.fn(),
    getVariantsByProductIds: vi.fn(),
    getById: vi.fn(),
    getByIdWithBrandAndCategory: vi.fn(),
    getProductTags: vi.fn(),
    getProductAttributes: vi.fn(),
    getByIdsWithBrandAndCategory: vi.fn(),
    getProductTagsByProductIds: vi.fn(),
    getProductAttributesByProductIds: vi.fn(),
    getBySlug: vi.fn(),
    getFeatured: vi.fn(),
    search: vi.fn(),
    getByCategory: vi.fn(),
    getFiltered: vi.fn(),
    getPriceBounds: vi.fn(),
    getProductsByTagIds: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));
vi.mock('@findeg/db/queries', () => ({ productQueries }));

const productRow = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  isActive: true,
  brandId: 2,
  categoryId: 3,
  slug: `product-${String(id)}`,
  localizedName: { en: `Pen ${String(id)}`, ar: `قلم ${String(id)}` },
  localizedDescription: { en: 'Desc', ar: 'وصف' },
  localizedLongDescription: { en: 'Long', ar: 'طويل' },
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  ...overrides,
});

const variantRow = (id: number, productId: number, overrides: Record<string, unknown> = {}) => ({
  id,
  productId,
  sku: `SKU-${String(id)}`,
  variantKey: `key-${String(id)}`,
  localizedLabel: { en: 'Blue', ar: 'أزرق' },
  basePrice: 10,
  strikePrice: null,
  costPrice: 4,
  isActive: true,
  sortOrder: id,
  isDefault: id === 1,
  mediaSet: null,
  barcode: null,
  weightGrams: 0,
  ...overrides,
});

const tagRow = (id: number) => ({
  id,
  key: `tag-${String(id)}`,
  slug: `tag-${String(id)}`,
  group: 'audience',
  icon: null,
  color: '',
  isActive: true,
  scope: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('ProductService', () => {
  let service: ProductService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProductService();
  });

  it('returns no products when there are none', async () => {
    productQueries.getAllWithBrandAndCategory.mockResolvedValue([]);
    expect(await service.getAll()).toEqual([]);
  });

  it('maps every product with localized names, brand, category and its default variant', async () => {
    productQueries.getAllWithBrandAndCategory.mockResolvedValue([
      {
        product: productRow(1),
        brand: { localizedName: { en: 'Acme', ar: 'اكمي' } },
        category: { localizedName: { en: 'Pens', ar: 'أقلام' } },
      },
      { product: productRow(2), brand: null, category: null },
    ]);
    productQueries.getVariantsByProductIds.mockResolvedValue({
      1: [variantRow(2, 1, { isDefault: false }), variantRow(1, 1)],
      2: [],
    });
    const products = await service.getAll('ar');
    expect(products).toHaveLength(2);
    expect(products[0]).toMatchObject({
      name: 'قلم 1',
      brandName: 'اكمي',
      categoryName: 'أقلام',
    });
    expect(products[0].hydratedDefaultVariant?.sku).toBe('SKU-1');
    expect(products[0].variants?.[0].basePrice).toBe('10');
    expect(products[1].brandName).toBeUndefined();
  });

  it('returns null from getById for an unknown product', async () => {
    productQueries.getByIdWithBrandAndCategory.mockResolvedValue(undefined);
    expect(await service.getById(99)).toBeNull();
  });

  it('assembles a product by id with tags, attributes and prices as strings', async () => {
    productQueries.getByIdWithBrandAndCategory.mockResolvedValue({
      product: productRow(5, { localizedName: null }),
      brand: null,
      category: null,
    });
    productQueries.getVariantsByProductIds.mockResolvedValue({
      5: [variantRow(1, 5, { strikePrice: 12, barcode: 'B1', localizedLabel: null })],
    });
    productQueries.getProductTags.mockResolvedValue([tagRow(1)]);
    productQueries.getProductAttributes.mockResolvedValue([
      { attributeId: 1, key: 'color', valueText: 'Blue' },
    ]);
    const product = await service.getById(5, 'en');
    expect(product?.tags?.[0]).toMatchObject({ key: 'tag-1', scope: 'catalog' });
    expect(product?.attributes).toHaveLength(1);
    expect(product?.variants?.[0]).toMatchObject({ strikePrice: '12', barcode: 'B1' });
    expect(product?.variants?.[0].localizedLabel).toEqual({ en: '', ar: '' });
    expect(product?.name).toBe('');
  });

  it('batches by ids, keeps the requested order and skips missing products', async () => {
    productQueries.getByIdsWithBrandAndCategory.mockResolvedValue([
      { product: productRow(2), brand: null, category: null },
      { product: productRow(1), brand: null, category: { localizedName: { en: 'Pens' } } },
    ]);
    productQueries.getVariantsByProductIds.mockResolvedValue({ 1: [variantRow(1, 1)] });
    productQueries.getProductTagsByProductIds.mockResolvedValue({ 2: [tagRow(3)] });
    productQueries.getProductAttributesByProductIds.mockResolvedValue({});
    const products = await service.getByIds([1, 99, 2]);
    expect(products.map((p) => p.id)).toEqual([1, 2]);
    expect(products[0].categoryName).toBe('Pens');
    expect(products[1].tags).toHaveLength(1);
    expect(await service.getByIds([])).toEqual([]);
  });

  it('finds a product by slug through getById and returns null when absent', async () => {
    productQueries.getBySlug.mockResolvedValueOnce(undefined);
    expect(await service.getBySlug('nope')).toBeNull();

    productQueries.getBySlug.mockResolvedValueOnce(productRow(7));
    productQueries.getByIdWithBrandAndCategory.mockResolvedValueOnce({
      product: productRow(7),
      brand: null,
      category: null,
    });
    productQueries.getVariantsByProductIds.mockResolvedValueOnce({});
    productQueries.getProductTags.mockResolvedValueOnce([]);
    productQueries.getProductAttributes.mockResolvedValueOnce([]);
    expect((await service.getBySlug('product-7'))?.id).toBe(7);
  });

  it('lists featured, searched and category products, dropping vanished ones', async () => {
    productQueries.getFeatured.mockResolvedValue([]);
    expect(await service.getFeaturedProducts()).toEqual([]);

    productQueries.getFeatured.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    productQueries.search.mockResolvedValue([{ id: 1 }]);
    productQueries.getByCategory.mockResolvedValue([]);
    productQueries.getByIdWithBrandAndCategory.mockImplementation((id: number) =>
      Promise.resolve().then(() =>
        id === 1 ? { product: productRow(1), brand: null, category: null } : undefined,
      ),
    );
    productQueries.getVariantsByProductIds.mockResolvedValue({});
    productQueries.getProductTags.mockResolvedValue([]);
    productQueries.getProductAttributes.mockResolvedValue([]);

    expect((await service.getFeaturedProducts(2)).map((p) => p.id)).toEqual([1]);
    expect((await service.searchProducts('pen')).map((p) => p.id)).toEqual([1]);
    expect(await service.getByCategory(3)).toEqual([]);
    expect(productQueries.search).toHaveBeenCalledWith('pen', 'en');
  });

  it('filters the related and top-selling lists', async () => {
    productQueries.getFiltered.mockResolvedValue({ products: [], total: 0 });
    expect(await service.getFilteredProducts({ limit: 4 })).toEqual({ products: [], total: 0 });

    productQueries.getFiltered.mockResolvedValue({ products: [{ id: 1 }, { id: 2 }], total: 2 });
    productQueries.getByIdsWithBrandAndCategory.mockResolvedValue([
      { product: productRow(1), brand: null, category: null },
      { product: productRow(2), brand: null, category: null },
    ]);
    productQueries.getVariantsByProductIds.mockResolvedValue({});
    productQueries.getProductTagsByProductIds.mockResolvedValue({});
    productQueries.getProductAttributesByProductIds.mockResolvedValue({});

    const related = await service.getRelatedProducts({ id: 1, categoryId: 3 } as never, 1);
    expect(related.map((p) => p.id)).toEqual([2]);
    expect((await service.getTopSellingProducts(2)).map((p) => p.id)).toEqual([1, 2]);
  });

  it('reads price bounds and products by tag', async () => {
    productQueries.getPriceBounds.mockResolvedValue({ minPrice: 1, maxPrice: 9 });
    expect(await service.getPriceBounds(3)).toEqual({ minPrice: 1, maxPrice: 9 });
    expect(await service.getProductsByTagIds([])).toEqual([]);
    productQueries.getProductsByTagIds.mockResolvedValue([]);
    expect(await service.getProductsByTagIds([1])).toEqual([]);
  });

  it('creates and updates products from translations and returns the stored product', async () => {
    productQueries.create.mockResolvedValue({ id: 8 });
    productQueries.update.mockResolvedValue(undefined);
    productQueries.getByIdWithBrandAndCategory
      .mockResolvedValueOnce({ product: productRow(8), brand: null, category: null })
      .mockResolvedValueOnce({ product: productRow(8), brand: null, category: null });
    productQueries.getVariantsByProductIds.mockResolvedValue({});
    productQueries.getProductTags.mockResolvedValue([]);
    productQueries.getProductAttributes.mockResolvedValue([]);

    const input = {
      isActive: true,
      categoryId: 3,
      brandId: 2,
      translations: [{ language: 'en', name: 'Pen', description: 'd', longDescription: 'l' }],
    } as never;
    expect((await service.create(input)).id).toBe(8);
    expect(productQueries.create).toHaveBeenCalledWith(
      expect.objectContaining({ localizedName: expect.objectContaining({ en: 'Pen' }) as unknown }),
    );
    expect((await service.update(8, input)).id).toBe(8);
    expect(productQueries.update).toHaveBeenCalledWith(
      8,
      expect.objectContaining({ isActive: true }),
    );
  });

  it('throws when the created or updated product cannot be read back', async () => {
    productQueries.create.mockResolvedValue({ id: 8 });
    productQueries.update.mockResolvedValue(undefined);
    productQueries.getByIdWithBrandAndCategory.mockResolvedValue(undefined);
    const input = {
      translations: [{ language: 'en', name: 'P', description: '', longDescription: '' }],
    } as never;
    await expect(service.create(input)).rejects.toThrow('Failed to retrieve created product 8');
    await expect(service.update(8, input)).rejects.toThrow('Failed to retrieve updated product 8');
  });

  it('deletes a product', async () => {
    await service.delete(4);
    expect(productQueries.deleteProduct).toHaveBeenCalledWith(4);
  });
});
