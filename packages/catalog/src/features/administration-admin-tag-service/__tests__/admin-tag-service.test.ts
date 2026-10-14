import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminTagService } from '../index';

const queries = vi.hoisted(() => ({
  checkTagSlugAvailableRaw: vi.fn(),
  getTagProductCountRaw: vi.fn(),
  getAllTags: vi.fn(),
  getTagById: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  bulkDeleteTags: vi.fn(),
  bulkUpdateTagStatus: vi.fn(),
  listDistinctTagGroups: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

describe('AdminTagService', () => {
  let audit: { logAction: ReturnType<typeof vi.fn> };
  let service: AdminTagService;

  beforeEach(() => {
    vi.clearAllMocks();
    audit = { logAction: vi.fn().mockResolvedValue(undefined) };
    service = new AdminTagService(audit as never);
  });

  it('reads tags, groups them and lists the distinct groups', async () => {
    queries.getAllTags.mockResolvedValue([
      { id: 1, group: 'audience' },
      { id: 2, group: 'style' },
      { id: 3, group: 'audience' },
    ]);
    queries.listDistinctTagGroups.mockResolvedValue(['audience', 'style']);
    expect(await service.getAll()).toHaveLength(3);
    const grouped = await service.getAllTagsGrouped();
    expect(grouped.audience.map((t) => t.id)).toEqual([1, 3]);
    expect(await service.getDistinctGroups()).toEqual(['audience', 'style']);
  });

  it('creates a tag and audits the new values', async () => {
    queries.createTag.mockResolvedValue({ id: 4, group: 'style' });
    const tag = await service.create({ group: 'style' } as never, 9);
    expect(tag.id).toBe(4);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: 9, action: 'create', entityId: '4' }),
    );
  });

  it('updates a tag, auditing old and new values', async () => {
    queries.getTagById.mockResolvedValue({ id: 4, isActive: true });
    queries.updateTag.mockResolvedValue({ id: 4, isActive: false });
    const tag = await service.update(4, { isActive: false });
    expect(tag.isActive).toBe(false);
    expect(audit.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update', oldValues: { id: 4, isActive: true } }),
    );
  });

  it('deletes a tag and audits the removed values', async () => {
    queries.getTagById.mockResolvedValue({ id: 4 });
    await service.delete(4);
    expect(queries.deleteTag).toHaveBeenCalledWith(4);
    expect(audit.logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'delete' }));
  });

  it('bulk deletes and bulk updates status with audit entries', async () => {
    await service.bulkDelete([1, 2], 3);
    expect(queries.bulkDeleteTags).toHaveBeenCalledWith([1, 2]);
    expect(audit.logAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: 'bulk_delete', entityId: 'multiple' }),
    );
    await service.bulkUpdateStatus([1], false);
    expect(queries.bulkUpdateTagStatus).toHaveBeenCalledWith([1], false);
    expect(audit.logAction).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: 'bulk_status_update',
        newValues: { ids: [1], isActive: false },
      }),
    );
  });

  it('toggles the status of an existing tag and rejects unknown ones', async () => {
    queries.getTagById.mockResolvedValueOnce({ id: 4, isActive: true });
    queries.getTagById.mockResolvedValueOnce({ id: 4, isActive: true });
    queries.updateTag.mockResolvedValue({ id: 4, isActive: false });
    const toggled = await service.toggleTagStatus(4, 2);
    expect(queries.updateTag).toHaveBeenCalledWith(4, { isActive: false });
    expect(toggled.isActive).toBe(false);

    queries.getTagById.mockResolvedValueOnce(null);
    await expect(service.toggleTagStatus(5)).rejects.toThrow('Tag not found');
  });

  it('reads one tag, checks slug availability and counts products', async () => {
    queries.getTagById.mockResolvedValue({ id: 1 });
    queries.checkTagSlugAvailableRaw.mockResolvedValue(true);
    queries.getTagProductCountRaw.mockResolvedValue(6);
    expect((await service.getById(1))?.id).toBe(1);
    expect(await service.checkSlugAvailable('kids', 1)).toBe(true);
    expect(await service.getTagProductCount(1)).toBe(6);
  });
});
