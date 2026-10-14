import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBrandById, updateBrand } from '@findeg/db/queries';
import { AdminBrandService } from '../index';

vi.mock('@findeg/db/queries', () => ({
  getAllBrands: vi.fn(),
  getBrandById: vi.fn(),
  getBrandBySlug: vi.fn(),
  createBrand: vi.fn(),
  updateBrand: vi.fn(),
  deleteBrand: vi.fn(),
  countProductsByBrandId: vi.fn(),
}));

const storedBrand = {
  id: 14,
  slug: 'faber',
  localizedName: { en: 'Faber', ar: 'فابر' },
  localizedDescription: { en: '', ar: '' },
  logoUrl: null,
  isActive: true,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
};

describe('AdminBrandService', () => {
  let service: AdminBrandService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminBrandService();
    vi.mocked(getBrandById).mockResolvedValue(storedBrand);
    vi.mocked(updateBrand).mockImplementation((_id, data) =>
      Promise.resolve().then(() => ({ ...storedBrand, ...data })),
    );
  });

  it('persists the active flag when updating a brand', async () => {
    await service.update(14, {
      slug: 'faber',
      nameEn: 'Faber',
      nameAr: 'فابر',
      isActive: false,
    });

    expect(updateBrand).toHaveBeenCalledWith(14, expect.objectContaining({ isActive: false }));
  });

  it('flips the stored active flag when toggling status', async () => {
    const toggled = await service.toggleBrandStatus(14);

    expect(updateBrand).toHaveBeenCalledWith(14, expect.objectContaining({ isActive: false }));
    expect(toggled.isActive).toBe(false);
  });

  it('refuses deletion when brand is in use by products', async () => {
    const { countProductsByBrandId, deleteBrand } = await import('@findeg/db/queries');
    vi.mocked(countProductsByBrandId).mockResolvedValue(3);

    await expect(service.delete(14)).rejects.toThrow(
      'Cannot delete brand with 3 associated product(s)',
    );
    expect(deleteBrand).not.toHaveBeenCalled();
  });

  it('allows deletion when brand has zero products', async () => {
    const { countProductsByBrandId, deleteBrand } = await import('@findeg/db/queries');
    vi.mocked(countProductsByBrandId).mockResolvedValue(0);

    await service.delete(14);
    expect(deleteBrand).toHaveBeenCalledWith(14);
  });

  it('checks slug availability correctly', async () => {
    const { getBrandBySlug } = await import('@findeg/db/queries');
    vi.mocked(getBrandBySlug).mockResolvedValue(storedBrand);

    expect(await service.checkSlugAvailable('faber', 14)).toBe(true);
    expect(await service.checkSlugAvailable('faber', 99)).toBe(false);

    vi.mocked(getBrandBySlug).mockResolvedValue(null);
    expect(await service.checkSlugAvailable('new-brand')).toBe(true);
  });
});
