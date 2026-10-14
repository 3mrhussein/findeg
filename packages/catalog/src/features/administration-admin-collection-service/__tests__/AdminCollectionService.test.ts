import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCollectionsAll,
  getCollectionByIdWithTags,
  createCollection,
  updateCollection,
  deleteCollection,
  setCollectionTags,
  updateCollectionSortOrders,
  checkCollectionSlugAvailable,
} from '@findeg/db/queries';
import { AdminCollectionService } from '../index';

vi.mock('@findeg/db/queries', () => ({
  getCollectionsAll: vi.fn(),
  getCollectionByIdWithTags: vi.fn(),
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  setCollectionTags: vi.fn(),
  updateCollectionSortOrders: vi.fn(),
  checkCollectionSlugAvailable: vi.fn(),
}));

const mockAuditLog = {
  logAction: vi.fn().mockResolvedValue(undefined),
  getLogs: vi.fn().mockResolvedValue([]),
  getEntityLogs: vi.fn().mockResolvedValue([]),
  getRecentActivity: vi.fn().mockResolvedValue([]),
};

const sampleCollection = {
  id: 1,
  slug: 'summer-sale',
  localizedTitle: { en: 'Summer Sale', ar: 'تخفيضات الصيف' },
  localizedSubtitle: { en: 'Hot deals', ar: 'عروض ساخنة' },
  heroImageUrl: null,
  sortOrder: 1,
  isActive: true,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  tags: [],
};

describe('AdminCollectionService', () => {
  let service: AdminCollectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminCollectionService(mockAuditLog);
  });

  it('retrieves all collections', async () => {
    vi.mocked(getCollectionsAll).mockResolvedValue([sampleCollection] as never);

    const result = await service.getAll(true);
    expect(getCollectionsAll).toHaveBeenCalledWith({ includeInactive: true });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('summer-sale');
  });

  it('retrieves collection by id with tags', async () => {
    vi.mocked(getCollectionByIdWithTags).mockResolvedValue(sampleCollection);

    const result = await service.getById(1);
    expect(getCollectionByIdWithTags).toHaveBeenCalledWith(1);
    expect(result).toEqual(sampleCollection);
  });

  it('creates collection and associates tags with audit log', async () => {
    vi.mocked(createCollection).mockResolvedValue(sampleCollection);

    const input = {
      slug: 'summer-sale',
      localizedTitle: { en: 'Summer Sale', ar: 'تخفيضات الصيف' },
      sortOrder: 1,
      isActive: true,
      tagIds: [10, 20],
    };

    const created = await service.create(input, 99);

    expect(createCollection).toHaveBeenCalledWith({
      slug: 'summer-sale',
      localizedTitle: { en: 'Summer Sale', ar: 'تخفيضات الصيف' },
      sortOrder: 1,
      isActive: true,
    });
    expect(setCollectionTags).toHaveBeenCalledWith(1, [10, 20]);
    expect(mockAuditLog.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: 99,
        entityType: 'collection',
        action: 'create',
      }),
    );
    expect(created.id).toBe(1);
  });

  it('updates collection and tag associations', async () => {
    vi.mocked(getCollectionByIdWithTags).mockResolvedValue(sampleCollection);
    vi.mocked(updateCollection).mockResolvedValue({ ...sampleCollection, sortOrder: 5 });

    const updated = await service.update(1, { sortOrder: 5, tagIds: [30] }, 99);

    expect(updateCollection).toHaveBeenCalledWith(1, { sortOrder: 5 });
    expect(setCollectionTags).toHaveBeenCalledWith(1, [30]);
    expect(mockAuditLog.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: 99,
        entityType: 'collection',
        action: 'update',
      }),
    );
    expect(updated.sortOrder).toBe(5);
  });

  it('deletes collection and logs audit entry', async () => {
    vi.mocked(getCollectionByIdWithTags).mockResolvedValue(sampleCollection);

    await service.delete(1, 99);

    expect(deleteCollection).toHaveBeenCalledWith(1);
    expect(mockAuditLog.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: 99,
        entityType: 'collection',
        action: 'delete',
      }),
    );
  });

  it('reorders collections and logs audit entry', async () => {
    const items = [
      { id: 1, sortOrder: 1 },
      { id: 2, sortOrder: 2 },
    ];
    await service.reorder(items, 99);

    expect(updateCollectionSortOrders).toHaveBeenCalledWith(items);
    expect(mockAuditLog.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: 99,
        entityType: 'collection',
        action: 'reorder',
      }),
    );
  });

  it('checks slug availability delegating to query', async () => {
    vi.mocked(checkCollectionSlugAvailable).mockResolvedValue(true);

    const available = await service.checkSlugAvailable('new-slug', 1);

    expect(checkCollectionSlugAvailable).toHaveBeenCalledWith('new-slug', 1);
    expect(available).toBe(true);
  });
});
