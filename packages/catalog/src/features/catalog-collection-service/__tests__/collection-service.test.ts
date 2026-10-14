import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionService } from '../index';

const { collectionQueries } = vi.hoisted(() => ({
  collectionQueries: { getAllCollections: vi.fn(), getCollectionBySlugWithTags: vi.fn() },
}));
vi.mock('@findeg/db/queries', () => ({ collectionQueries }));

describe('CollectionService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists collections and looks one up by slug with its tags', async () => {
    collectionQueries.getAllCollections.mockResolvedValue([{ id: 1 }]);
    collectionQueries.getCollectionBySlugWithTags.mockResolvedValue(null);
    const service = new CollectionService();
    expect(await service.getAllCollections()).toEqual([{ id: 1 }]);
    expect(await service.getCollectionBySlug('summer')).toBeNull();
    expect(collectionQueries.getCollectionBySlugWithTags).toHaveBeenCalledWith('summer');
  });
});
