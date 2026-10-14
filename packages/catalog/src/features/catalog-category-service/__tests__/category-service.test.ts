import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryService } from '../index';

const { categoryQueries } = vi.hoisted(() => ({
  categoryQueries: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
    getProductCounts: vi.fn(),
    getRoots: vi.fn(),
    getChildren: vi.fn(),
    getDescendants: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteById: vi.fn(),
    reorder: vi.fn(),
    getCount: vi.fn(),
    getProductCount: vi.fn(),
  },
}));
vi.mock('@findeg/db/queries', () => ({ categoryQueries }));

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  slug: 'pens',
  localizedName: { en: 'Pens', ar: 'أقلام' },
  localizedDescription: { en: 'All pens', ar: '' },
  icon: null,
  parentId: null,
  path: '/pens',
  depth: 0,
  sortOrder: 0,
  isActive: true,
  ...overrides,
});

describe('CategoryService', () => {
  let service: CategoryService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new CategoryService();
  });

  it('localizes a category and falls back to the English name', async () => {
    categoryQueries.getById.mockResolvedValue(row());
    const ar = await service.getById(1, 'ar');
    expect(ar?.name).toBe('أقلام');
    expect(ar?.description).toBe('All pens');

    categoryQueries.getById.mockResolvedValue(row({ localizedName: { en: 'Pens' } }));
    expect((await service.getById(1, 'ar'))?.name).toBe('Pens');
  });

  it('parses JSON-encoded translations and tolerates malformed ones', async () => {
    categoryQueries.getById.mockResolvedValue(
      row({ localizedName: '{"en":"Pens"}', localizedDescription: '{not json' }),
    );
    const found = await service.getById(1);
    expect(found?.name).toBe('Pens');
    expect(found?.description).toBeUndefined();
  });

  it('uses the slug when no name is translated at all', async () => {
    categoryQueries.getById.mockResolvedValue(
      row({ localizedName: null, localizedDescription: null }),
    );
    const found = await service.getById(1);
    expect(found?.name).toBe('pens');
    expect(found?.localizedContent?.description).toBeUndefined();
  });

  it('returns null for unknown categories and empty lists without counting', async () => {
    categoryQueries.getById.mockResolvedValue(undefined);
    categoryQueries.getBySlug.mockResolvedValue(undefined);
    expect(await service.getById(9)).toBeNull();
    expect(await service.getBySlug('none')).toBeNull();
    categoryQueries.getAll.mockResolvedValue([]);
    expect(await service.getAll()).toEqual([]);
    expect(categoryQueries.getProductCounts).not.toHaveBeenCalled();
  });

  it('attaches direct product counts to every category in getAll', async () => {
    categoryQueries.getAll.mockResolvedValue([row(), row({ id: 2, slug: 'pads' })]);
    categoryQueries.getProductCounts.mockResolvedValue(new Map([[1, 4]]));
    const all = await service.getAll();
    expect(all.map((category) => category.productCount)).toEqual([4, 0]);
  });

  it('builds a tree with descendant product counts rolled up', async () => {
    categoryQueries.getAll.mockResolvedValue([
      row({ id: 1, parentId: null, sortOrder: 1 }),
      row({ id: 2, slug: 'gel', parentId: 1, sortOrder: 0 }),
    ]);
    categoryQueries.getProductCounts.mockResolvedValue(
      new Map([
        [1, 1],
        [2, 3],
      ]),
    );
    const tree = await service.getTree();
    expect(tree).toHaveLength(1);
    expect(tree[0].productCount).toBe(4);
    expect(tree[0].children?.[0].productCount).toBe(3);
  });

  it('lists roots, children and descendants', async () => {
    categoryQueries.getRoots.mockResolvedValue([row()]);
    categoryQueries.getChildren.mockResolvedValue([row({ id: 2 })]);
    categoryQueries.getDescendants.mockResolvedValue([row({ id: 3 })]);
    expect((await service.getRoots()).map((c) => c.id)).toEqual([1]);
    expect((await service.getChildren(1)).map((c) => c.id)).toEqual([2]);
    expect((await service.getDescendants(1)).map((c) => c.id)).toEqual([3]);
  });

  it('writes, reorders, counts and deletes', async () => {
    categoryQueries.create.mockResolvedValue(row());
    categoryQueries.update.mockResolvedValue(row({ slug: 'pens-2' }));
    categoryQueries.getCount.mockResolvedValue(7);
    categoryQueries.getProductCount.mockResolvedValue(2);
    expect((await service.create({} as never)).slug).toBe('pens');
    expect((await service.update(1, {} as never)).slug).toBe('pens-2');
    await service.reorder([{ id: 1, sortOrder: 2 }]);
    expect(categoryQueries.reorder).toHaveBeenCalledWith([{ id: 1, sortOrder: 2 }]);
    expect(await service.count()).toBe(7);
    expect(await service.getProductCount(1)).toBe(2);
    await service.delete(1);
    expect(categoryQueries.deleteById).toHaveBeenCalledWith(1);
  });
});
