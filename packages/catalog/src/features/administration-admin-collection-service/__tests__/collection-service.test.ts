import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCollectionService } from '../index';

const queries = vi.hoisted(() => ({
  getCollectionsAll: vi.fn(),
  getCollectionByIdWithTags: vi.fn(),
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  setCollectionTags: vi.fn(),
  updateCollectionSortOrders: vi.fn(),
  checkCollectionSlugAvailable: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

describe('AdminCollectionService', () => {
  let audit: { logAction: ReturnType<typeof vi.fn> };
  let service: AdminCollectionService;
  beforeEach(() => {
    vi.clearAllMocks();
    audit = { logAction: vi.fn().mockResolvedValue(undefined) };
    service = new AdminCollectionService(audit as never);
  });

  it('lists collections with or without inactive ones', async () => {
    queries.getCollectionsAll.mockResolvedValue([{ id: 1 }]);
    expect(await service.getAll()).toEqual([{ id: 1 }]);
    expect(queries.getCollectionsAll).toHaveBeenLastCalledWith({ includeInactive: false });
    await service.getAll(true);
    expect(queries.getCollectionsAll).toHaveBeenLastCalledWith({ includeInactive: true });
  });

  it('reads a collection with its tags', async () => {
    queries.getCollectionByIdWithTags.mockResolvedValue({ id: 1, tags: [] });
    expect(await service.getById(1)).toEqual({ id: 1, tags: [] });
    queries.getCollectionByIdWithTags.mockResolvedValue(null);
    expect(await service.getById(2)).toBeNull();
  });

  it('creates a collection, sets its tags when given, and audits it', async () => {
    queries.createCollection.mockResolvedValue({ id: 3, slug: 'summer' });
    const created = await service.create({ slug: 'summer', tagIds: [1, 2] } as never, 4);
    expect(created.id).toBe(3);
    expect(queries.createCollection).toHaveBeenCalledWith({ slug: 'summer' });
    expect(queries.setCollectionTags).toHaveBeenCalledWith(3, [1, 2]);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'create', entityId: '3', adminUserId: 4 }),
    );
  });

  it('skips tag assignment on create when no tags are given', async () => {
    queries.createCollection.mockResolvedValue({ id: 5 });
    await service.create({ slug: 'x', tagIds: [] } as never);
    expect(queries.setCollectionTags).not.toHaveBeenCalled();
  });

  it('updates a collection, replacing tags only when they are supplied', async () => {
    queries.getCollectionByIdWithTags.mockResolvedValue({ id: 1, tags: [] });
    queries.updateCollection.mockResolvedValue({ id: 1, slug: 'new' });
    await service.update(1, { slug: 'new' });
    expect(queries.setCollectionTags).not.toHaveBeenCalled();
    await service.update(1, { tagIds: [7] }, 2);
    expect(queries.setCollectionTags).toHaveBeenCalledWith(1, [7]);
    expect(audit.logAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: 'update', oldValues: { id: 1, tags: [] } }),
    );
  });

  it('deletes a collection and audits the removed one', async () => {
    queries.getCollectionByIdWithTags.mockResolvedValue({ id: 1 });
    await service.delete(1, 2);
    expect(queries.deleteCollection).toHaveBeenCalledWith(1);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'delete', oldValues: { id: 1 } }),
    );
  });

  it('reorders collections and audits the change', async () => {
    const items = [{ id: 1, sortOrder: 0 }];
    await service.reorder(items, 2);
    expect(queries.updateCollectionSortOrders).toHaveBeenCalledWith(items);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'reorder', entityId: 'bulk' }),
    );
  });

  it('checks slug availability for collections', async () => {
    queries.checkCollectionSlugAvailable.mockResolvedValue(true);
    expect(await service.checkSlugAvailable('summer', 1)).toBe(true);
    expect(queries.checkCollectionSlugAvailable).toHaveBeenCalledWith('summer', 1);
  });
});
