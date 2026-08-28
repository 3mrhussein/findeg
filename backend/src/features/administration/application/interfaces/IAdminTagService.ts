import { ID } from '@findeg/backend/features/core/domain/types/common';
import { Tag } from '@findeg/backend/features/catalog/domain/entities/Tag';
import { TagInput } from '@findeg/backend/features/catalog/application/dtos/TagInput';

export interface IAdminTagService {
  /** Retrieves all tags */
  getAll(): Promise<Tag[]>;

  /** Retrieves all tags grouped by group name */
  getAllTagsGrouped(): Promise<Record<string, Tag[]>>;

  /** Retrieves a single tag by its ID */
  getById(id: ID): Promise<Tag | null>;

  /** Retrieves a unique list of all tag groups currently in use */
  getDistinctGroups(): Promise<string[]>;

  /** Creates a new tag */
  create(input: TagInput, adminUserId?: number): Promise<Tag>;

  /** Updates an existing tag */
  update(id: ID, input: Partial<TagInput>, adminUserId?: number): Promise<Tag>;

  /** Deletes a tag */
  delete(id: ID, adminUserId?: number): Promise<void>;

  /** Bulk deletes tags */
  bulkDelete(ids: ID[], adminUserId?: number): Promise<void>;

  /** Bulk updates tag status */
  bulkUpdateStatus(ids: ID[], isActive: boolean, adminUserId?: number): Promise<void>;

  /** Toggles a tag's active status */
  toggleTagStatus(id: number, adminUserId?: number): Promise<Tag>;

  /** Checks if a slug is available */
  checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean>;

  /** Gets the number of products assigned to a tag */
  getTagProductCount(id: number): Promise<number>;
}
