import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProductService } from '../index';
import { AdminProductReadService } from '../../administration-admin-product-read-service/index';
import { AdminProductMutationService } from '../../administration-admin-product-mutation-service/index';
import { AdminProductVariantService } from '../../administration-admin-product-variant-service/index';

vi.mock('@findeg/db/queries', () => ({}));

describe('AdminProductService facade', () => {
  let service: AdminProductService;

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new AdminProductService();
  });

  it('returns raw rows as products and null for unknown ids', async () => {
    vi.spyOn(AdminProductReadService.prototype, 'getAll').mockResolvedValue([{ id: 1 }] as never);
    vi.spyOn(AdminProductReadService.prototype, 'getById')
      .mockResolvedValueOnce({ id: 1 } as never)
      .mockResolvedValueOnce(null);
    expect(await service.getAll('en')).toEqual([{ id: 1 }]);
    expect(await service.getById(1)).toEqual({ id: 1 });
    expect(await service.getById(2)).toBeNull();
  });

  it('delegates reads to the read service', async () => {
    const list = vi
      .spyOn(AdminProductReadService.prototype, 'getProductsList')
      .mockResolvedValue({ products: [], total: 0, page: 1, pageSize: 20 });
    vi.spyOn(AdminProductReadService.prototype, 'count').mockResolvedValue(3);
    vi.spyOn(AdminProductReadService.prototype, 'getProductForEdit').mockResolvedValue(null);
    expect(await service.getProductsList({ page: 1 })).toMatchObject({ total: 0 });
    expect(list).toHaveBeenCalledWith({ page: 1 });
    expect(await service.count()).toBe(3);
    expect(await service.getProductForEdit(1)).toBeNull();
  });

  it('delegates mutations to the mutation service', async () => {
    const mutation = AdminProductMutationService.prototype;
    const spies = [
      vi.spyOn(mutation, 'createProduct').mockResolvedValue({ productId: 1 }),
      vi.spyOn(mutation, 'updateProduct').mockResolvedValue(undefined),
      vi.spyOn(mutation, 'duplicateProduct').mockResolvedValue({ newId: 2 }),
      vi.spyOn(mutation, 'bulkActivate').mockResolvedValue(undefined),
      vi.spyOn(mutation, 'bulkDeactivate').mockResolvedValue(undefined),
      vi.spyOn(mutation, 'bulkDelete').mockResolvedValue(undefined),
      vi.spyOn(mutation, 'deleteProduct').mockResolvedValue(undefined),
    ];
    expect(await service.createProduct({} as never, 1)).toEqual({ productId: 1 });
    await service.updateProduct(1, {});
    expect(await service.duplicateProduct(1)).toEqual({ newId: 2 });
    await service.bulkActivate([1]);
    await service.bulkDeactivate([1]);
    await service.bulkDelete([1]);
    await service.deleteProduct(1);
    for (const spy of spies) expect(spy).toHaveBeenCalled();
  });

  it('delegates variant work and slug and SKU checks to the variant service', async () => {
    const variant = AdminProductVariantService.prototype;
    const spies = [
      vi.spyOn(variant, 'deactivateVariant').mockResolvedValue(undefined),
      vi.spyOn(variant, 'generateVariants').mockResolvedValue([1]),
      vi.spyOn(variant, 'rebuildVariantKeys').mockResolvedValue(undefined),
      vi.spyOn(variant, 'checkSkuAvailable').mockResolvedValue(true),
      vi.spyOn(variant, 'upsertVariantImages').mockResolvedValue(undefined),
      vi.spyOn(variant, 'checkSlugAvailable').mockResolvedValue(false),
    ];
    await service.deactivateVariant(1);
    expect(await service.generateVariants(1, [], {})).toEqual([1]);
    await service.rebuildVariantKeys(1);
    expect(await service.checkSkuAvailable('A')).toBe(true);
    await service.upsertVariantImages(1, []);
    expect(await service.checkSlugAvailable('pen')).toBe(false);
    for (const spy of spies) expect(spy).toHaveBeenCalled();
  });
});
