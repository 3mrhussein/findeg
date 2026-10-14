import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TagService } from '../index';

const { tagQueries } = vi.hoisted(() => ({
  tagQueries: { getAllTags: vi.fn(), getTagsByGroup: vi.fn(), getTagsForProduct: vi.fn() },
}));
vi.mock('@findeg/db/queries', () => ({ tagQueries }));

describe('TagService', () => {
  let service: TagService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new TagService();
  });

  it('reads all tags, tags by group and tags for a product', async () => {
    tagQueries.getAllTags.mockResolvedValue([{ id: 1, group: 'audience' }]);
    tagQueries.getTagsByGroup.mockResolvedValue([{ id: 2 }]);
    tagQueries.getTagsForProduct.mockResolvedValue([{ id: 3 }]);
    expect(await service.getAllTags()).toEqual([{ id: 1, group: 'audience' }]);
    expect(await service.getTagsByGroup('audience')).toEqual([{ id: 2 }]);
    expect(await service.getProductTags(9)).toEqual([{ id: 3 }]);
    expect(tagQueries.getTagsForProduct).toHaveBeenCalledWith(9);
  });

  it('groups tags by their group name', async () => {
    tagQueries.getAllTags.mockResolvedValue([
      { id: 1, group: 'audience' },
      { id: 2, group: 'style' },
      { id: 3, group: 'audience' },
    ]);
    const grouped = await service.getGroupedTags();
    expect(grouped.audience.map((tag) => tag.id)).toEqual([1, 3]);
    expect(grouped.style.map((tag) => tag.id)).toEqual([2]);
  });
});
