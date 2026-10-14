import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProductMutationService } from '../index';

const queries = vi.hoisted(() => ({
  bulkActivateProducts: vi.fn(),
  bulkDeactivateProducts: vi.fn(),
  bulkDeleteProducts: vi.fn(),
  createProductWithVariantsInDb: vi.fn(),
  duplicateProductWithVariants: vi.fn(),
  updateProductWithVariantsInDb: vi.fn(),
  getCategoryById: vi.fn(),
  getBrandById: vi.fn(),
  getProductById: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

const variant = (overrides: Record<string, unknown> = {}) => ({
  sku: 'SKU-1',
  basePrice: 10,
  strikePrice: null,
  ...overrides,
});

describe('AdminProductMutationService', () => {
  let audit: { logAction: ReturnType<typeof vi.fn> };
  let service: AdminProductMutationService;
  beforeEach(() => {
    vi.clearAllMocks();
    audit = { logAction: vi.fn().mockResolvedValue(undefined) };
    service = new AdminProductMutationService({ auditLogService: audit as never });
    queries.getCategoryById.mockResolvedValue({ id: 1 });
    queries.getBrandById.mockResolvedValue({ id: 1 });
    queries.getProductById.mockResolvedValue({ id: 1 });
  });

  it('creates a product after checking its references and audits it', async () => {
    queries.createProductWithVariantsInDb.mockResolvedValue(9);
    const result = await service.createProduct(
      { categoryId: 1, brandId: 1, variants: [variant()] } as never,
      5,
    );
    expect(result).toEqual({ productId: 9 });
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'create', entityId: '9', adminUserId: 5 }),
    );
  });

  it('rejects a create whose variant pricing breaks the catalogue rules', async () => {
    await expect(
      service.createProduct({ variants: [variant({ basePrice: 10, strikePrice: 5 })] } as never),
    ).rejects.toThrow();
    expect(queries.createProductWithVariantsInDb).not.toHaveBeenCalled();
  });

  it('applies shared pricing when checking an update', async () => {
    queries.updateProductWithVariantsInDb.mockResolvedValue(undefined);
    await service.updateProduct(
      1,
      {
        pricingMode: 'shared',
        sharedBasePrice: 10,
        sharedStrikePrice: 12,
        variants: [variant({ basePrice: 999 })],
      } as never,
      2,
    );
    expect(queries.updateProductWithVariantsInDb).toHaveBeenCalledWith(1, expect.anything());
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update', entityId: '1' }),
    );
  });

  it('fails an update for a missing product before writing', async () => {
    queries.getProductById.mockResolvedValueOnce(undefined);
    await expect(service.updateProduct(4, {} as never)).rejects.toThrow('Product 4 not found');
    expect(queries.updateProductWithVariantsInDb).not.toHaveBeenCalled();
  });

  it('duplicates a product and audits the new id', async () => {
    queries.duplicateProductWithVariants.mockResolvedValue({ newId: 12 });
    expect(await service.duplicateProduct(3)).toEqual({ newId: 12 });
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'duplicate', newValues: { newProductId: 12 } }),
    );
  });

  it('runs bulk operations, skipping empty selections', async () => {
    await service.bulkActivate([]);
    await service.bulkDeactivate([]);
    await service.bulkDelete([]);
    expect(queries.bulkActivateProducts).not.toHaveBeenCalled();

    await service.bulkActivate([1, 2]);
    await service.bulkDeactivate([3]);
    await service.bulkDelete([4]);
    expect(queries.bulkActivateProducts).toHaveBeenCalledWith([1, 2]);
    expect(queries.bulkDeactivateProducts).toHaveBeenCalledWith([3]);
    expect(queries.bulkDeleteProducts).toHaveBeenCalledWith([4]);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'bulk_delete' }),
    );
  });

  it('deletes a single existing product and audits it', async () => {
    await service.deleteProduct(6, 1);
    expect(queries.bulkDeleteProducts).toHaveBeenCalledWith([6]);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'delete', entityId: '6' }),
    );
  });

  it('works without an audit service', async () => {
    const bare = new AdminProductMutationService({});
    await bare.bulkDelete([1]);
    expect(queries.bulkDeleteProducts).toHaveBeenCalledWith([1]);
  });
});
