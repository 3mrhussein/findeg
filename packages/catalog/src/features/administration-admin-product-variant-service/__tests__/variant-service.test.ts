import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProductVariantService } from '../index';

const queries = vi.hoisted(() => ({
  checkProductSlugAvailable: vi.fn(),
  checkProductVariantSkuAvailable: vi.fn(),
  deactivateProductVariant: vi.fn(),
  getProductVariantAttributes: vi.fn(),
  insertGeneratedProductVariants: vi.fn(),
  updateProductVariantKey: vi.fn(),
  upsertProductVariantImages: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

describe('AdminProductVariantService', () => {
  let audit: { logAction: ReturnType<typeof vi.fn> };
  let service: AdminProductVariantService;
  beforeEach(() => {
    vi.clearAllMocks();
    audit = { logAction: vi.fn().mockResolvedValue(undefined) };
    service = new AdminProductVariantService(audit as never);
  });

  it('deactivates a variant and audits it', async () => {
    await service.deactivateVariant(3, 2);
    expect(queries.deactivateProductVariant).toHaveBeenCalledWith(3);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'deactivate', entityId: '3', adminUserId: 2 }),
    );
  });

  it('generates variants from dimensions and returns their ids', async () => {
    queries.insertGeneratedProductVariants.mockResolvedValue([11, 12]);
    const ids = await service.generateVariants(
      7,
      [{ attributeKey: 'color', options: ['Blue', 'Red'] } as never],
      { sku: 'PEN' },
    );
    expect(ids).toEqual([11, 12]);
    expect(queries.insertGeneratedProductVariants).toHaveBeenCalledWith(
      7,
      expect.arrayContaining([expect.objectContaining({ variantKey: 'blue', sku: 'PEN' })]),
    );
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'generate_variants', newValues: { count: 2 } }),
    );
  });

  it('rebuilds variant keys from attribute rows', async () => {
    queries.getProductVariantAttributes.mockResolvedValue([
      { variantId: 1, key: 'color', valueText: 'Blue' },
    ]);
    await service.rebuildVariantKeys(7);
    expect(queries.updateProductVariantKey).toHaveBeenCalledWith(1, 'blue');
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'rebuild_variant_keys' }),
    );
  });

  it('normalises SKUs before checking availability and upserts images', async () => {
    queries.checkProductVariantSkuAvailable.mockResolvedValue(true);
    expect(await service.checkSkuAvailable('  abc-1 ', 4)).toBe(true);
    expect(queries.checkProductVariantSkuAvailable).toHaveBeenCalledWith('ABC-1', 4);

    await service.upsertVariantImages(5, [{ url: 'https://x/y.png' } as never], 1);
    expect(queries.upsertProductVariantImages).toHaveBeenCalledWith(5, [
      { url: 'https://x/y.png' },
    ]);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'upsert_images' }),
    );
  });

  it('checks slug availability and works without an audit service', async () => {
    queries.checkProductSlugAvailable.mockResolvedValue(false);
    expect(await service.checkSlugAvailable('pen', 2)).toBe(false);
    const bare = new AdminProductVariantService();
    await bare.deactivateVariant(1);
    expect(queries.deactivateProductVariant).toHaveBeenCalledWith(1);
  });
});
