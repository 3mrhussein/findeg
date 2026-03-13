import { ID } from "@/features/core/domain/types/common";
import { Tag } from "@/features/catalog/domain/entities/Tag";
import { TagInput } from "../../domain/types/TagInput";

export interface IAdminTagService {
  /** Retrieves all tags */
  getAll(): Promise<Tag[]>;

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
}
