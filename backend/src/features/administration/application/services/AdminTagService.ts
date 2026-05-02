import { ID } from "../../../core/domain/types/common";
import { IAdminTagService } from "../interfaces/IAdminTagService";
import { ITagRepository } from "../../../catalog/application/interfaces/ITagRepository";
import { Tag } from "../../../catalog/domain/entities/Tag";
import { TagInput } from "../../domain/types/TagInput";
import { IAuditLogService } from "../interfaces/IAuditLogService";
import { db } from "@findeg/db/connection";
import { tags, productTags } from "@findeg/db/schema";
import { eq, and, ne, count } from "drizzle-orm";

/**
 * Admin Tag Service
 *
 * Handles management of catalog tags, including grouping and scoping.
 */
export class AdminTagService implements IAdminTagService {
  /**
   *
   */
  constructor(
    private tagRepository: ITagRepository,
    private auditLogService: IAuditLogService,
  ) {}

  /**
   * Retrieves all tags in the system.
   */
  async getAll(): Promise<Tag[]> {
    return this.tagRepository.getAll();
  }

  /**
   * Retrieves all tags grouped by group name.
   */
  async getAllTagsGrouped(): Promise<Record<string, Tag[]>> {
    const allTags = await this.tagRepository.getAll();
    return allTags.reduce(
      (acc, tag) => {
        const group = tag.group;
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(tag);
        return acc;
      },
      {} as Record<string, Tag[]>,
    );
  }

  /**
   * Retrieves a tag by its identifier.
   */
  async getById(id: ID): Promise<Tag | null> {
    return this.tagRepository.getById(id);
  }

  /**
   * Retrieves all unique tag groups.
   */
  async getDistinctGroups(): Promise<string[]> {
    return this.tagRepository.listDistinctGroups();
  }

  /**
   * Creates a new tag and logs the action.
   */
  async create(input: TagInput, adminUserId?: number): Promise<Tag> {
    const tag = await this.tagRepository.create(input);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: "tag",
      entityId: String(tag.id),
      action: "create",
      newValues: tag as unknown as Record<string, unknown>,
    });

    return tag;
  }

  /**
   * Updates an existing tag and logs the changes.
   */
  async update(id: ID, input: Partial<TagInput>, adminUserId?: number): Promise<Tag> {
    const oldTag = await this.tagRepository.getById(id);
    const tag = await this.tagRepository.update(id, input);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: "tag",
      entityId: String(id),
      action: "update",
      oldValues: oldTag as unknown as Record<string, unknown>,
      newValues: tag as unknown as Record<string, unknown>,
    });

    return tag;
  }

  /**
   * Deletes a tag and logs the removal.
   */
  async delete(id: ID, adminUserId?: number): Promise<void> {
    const oldTag = await this.tagRepository.getById(id);
    await this.tagRepository.delete(id);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: "tag",
      entityId: String(id),
      action: "delete",
      oldValues: oldTag as unknown as Record<string, unknown>,
    });
  }

  /**
   * Bulk deletes tags and logs the action.
   */
  async bulkDelete(ids: ID[], adminUserId?: number): Promise<void> {
    await this.tagRepository.bulkDelete(ids);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: "tag",
      entityId: "multiple",
      action: "bulk_delete",
      newValues: { ids },
    });
  }

  /**
   * Bulk updates tag status and logs the action.
   */
  async bulkUpdateStatus(ids: ID[], isActive: boolean, adminUserId?: number): Promise<void> {
    await this.tagRepository.bulkUpdateStatus(ids, isActive);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: "tag",
      entityId: "multiple",
      action: "bulk_status_update",
      newValues: { ids, isActive },
    });
  }

  /**
   * Toggles a tag's active status.
   */
  async toggleTagStatus(id: number, adminUserId?: number): Promise<Tag> {
    const tag = await this.tagRepository.getById(id);
    if (!tag) throw new Error("Tag not found");

    const newStatus = !tag.isActive;
    return this.update(id, { isActive: newStatus }, adminUserId);
  }

  /**
   * Checks if a slug is available.
   */
  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    let query = db.select({ count: count() }).from(tags).where(eq(tags.slug, slug));

    if (excludeId) {
      query = db
        .select({ count: count() })
        .from(tags)
        .where(and(eq(tags.slug, slug), ne(tags.id, excludeId)));
    }

    const result = await query;
    return Number(result[0].count) === 0;
  }

  /**
   * Gets the number of products assigned to a tag.
   */
  async getTagProductCount(id: number): Promise<number> {
    const result = await db
      .select({ value: count() })
      .from(productTags)
      .where(eq(productTags.tagId, id));
    return Number(result[0].value);
  }
}
