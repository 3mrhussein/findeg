import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminBrandService } from '../index';

const queries = vi.hoisted(() => ({
  getAllBrands: vi.fn(),
  getBrandById: vi.fn(),
  getBrandBySlug: vi.fn(),
  createBrand: vi.fn(),
  updateBrand: vi.fn(),
  deleteBrand: vi.fn(),
  countProductsByBrandId: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  slug: 'acme',
  localizedName: { en: 'Acme', ar: 'اكمي' },
  localizedDescription: null,
  logoUrl: null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const input = {
  slug: 'acme',
  nameEn: 'Acme',
  nameAr: 'اكمي',
  descriptionEn: 'Pens',
  descriptionAr: 'أقلام',
  isActive: true,
} as never;

describe('AdminBrandService branches', () => {
  let audit: { logAction: ReturnType<typeof vi.fn> };
  let service: AdminBrandService;
  beforeEach(() => {
    vi.clearAllMocks();
    audit = { logAction: vi.fn().mockResolvedValue(undefined) };
    service = new AdminBrandService(audit as never);
  });

  it('lists brands in the requested language, defaulting to English', async () => {
    queries.getAllBrands.mockResolvedValue([row()]);
    expect((await service.getAll(false, 'ar'))[0]).toMatchObject({ name: 'اكمي', locale: 'ar' });
    expect((await service.getAll())[0]).toMatchObject({ name: 'Acme', locale: 'en' });
  });

  it('reads a brand by id or returns null', async () => {
    queries.getBrandById.mockResolvedValueOnce(row({ localizedDescription: { en: 'Pens' } }));
    const found = await service.getById(1);
    expect(found?.description).toBe('Pens');
    queries.getBrandById.mockResolvedValueOnce(undefined);
    expect(await service.getById(2)).toBeNull();
  });

  it('creates a brand with localized text and audits it', async () => {
    queries.createBrand.mockResolvedValue(row({ id: 3 }));
    const brand = await service.create(input);
    expect(brand.id).toBe(3);
    expect(queries.createBrand).toHaveBeenCalledWith(
      expect.objectContaining({
        localizedName: { en: 'Acme', ar: 'اكمي' },
        localizedDescription: { en: 'Pens', ar: 'أقلام' },
      }),
    );
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'create', entityId: '3' }),
    );
  });

  it('creates without an audit trail when none is configured', async () => {
    queries.createBrand.mockResolvedValue(row({ id: 4 }));
    const bare = new AdminBrandService();
    expect((await bare.create(input)).id).toBe(4);
    expect(audit.logAction).not.toHaveBeenCalled();
  });

  it('updates an existing brand and audits old and new values', async () => {
    queries.getBrandById.mockResolvedValue(row());
    queries.updateBrand.mockResolvedValue(row({ isActive: false }));
    const brand = await service.update(1, { ...(input as object), isActive: false } as never);
    expect(brand.isActive).toBe(false);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update', entityId: '1' }),
    );

    const bare = new AdminBrandService();
    await bare.update(1, input);
    expect(queries.updateBrand).toHaveBeenCalledTimes(2);
  });

  it('rejects updates for unknown brands', async () => {
    queries.getBrandById.mockResolvedValue(undefined);
    await expect(service.update(9, input)).rejects.toThrow('Brand with ID 9 not found');
  });

  it('refuses to delete a brand that still has products', async () => {
    queries.getBrandById.mockResolvedValue(row());
    queries.countProductsByBrandId.mockResolvedValue(2);
    await expect(service.delete(1)).rejects.toThrow(
      'Cannot delete brand with 2 associated product(s)',
    );
    expect(queries.deleteBrand).not.toHaveBeenCalled();
  });

  it('deletes an unused brand and audits it, and rejects unknown ones', async () => {
    queries.getBrandById.mockResolvedValue(row());
    queries.countProductsByBrandId.mockResolvedValue(0);
    await service.delete(1);
    expect(queries.deleteBrand).toHaveBeenCalledWith(1);
    expect(audit.logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'delete' }));

    const bare = new AdminBrandService();
    await bare.delete(1);
    expect(queries.deleteBrand).toHaveBeenCalledTimes(2);

    queries.getBrandById.mockResolvedValue(undefined);
    await expect(service.delete(7)).rejects.toThrow('Brand with ID 7 not found');
  });

  it('checks slug availability, allowing the brand being edited', async () => {
    queries.getBrandBySlug.mockResolvedValueOnce(undefined);
    expect(await service.checkSlugAvailable('new')).toBe(true);
    queries.getBrandBySlug.mockResolvedValueOnce({ id: 5 });
    expect(await service.checkSlugAvailable('taken')).toBe(false);
    queries.getBrandBySlug.mockResolvedValueOnce({ id: 5 });
    expect(await service.checkSlugAvailable('taken', 5)).toBe(true);
  });

  it('toggles the active status of a brand and rejects unknown ones', async () => {
    queries.getBrandById.mockResolvedValueOnce(
      row({ localizedDescription: { en: 'Pens', ar: 'أقلام' } }),
    );
    queries.getBrandById.mockResolvedValueOnce(
      row({ localizedDescription: { en: 'Pens', ar: 'أقلام' } }),
    );
    queries.updateBrand.mockResolvedValue(row({ isActive: false }));
    const toggled = await service.toggleBrandStatus(1);
    expect(toggled.isActive).toBe(false);
    expect(queries.updateBrand).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ isActive: false }),
    );

    queries.getBrandById.mockResolvedValueOnce(undefined);
    await expect(service.toggleBrandStatus(8)).rejects.toThrow('Brand not found');
  });

  it('reports the product count of a brand', async () => {
    queries.countProductsByBrandId.mockResolvedValue(4);
    expect(await service.getBrandProductCount(1)).toBe(4);
  });
});
