import { ID } from '@findeg/db/types';
import { IAdminTagService } from '../administration-i-admin-tag-service/types';
import { Tag } from '../catalog-tag/index';
import { TagInput } from '../catalog-tag-input/index';
import { IAuditLogService } from '../administration-i-audit-log-service/types';
import {
  checkTagSlugAvailableRaw,
  getTagProductCountRaw,
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  bulkDeleteTags,
  bulkUpdateTagStatus,
  listDistinctTagGroups,
} from '@findeg/db/queries';

/**
 * Admin Tag Service
 *
 * Handles management of catalog tags using query primitives.
 * No repository dependency - uses direct database queries.
 */
export class AdminTagService implements IAdminTagService {
  constructor(private auditLogService: IAuditLogService) {}

  /**
   * Retrieves all tags in the system.
   */
  async getAll(): Promise<Tag[]> {
    return getAllTags() as Promise<Tag[]>;
  }

  /**
   * Retrieves all tags grouped by group name.
   */
  async getAllTagsGrouped(): Promise<Record<string, Tag[]>> {
    const allTags = await getAllTags();
    return allTags.reduce<Record<string, Tag[]>>((acc, tag) => {
      const group = tag.group;
      const entries = Object.prototype.hasOwnProperty.call(acc, group) ? acc[group] : [];
      entries.push(tag as Tag);
      acc[group] = entries;
      return acc;
    }, {});
  }

  /**
   * Retrieves a tag by its identifier.
   */
  async getById(id: ID): Promise<Tag | null> {
    const result = await getTagById(id);
    return result as Tag | null;
  }

  /**
   * Retrieves all unique tag groups.
   */
  async getDistinctGroups(): Promise<string[]> {
    return listDistinctTagGroups();
  }

  /**
   * Creates a new tag and logs the action.
   */
  async create(input: TagInput, adminUserId?: number): Promise<Tag> {
    const tag = await createTag(input);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'tag',
      entityId: String(tag.id),
      action: 'create',
      newValues: tag,
    });

    return tag as Tag;
  }

  /**
   * Updates an existing tag and logs the changes.
   */
  async update(id: ID, input: Partial<TagInput>, adminUserId?: number): Promise<Tag> {
    const oldTag = await getTagById(id);
    const tag = await updateTag(id, input);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'tag',
      entityId: String(id),
      action: 'update',
      oldValues: oldTag,
      newValues: tag,
    });

    return tag as Tag;
  }

  /**
   * Deletes a tag and logs the removal.
   */
  async delete(id: ID, adminUserId?: number): Promise<void> {
    const oldTag = await getTagById(id);
    await deleteTag(id);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'tag',
      entityId: String(id),
      action: 'delete',
      oldValues: oldTag,
    });
  }

  /**
   * Bulk deletes tags and logs the action.
   */
  async bulkDelete(ids: ID[], adminUserId?: number): Promise<void> {
    await bulkDeleteTags(ids);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'tag',
      entityId: 'multiple',
      action: 'bulk_delete',
      newValues: { ids },
    });
  }

  /**
   * Bulk updates tag status and logs the action.
   */
  async bulkUpdateStatus(ids: ID[], isActive: boolean, adminUserId?: number): Promise<void> {
    await bulkUpdateTagStatus(ids, isActive);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'tag',
      entityId: 'multiple',
      action: 'bulk_status_update',
      newValues: { ids, isActive },
    });
  }

  /**
   * Toggles a tag's active status.
   */
  async toggleTagStatus(id: number, adminUserId?: number): Promise<Tag> {
    const tag = await getTagById(id);
    if (!tag) throw new Error('Tag not found');

    const newStatus = !tag.isActive;
    return this.update(id, { isActive: newStatus }, adminUserId);
  }

  /**
   * Checks if a slug is available.
   */
  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    return checkTagSlugAvailableRaw(slug, excludeId);
  }

  /**
   * Gets the number of products assigned to a tag.
   */
  async getTagProductCount(id: number): Promise<number> {
    return getTagProductCountRaw(id);
  }
}
