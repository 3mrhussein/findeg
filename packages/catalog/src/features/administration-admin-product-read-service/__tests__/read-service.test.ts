import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProductReadService } from '../index';

const queries = vi.hoisted(() => ({
  getAdminProductForEditRaw: vi.fn(),
  getAdminProductsListRaw: vi.fn(),
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  countProducts: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

describe('AdminProductReadService', () => {
  let service: AdminProductReadService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminProductReadService();
  });

  it('maps the paged product list', async () => {
    queries.getAdminProductsListRaw.mockResolvedValue({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(await service.getProductsList({ page: 1 })).toEqual({
      products: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
  });

  it('returns raw rows for legacy reads and counts', async () => {
    queries.getAllProducts.mockResolvedValue([{ id: 1 }]);
    queries.getProductById.mockResolvedValueOnce({ id: 1 });
    queries.getProductById.mockResolvedValueOnce(undefined);
    queries.countProducts.mockResolvedValue(4);
    expect(await service.getAll()).toEqual([{ id: 1 }]);
    expect(await service.getById(1)).toEqual({ id: 1 });
    expect(await service.getById(2)).toBeUndefined();
    expect(await service.count()).toBe(4);
  });

  it('returns null for unknown products and maps the edit data otherwise', async () => {
    queries.getAdminProductForEditRaw.mockResolvedValueOnce(null);
    expect(await service.getProductForEdit(1)).toBeNull();

    queries.getAdminProductForEditRaw.mockResolvedValueOnce({
      id: 1,
      rating: '3',
      localizedName: { en: 'Pen', ar: 'قلم' },
      localizedDescription: { en: '', ar: '' },
      localizedLongDescription: { en: '', ar: '' },
      variants: [],
      tags: [],
    });
    const edit = await service.getProductForEdit(1);
    expect(edit?.rating).toBe(3);
    expect(edit?.localizedContent?.name).toEqual({ en: 'Pen', ar: 'قلم' });
  });
});
