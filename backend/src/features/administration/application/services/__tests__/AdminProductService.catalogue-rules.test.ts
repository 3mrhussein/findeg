import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createProductWithVariantsInDb,
  getProductById,
  getVariantsByIds,
  updateProductWithVariantsInDb,
} from '@findeg/db/queries';
import { AdminProductService } from '../AdminProductService';
import { ValidationError } from '../../../../core/domain/errors/ValidationError';
import type { CreateProductWithVariantsInput } from '@findeg/backend/features/catalog/application/dtos/VariantInput';

vi.mock('@findeg/db/queries', () => ({
  createProductWithVariantsInDb: vi.fn(),
  getBrandById: vi.fn(),
  getCategoryById: vi.fn(),
  getProductById: vi.fn(),
  getVariantsByIds: vi.fn(),
  updateProductWithVariantsInDb: vi.fn(),
}));

vi.mock('@findeg/db/connection', () => ({
  db: {},
  Db: class {},
}));

vi.mock('@findeg/db/schema', () => ({
  products: {},
  productTags: {},
  productVariants: {},
  variantImages: {},
  variantAttributes: {},
  attributes: {},
}));

/** Builds a product creation input with valid defaults and overrides for its single variant. */
function input(variantOverrides: Partial<CreateProductWithVariantsInput['variants'][number]>) {
  return {
    localizedName: { en: 'Notebook', ar: 'دفتر' },
    tagIds: [],
    isActive: true,
    pricingMode: 'per-variant',
    variants: [
      {
        sku: 'NB-A4',
        localizedLabel: { en: 'A4', ar: 'A4' },
        sortOrder: 0,
        isDefault: true,
        isActive: true,
        basePrice: 45,
        strikePrice: 60,
        images: [],
        attributes: [],
        ...variantOverrides,
      },
    ],
  } as CreateProductWithVariantsInput;
}

describe('AdminProductService catalogue write rules', () => {
  let service: AdminProductService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createProductWithVariantsInDb).mockResolvedValue(42);
    service = new AdminProductService();
  });

  it('saves a variant whose compare-at price is above its price', async () => {
    await expect(service.createProduct(input({}))).resolves.toEqual({ productId: 42 });
  });

  it('refuses a compare-at price equal to the price, before any write', async () => {
    await expect(service.createProduct(input({ strikePrice: 45 }))).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(createProductWithVariantsInDb).not.toHaveBeenCalled();
  });

  it('refuses a blank SKU, before any write', async () => {
    await expect(service.createProduct(input({ sku: '  ' }))).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(createProductWithVariantsInDb).not.toHaveBeenCalled();
  });

  it('refuses equal base and compare-at prices when both are zero', async () => {
    await expect(
      service.createProduct(input({ basePrice: 0, strikePrice: 0 })),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(createProductWithVariantsInDb).not.toHaveBeenCalled();
  });
  it('refuses a strike-price-only update below the persisted base price', async () => {
    vi.mocked(getProductById).mockResolvedValue({ id: 42 } as never);
    vi.mocked(getVariantsByIds).mockResolvedValue([
      { id: 7, productId: 42, basePrice: '45.00', strikePrice: '60.00' },
    ] as never);
    await expect(
      service.updateProduct(42, { variants: [{ id: 7, strikePrice: 40 }] }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(updateProductWithVariantsInDb).not.toHaveBeenCalled();
  });

  it('refuses a base-price-only update reaching the persisted compare-at price', async () => {
    vi.mocked(getProductById).mockResolvedValue({ id: 42 } as never);
    vi.mocked(getVariantsByIds).mockResolvedValue([
      { id: 7, productId: 42, basePrice: '45.00', strikePrice: '60.00' },
    ] as never);
    await expect(
      service.updateProduct(42, { variants: [{ id: 7, basePrice: 60 }] }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(updateProductWithVariantsInDb).not.toHaveBeenCalled();
  });

  it.each([75, null])(
    'allows a valid strike-price-only update or explicit clearing: %s',
    async (strikePrice) => {
      vi.mocked(getProductById).mockResolvedValue({ id: 42 } as never);
      vi.mocked(getVariantsByIds).mockResolvedValue([
        { id: 7, productId: 42, basePrice: '45.00', strikePrice: '60.00' },
      ] as never);
      await expect(
        service.updateProduct(42, { variants: [{ id: 7, strikePrice }] }),
      ).resolves.toBeUndefined();
      expect(updateProductWithVariantsInDb).toHaveBeenCalledWith(42, {
        variants: [{ id: 7, strikePrice }],
      });
    },
  );
});
