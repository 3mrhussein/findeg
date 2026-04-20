/**
 * Tag Repository Interface
 */

import { ID, Locale } from "@findeg/backend/features/core/domain/types/common";
import { Tag, TagGroup, CreateTag } from "../../domain/entities/Tag";
import { Product } from "../../domain/entities/Product";

export interface ITagRepository {
  /** Retrieves all tags in the system */
  getAll(): Promise<Tag[]>;

  /** Retrieves tags belonging to a specific group */
  getByGroup(group: TagGroup): Promise<Tag[]>;

  /** Retrieves a single tag by its ID */
  getById(id: ID): Promise<Tag | null>;

  /** Creates a new tag definition */
  create(input: CreateTag): Promise<Tag>;

  /** Updates an existing tag */
  update(id: ID, input: Partial<CreateTag>): Promise<Tag>;

  /** Deletes a tag */
  delete(id: ID): Promise<void>;

  /** Retrieves all tags associated with a specific product */
  getTagsForProduct(productId: ID): Promise<Tag[]>;

  /** Bulk assigns tags to a product (replaces existing associations) */
  setProductTags(productId: ID, tagIds: ID[]): Promise<void>;

  /** Retrieves products matching a specific tag */
  getProductsByTag(tagId: ID, language?: Locale): Promise<Product[]>;

  /** Retrieves a unique list of all tag groups currently in use */
  listDistinctGroups(): Promise<string[]>;

  /** Bulk updates the status of multiple tags */
  bulkUpdateStatus(ids: ID[], isActive: boolean): Promise<void>;

  /** Bulk deletes multiple tags */
  bulkDelete(ids: ID[]): Promise<void>;
}
