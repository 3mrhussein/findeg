import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProductWithVariantsInDb } from '@findeg/db/queries';
import { AdminProductService } from '../AdminProductService';
import { ValidationError } from '../../../../core/domain/errors/ValidationError';
import type { CreateProductWithVariantsInput } from '@findeg/backend/features/catalog/application/dtos/VariantInput';

vi.mock('@findeg/db/queries', () => ({
  createProductWithVariantsInDb: vi.fn(),
  getBrandById: vi.fn(),
  getCategoryById: vi.fn(),
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
});
