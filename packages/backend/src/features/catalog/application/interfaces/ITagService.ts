/**
 * Tag Service Interface
 */

import { ID, Locale } from "@backend/features/core/domain/types/common";
import { Tag, TagGroup } from "../../domain/entities/Tag";

export interface ITagService {
  /** Retrieves all tags */
  getAllTags(): Promise<Tag[]>;

  /** Retrieves tags for a specific group (e.g., 'usecase') */
  getTagsByGroup(group: TagGroup): Promise<Tag[]>;

  /** Retrieves tags associated with a specific product */
  getProductTags(productId: ID): Promise<Tag[]>;

  /** Groups tags by their group name */
  getGroupedTags(): Promise<Record<TagGroup, Tag[]>>;
}
