import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBrandById, updateBrand } from '@findeg/db/queries';
import { AdminBrandService } from '../AdminBrandService';

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
    vi.mocked(getBrandById).mockResolvedValue(storedBrand as never);
    vi.mocked(updateBrand).mockImplementation(
      async (_id, data) => ({ ...storedBrand, ...data }) as never,
    );
  });

  it('persists the active flag when updating a brand', async () => {
    await service.update(14, {
      slug: 'faber',
      nameEn: 'Faber',
      nameAr: 'فابر',
      isActive: false,
    } as never);

    expect(updateBrand).toHaveBeenCalledWith(14, expect.objectContaining({ isActive: false }));
  });

  it('flips the stored active flag when toggling status', async () => {
    const toggled = await service.toggleBrandStatus(14);

    expect(updateBrand).toHaveBeenCalledWith(14, expect.objectContaining({ isActive: false }));
    expect(toggled.isActive).toBe(false);
  });
});
