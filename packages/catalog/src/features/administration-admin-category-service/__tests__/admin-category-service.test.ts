import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCategoryService } from '../index';

const queries = vi.hoisted(() => ({
  getCategoryById: vi.fn(),
  getAllCategories: vi.fn(),
  getCategoryBySlug: vi.fn(),
  getCategoryChildren: vi.fn(),
  getCategoryProductCount: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  reorderCategories: vi.fn(),
  countCategories: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

const input = {
  slug: 'pens',
  translations: [
    { language: 'en', name: 'Pens', description: 'All pens' },
    { language: 'ar', name: 'أقلام' },
  ],
  parentId: undefined,
  icon: undefined,
  sortOrder: 2,
  isActive: undefined,
} as never;

const row = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  slug: `cat-${id}`,
  parentId: null,
  sortOrder: id,
  ...overrides,
});

describe('AdminCategoryService', () => {
  let audit: { logAction: ReturnType<typeof vi.fn> };
  let service: AdminCategoryService;

  beforeEach(() => {
    vi.clearAllMocks();
    audit = { logAction: vi.fn().mockResolvedValue(undefined) };
    service = new AdminCategoryService(audit as never);
  });

  it('creates a category with localized names, descriptions only where given, and audits it', async () => {
    queries.createCategory.mockResolvedValue({ id: 5, slug: 'pens' });
    const created = await service.create(input);
    expect(created.id).toBe(5);
    expect(queries.createCategory).toHaveBeenCalledWith({
      slug: 'pens',
      localizedName: { en: 'Pens', ar: 'أقلام' },
      localizedDescription: { en: 'All pens' },
      parentId: null,
      icon: null,
      sortOrder: 2,
      isActive: true,
    });
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: 'category', action: 'create', entityId: '5' }),
    );
  });

  it('creates without an audit trail when none is configured', async () => {
    queries.createCategory.mockResolvedValue({ id: 6 });
    const bare = new AdminCategoryService();
    await bare.create({ slug: 's', translations: [] } as never);
    expect(queries.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({ localizedName: {}, localizedDescription: {} }),
    );
    expect(audit.logAction).not.toHaveBeenCalled();
  });

  it('updates an existing category and audits the old and new values', async () => {
    queries.getCategoryById.mockResolvedValue(row(3));
    queries.updateCategory.mockResolvedValue(row(3, { slug: 'pens' }));
    const updated = await service.update(3, input);
    expect(updated.slug).toBe('pens');
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update', oldValues: row(3), entityId: '3' }),
    );
  });

  it('rejects updates to unknown categories', async () => {
    queries.getCategoryById.mockResolvedValue(undefined);
    await expect(service.update(9, input)).rejects.toThrow('Category with ID 9 not found');
    expect(queries.updateCategory).not.toHaveBeenCalled();
  });

  it('deletes an existing category and audits it; rejects unknown ones', async () => {
    queries.getCategoryById.mockResolvedValueOnce(row(4));
    await service.delete(4);
    expect(queries.deleteCategory).toHaveBeenCalledWith(4);
    expect(audit.logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'delete' }));

    queries.getCategoryById.mockResolvedValueOnce(undefined);
    await expect(service.delete(8)).rejects.toThrow('Category with ID 8 not found');
  });

  it('reads one category, all categories and the count', async () => {
    queries.getCategoryById.mockResolvedValue(row(1));
    queries.getAllCategories.mockResolvedValue([row(1)]);
    queries.countCategories.mockResolvedValue(1);
    expect((await service.getById(1))?.id).toBe(1);
    expect(await service.getAll()).toHaveLength(1);
    expect(await service.count()).toBe(1);
  });

  it('builds a tree with rolled-up product counts and sorted siblings', async () => {
    queries.getAllCategories.mockResolvedValue([
      row(1, { sortOrder: 2 }),
      row(2, { parentId: 1, sortOrder: 1 }),
      row(3, { parentId: undefined, sortOrder: 1 }),
    ]);
    queries.getCategoryProductCount.mockImplementation(
      async (id: number) => ({ 1: 1, 2: 4, 3: 2 })[id],
    );
    const tree = await service.getTree();
    expect(tree.map((c) => c.id)).toEqual([3, 1]);
    expect((tree[1] as unknown as { productCount: number }).productCount).toBe(5);
    expect((tree[1] as unknown as { children: { id: number }[] }).children[0].id).toBe(2);
    expect((tree[0] as unknown as { children?: unknown }).children).toBeUndefined();
  });

  it('checks slug availability, allowing the category being edited', async () => {
    queries.getCategoryBySlug.mockResolvedValueOnce(undefined);
    expect(await service.checkSlugAvailable('new')).toBe(true);
    queries.getCategoryBySlug.mockResolvedValueOnce({ id: 7 });
    expect(await service.checkSlugAvailable('taken')).toBe(false);
    queries.getCategoryBySlug.mockResolvedValueOnce({ id: 7 });
    expect(await service.checkSlugAvailable('taken', 7)).toBe(true);
  });

  it('moves a category up or down among its siblings', async () => {
    queries.getCategoryById.mockResolvedValue(row(2, { parentId: 1, sortOrder: 5 }));
    queries.getCategoryChildren.mockResolvedValue([
      row(1, { sortOrder: 1 }),
      row(2, { sortOrder: 5 }),
      row(3, { sortOrder: 9 }),
    ]);
    await service.moveCategoryUp(2);
    expect(queries.reorderCategories).toHaveBeenLastCalledWith([
      { id: 2, sortOrder: 1 },
      { id: 1, sortOrder: 5 },
    ]);
    await service.moveCategoryDown(2);
    expect(queries.reorderCategories).toHaveBeenLastCalledWith([
      { id: 2, sortOrder: 9 },
      { id: 3, sortOrder: 5 },
    ]);
  });

  it('does nothing when a move would leave the sibling list', async () => {
    queries.getCategoryById.mockResolvedValue(row(1, { parentId: null, sortOrder: 1 }));
    queries.getCategoryChildren.mockResolvedValue([
      row(1, { sortOrder: 1 }),
      row(2, { sortOrder: 2 }),
    ]);
    await service.moveCategoryUp(1);
    queries.getCategoryById.mockResolvedValue(row(2, { parentId: null, sortOrder: 2 }));
    await service.moveCategoryDown(2);
    expect(queries.reorderCategories).not.toHaveBeenCalled();
  });

  it('rejects moves for unknown categories', async () => {
    queries.getCategoryById.mockResolvedValue(undefined);
    await expect(service.moveCategoryUp(1)).rejects.toThrow('Category not found');
    await expect(service.moveCategoryDown(1)).rejects.toThrow('Category not found');
  });

  it('reorders directly and reports product counts', async () => {
    queries.getCategoryProductCount.mockResolvedValue(3);
    await service.reorderCategories([{ id: 1, sortOrder: 0 }]);
    expect(queries.reorderCategories).toHaveBeenCalledWith([{ id: 1, sortOrder: 0 }]);
    expect(await service.getCategoryProductCount(1)).toBe(3);
  });
});

describe('AdminCategoryService edge branches', () => {
  beforeEach(() => vi.clearAllMocks());

  it('writes empty translation maps and nulls for a minimal category', async () => {
    queries.createCategory.mockResolvedValue({ id: 8 });
    queries.getCategoryById.mockResolvedValue({ id: 8 });
    queries.updateCategory.mockResolvedValue({ id: 8 });
    const service = new AdminCategoryService();
    await service.create({
      slug: 'bare',
      translations: [{ language: 'en', name: 'Bare' }],
    } as never);
    expect(queries.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        localizedDescription: {},
        parentId: null,
        icon: null,
        isActive: true,
      }),
    );
    await service.update(8, { slug: 'bare' } as never);
    expect(queries.updateCategory).toHaveBeenCalledWith(
      8,
      expect.objectContaining({ localizedName: {} }),
    );
  });

  it('builds the tree when categories lack a parent field and counts an unknown category as zero', async () => {
    queries.getAllCategories.mockResolvedValue([
      { id: 1, sortOrder: null },
      { id: 2, parentId: 1, sortOrder: 0 },
    ]);
    queries.getCategoryProductCount.mockResolvedValue(0);
    const tree = await new AdminCategoryService().getTree();
    expect(tree.map((c) => c.id)).toEqual([1]);
    expect((tree[0] as unknown as { productCount: number }).productCount).toBe(0);
  });

  it('treats a missing sibling sort order as zero when moving', async () => {
    queries.getCategoryById.mockResolvedValue({ id: 2, parentId: null });
    queries.getCategoryChildren.mockResolvedValue([
      { id: 1, sortOrder: null },
      { id: 2, sortOrder: null },
    ]);
    await new AdminCategoryService().moveCategoryUp(2);
    expect(queries.reorderCategories).toHaveBeenCalledWith([
      { id: 2, sortOrder: 0 },
      { id: 1, sortOrder: 0 },
    ]);
  });
});
