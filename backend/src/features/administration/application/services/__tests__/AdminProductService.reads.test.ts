import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAdminProductForEditRaw,
  getAdminProductsListRaw,
} from '@findeg/db/queries';
import { AdminProductService } from '../AdminProductService';

vi.mock('@findeg/db/queries', () => ({
  getAdminProductsListRaw: vi.fn(),
  getAdminProductForEditRaw: vi.fn(),
}));

vi.mock('@findeg/db/connection', () => ({
  db: {},
  Db: class { },
}));

vi.mock('@findeg/db/schema', () => ({
  products: {},
  productVariants: {},
  variantImages: {},
  variantAttributes: {},
  productTags: {},
  attributes: {},
}));

describe('AdminProductService reads', () => {
  let service: AdminProductService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminProductService();
  });

  it('maps product list rows for admin display', async () => {
    vi.mocked(getAdminProductsListRaw).mockResolvedValue({
      rows: [
        {
          id: 1,
          localizedName: { en: 'Notebook', ar: 'دفتر' },
          categoryId: null,
          categoryName: null,
          brandId: null,
          brandName: null,
          isActive: true,
          updatedAt: new Date('2026-05-01T00:00:00.000Z'),
          defaultVariantPrice: null,
          totalStock: 0,
          variantCount: 1,
          hasImages: false,
          thumbnailUrl: null,
        },
        {
          id: 2,
          localizedName: { en: 'Pen', ar: 'قلم' },
          categoryId: 10,
          categoryName: 'Writing',
          brandId: 12,
          brandName: 'Acme',
          isActive: false,
          updatedAt: new Date('2026-05-02T00:00:00.000Z'),
          defaultVariantPrice: 15,
          totalStock: 9,
          variantCount: 2,
          hasImages: true,
          thumbnailUrl: 'https://cdn.example/pen.jpg',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    });

    const result = await service.getProductsList({ page: 1, pageSize: 20 });

    expect(getAdminProductsListRaw).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    expect(result).toEqual({
      products: [
        {
          id: 1,
          sku: 'N/A',
          localizedName: { en: 'Notebook', ar: 'دفتر' },
          categoryId: null,
          categoryName: null,
          brandId: null,
          brandName: null,
          defaultVariantPrice: null,
          totalStock: 0,
          isActive: true,
          hasImages: false,
          updatedAt: new Date('2026-05-01T00:00:00.000Z'),
          variantCount: 1,
          thumbnailUrl: null,
          completeness: 'no-category',
        },
        {
          id: 2,
          sku: 'N/A',
          localizedName: { en: 'Pen', ar: 'قلم' },
          categoryId: 10,
          categoryName: 'Writing',
          brandId: 12,
          brandName: 'Acme',
          defaultVariantPrice: 15,
          totalStock: 9,
          isActive: false,
          hasImages: true,
          updatedAt: new Date('2026-05-02T00:00:00.000Z'),
          variantCount: 2,
          thumbnailUrl: 'https://cdn.example/pen.jpg',
          completeness: 'draft',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    });
  });

  it('maps edit-form data from db reads', async () => {
    vi.mocked(getAdminProductForEditRaw).mockResolvedValue({
      id: 5,
      slug: 'notebook',
      localizedName: { en: 'Notebook', ar: 'دفتر' },
      localizedDescription: { en: 'Short', ar: 'قصير' },
      localizedLongDescription: { en: 'Long', ar: 'طويل' },
      name: 'Notebook',
      description: 'Short',
      longDescription: 'Long',
      locale: 'en',
      isActive: true,
      rating: '4.5',
      reviewsCount: 3,
      variants: [
        {
          id: 10,
          productId: 5,
          sku: 'NB-001',
          variantKey: 'default',
          localizedLabel: { en: 'Default', ar: 'افتراضي' },
          sortOrder: 0,
          isDefault: true,
          isActive: true,
          basePrice: '12.5',
          strikePrice: '15',
          costPrice: '9',
          images: [{ id: 1, url: 'https://cdn.example/image.jpg', displayOrder: 0 }],
          attributes: [
            {
              attributeId: 7,
              valueText: 'A4',
              definition: { key: 'size' },
            },
          ],
        },
      ],
      tags: [
        {
          tag: {
            id: 3,
            group: 'catalog',
            key: 'featured',
            slug: 'featured',
            isActive: true,
            scope: 'catalog',
            createdAt: new Date('2026-05-01T00:00:00.000Z'),
            updatedAt: new Date('2026-05-01T00:00:00.000Z'),
          },
        },
      ],
    } as never);

    const result = await service.getProductForEdit(5);

    expect(getAdminProductForEditRaw).toHaveBeenCalledWith(5);
    expect(result).toMatchObject({
      id: 5,
      rating: 4.5,
      variants: [
        {
          id: 10,
          basePrice: 12.5,
          strikePrice: 15,
          costPrice: 9,
          images: [{ id: 1, url: 'https://cdn.example/image.jpg', displayOrder: 0 }],
          attributes: [
            {
              attributeId: 7,
              key: 'size',
              valueText: 'A4',
            },
          ],
        },
      ],
      tags: [
        {
          id: 3,
          key: 'featured',
        },
      ],
    });
  });

  it('returns null when edit-form data is missing', async () => {
    vi.mocked(getAdminProductForEditRaw).mockResolvedValue(undefined);

    await expect(service.getProductForEdit(999)).resolves.toBeNull();
  });
});