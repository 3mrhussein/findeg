import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandService } from '../index';

const { brandQueries } = vi.hoisted(() => ({
  brandQueries: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteById: vi.fn(),
  },
}));
vi.mock('@findeg/db/queries', () => ({ brandQueries }));

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  slug: 'acme',
  localizedName: { en: 'Acme', ar: 'اكمي' },
  localizedDescription: { en: 'Pens', ar: '' },
  logoUrl: null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  ...overrides,
});

describe('BrandService', () => {
  let service: BrandService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new BrandService();
  });

  it('localizes brands and filters inactive ones when asked', async () => {
    brandQueries.getAll.mockResolvedValue([row(), row({ id: 2, isActive: false })]);
    const all = await service.getAll(undefined, 'ar');
    expect(all).toHaveLength(2);
    expect(all[0]).toMatchObject({ name: 'اكمي', locale: 'ar', id: 1 });
    expect((await service.getAll(true)).map((brand) => brand.id)).toEqual([1]);
  });

  it('returns null for unknown ids and slugs', async () => {
    brandQueries.getById.mockResolvedValue(undefined);
    brandQueries.getBySlug.mockResolvedValue(undefined);
    expect(await service.getById(9)).toBeNull();
    expect(await service.getBySlug('missing' as never)).toBeNull();
  });

  it('maps a found brand by id and slug, using the default locale', async () => {
    brandQueries.getById.mockResolvedValue(row());
    brandQueries.getBySlug.mockResolvedValue(row());
    expect((await service.getById(1))?.name).toBe('Acme');
    expect((await service.getBySlug('acme' as never))?.slug).toBe('acme');
  });

  it('creates, updates and deletes through the repository', async () => {
    brandQueries.create.mockResolvedValue(row());
    brandQueries.update.mockResolvedValue(row({ isActive: false }));
    expect((await service.create({ slug: 'acme' } as never)).id).toBe(1);
    expect((await service.update(1, { isActive: false } as never)).isActive).toBe(false);
    await service.delete(1);
    expect(brandQueries.deleteById).toHaveBeenCalledWith(1);
  });

  it('toggles the active status and rejects unknown brands', async () => {
    brandQueries.getById.mockResolvedValueOnce(row({ isActive: true }));
    brandQueries.update.mockResolvedValueOnce(row({ isActive: false }));
    const toggled = await service.toggleBrandStatus(1);
    expect(brandQueries.update).toHaveBeenCalledWith(1, { isActive: false });
    expect(toggled.isActive).toBe(false);

    brandQueries.getById.mockResolvedValueOnce(undefined);
    await expect(service.toggleBrandStatus(5)).rejects.toThrow('Brand not found');
  });
});
