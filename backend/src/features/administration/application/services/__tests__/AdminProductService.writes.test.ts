import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bulkActivateProducts,
  bulkDeactivateProducts,
  bulkDeleteProducts,
  checkProductSlugAvailable,
  checkProductVariantSkuAvailable,
  createProductWithVariantsInDb,
  deactivateProductVariant,
  duplicateProductWithVariants,
  getProductVariantAttributes,
  insertGeneratedProductVariants,
  updateProductWithVariantsInDb,
  updateProductVariantKey,
  upsertProductVariantImages,
} from '@findeg/db/queries';
import { AdminProductService } from '../AdminProductService';
import type { IAuditLogService } from '../../interfaces/IAuditLogService';

const mocks = vi.hoisted(() => {
  return {
    db: {},
  };
});

vi.mock('@findeg/db/queries', () => ({
  bulkActivateProducts: vi.fn(),
  bulkDeactivateProducts: vi.fn(),
  bulkDeleteProducts: vi.fn(),
  checkProductSlugAvailable: vi.fn(),
  checkProductVariantSkuAvailable: vi.fn(),
  createProductWithVariantsInDb: vi.fn(),
  deactivateProductVariant: vi.fn(),
  duplicateProductWithVariants: vi.fn(),
  getProductVariantAttributes: vi.fn(),
  insertGeneratedProductVariants: vi.fn(),
  updateProductWithVariantsInDb: vi.fn(),
  updateProductVariantKey: vi.fn(),
  upsertProductVariantImages: vi.fn(),
}));

vi.mock('@findeg/db/connection', () => ({
  db: mocks.db,
}));

vi.mock('@findeg/db/schema', () => ({
  products: {},
  productTags: {},
  productVariants: {},
  variantImages: {},
  variantAttributes: {},
  attributes: {},
}));

describe('AdminProductService writes', () => {
  let auditLogService: IAuditLogService;
  let service: AdminProductService;

  beforeEach(() => {
    vi.clearAllMocks();

    auditLogService = {
      logAction: vi.fn().mockResolvedValue(undefined),
    } as unknown as IAuditLogService;

    service = new AdminProductService(auditLogService);
  });

  it('delegates product creation to the db helper after validation and logs the action', async () => {
    vi.mocked(createProductWithVariantsInDb).mockResolvedValue(123);

    const input = {
      localizedName: { en: 'Notebook', ar: 'دفتر' },
      localizedDescription: { en: 'Short', ar: 'قصير' },
      localizedLongDescription: { en: 'Long', ar: 'طويل' },
      slug: 'notebook',
      categoryId: 10,
      brandId: 12,
      tagIds: [1, 2],
      isActive: true,
      pricingMode: 'shared' as const,
      sharedBasePrice: 25,
      sharedStrikePrice: 30,
      sharedCostPrice: 15,
      variants: [
        {
          sku: 'nb-1',
          localizedLabel: { en: 'Blue', ar: 'أزرق' },
          sortOrder: 0,
          isDefault: true,
          isActive: true,
          basePrice: 10,
          images: [],
          attributes: [],
        },
        {
          sku: 'nb-2',
          localizedLabel: { en: 'Red', ar: 'أحمر' },
          sortOrder: 1,
          isDefault: false,
          isActive: true,
          basePrice: 11,
          images: [],
          attributes: [],
        },
      ],
    };

    const result = await service.createProduct(input, 77);

    expect(result).toEqual({ productId: 123 });
    expect(createProductWithVariantsInDb).toHaveBeenCalledWith(input);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: '123',
        action: 'create',
        adminUserId: 77,
      }),
    );
  });

  it('normalizes SKU before checking availability', async () => {
    vi.mocked(checkProductVariantSkuAvailable).mockResolvedValue(true);

    await expect(service.checkSkuAvailable(' ab-12 ', 5)).resolves.toBe(true);

    expect(checkProductVariantSkuAvailable).toHaveBeenCalledWith('AB-12', 5);
  });

  it('delegates variant deactivation and logs the action', async () => {
    vi.mocked(deactivateProductVariant).mockResolvedValue(undefined);

    await service.deactivateVariant(88, 9);

    expect(deactivateProductVariant).toHaveBeenCalledWith(88);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product_variant',
        entityId: '88',
        action: 'deactivate',
        adminUserId: 9,
      }),
    );
  });

  it('delegates image upsert and logs the action', async () => {
    vi.mocked(upsertProductVariantImages).mockResolvedValue(undefined);

    await service.upsertVariantImages(
      42,
      [{ url: 'https://cdn.example/image.jpg', alt: 'Front', displayOrder: 0 }],
      11,
    );

    expect(upsertProductVariantImages).toHaveBeenCalledWith(42, [
      { url: 'https://cdn.example/image.jpg', alt: 'Front', displayOrder: 0 },
    ]);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product_variant',
        entityId: '42',
        action: 'upsert_images',
        adminUserId: 11,
      }),
    );
  });

  it('delegates slug availability checks to the db helper', async () => {
    vi.mocked(checkProductSlugAvailable).mockResolvedValue(false);

    await expect(service.checkSlugAvailable('notebook', 12)).resolves.toBe(false);

    expect(checkProductSlugAvailable).toHaveBeenCalledWith('notebook', 12);
  });

  it('delegates product duplication to the db helper and logs the action', async () => {
    vi.mocked(duplicateProductWithVariants).mockResolvedValue({ newId: 321 });

    await expect(service.duplicateProduct(55, 14)).resolves.toEqual({ newId: 321 });

    expect(duplicateProductWithVariants).toHaveBeenCalledWith(55);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: '55',
        action: 'duplicate',
        adminUserId: 14,
        newValues: { newProductId: 321 },
      }),
    );
  });

  it('delegates product update to the db helper after validation and logs the action', async () => {
    vi.mocked(updateProductWithVariantsInDb).mockResolvedValue(undefined);

    const input = {
      localizedName: { en: 'Updated', ar: 'محدث' },
      categoryId: 10,
      variantsToDeactivate: [8],
    };

    await expect(service.updateProduct(123, input, 16)).resolves.toBeUndefined();

    expect(updateProductWithVariantsInDb).toHaveBeenCalledWith(123, input);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: '123',
        action: 'update',
        adminUserId: 16,
        newValues: input,
      }),
    );
  });

  it('computes generated variants in the service and delegates persistence to the db helper', async () => {
    vi.mocked(insertGeneratedProductVariants).mockResolvedValue([201, 202]);

    const dimensions = [
      {
        attributeKey: 'color',
        label: { en: 'Color', ar: 'اللون' },
        options: ['blue', 'red'],
        isVariantDefining: true as const,
      },
    ];

    const defaults = {
      sku: 'PEN',
      localizedLabel: { en: 'Pen', ar: 'قلم' },
      basePrice: 5,
      isActive: true,
    };

    await expect(service.generateVariants(99, dimensions, defaults, 31)).resolves.toEqual([201, 202]);

    expect(insertGeneratedProductVariants).toHaveBeenCalledWith(
      99,
      [
        expect.objectContaining({
          sku: 'PEN',
          sortOrder: 0,
          isDefault: true,
          basePrice: 5,
          attributes: [{ attributeKey: 'color', value: 'blue' }],
        }),
        expect.objectContaining({
          sku: 'PEN',
          sortOrder: 1,
          isDefault: false,
          basePrice: 5,
          attributes: [{ attributeKey: 'color', value: 'red' }],
        }),
      ],
    );
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: '99',
        action: 'generate_variants',
        adminUserId: 31,
        newValues: { count: 2 },
      }),
    );
  });

  it('rebuilds variant keys from helper rows and delegates updates to the db helper', async () => {
    vi.mocked(getProductVariantAttributes).mockResolvedValue([
      { variantId: 41, key: 'color', valueText: 'blue' },
      { variantId: 42, key: 'color', valueText: 'red' },
    ]);
    vi.mocked(updateProductVariantKey).mockResolvedValue(undefined);

    await expect(service.rebuildVariantKeys(77, 41)).resolves.toBeUndefined();

    expect(getProductVariantAttributes).toHaveBeenCalledWith(77);
    expect(updateProductVariantKey).toHaveBeenNthCalledWith(1, 41, 'blue');
    expect(updateProductVariantKey).toHaveBeenNthCalledWith(2, 42, 'red');
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: '77',
        action: 'rebuild_variant_keys',
        adminUserId: 41,
      }),
    );
  });

  it('delegates bulk activation and logs the action', async () => {
    vi.mocked(bulkActivateProducts).mockResolvedValue(undefined);

    await service.bulkActivate([1, 2, 3], 20);

    expect(bulkActivateProducts).toHaveBeenCalledWith([1, 2, 3]);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: 'multiple',
        action: 'bulk_activate',
        adminUserId: 20,
        newValues: { ids: [1, 2, 3] },
      }),
    );
  });

  it('delegates bulk deactivation and logs the action', async () => {
    vi.mocked(bulkDeactivateProducts).mockResolvedValue(undefined);

    await service.bulkDeactivate([4, 5], 21);

    expect(bulkDeactivateProducts).toHaveBeenCalledWith([4, 5]);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: 'multiple',
        action: 'bulk_deactivate',
        adminUserId: 21,
        newValues: { ids: [4, 5] },
      }),
    );
  });

  it('delegates bulk deletion and logs the action', async () => {
    vi.mocked(bulkDeleteProducts).mockResolvedValue(undefined);

    await service.bulkDelete([7, 8], 22);

    expect(bulkDeleteProducts).toHaveBeenCalledWith([7, 8]);
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'product',
        entityId: 'multiple',
        action: 'bulk_delete',
        adminUserId: 22,
        newValues: { ids: [7, 8] },
      }),
    );
  });
});