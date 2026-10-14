/**
 * Tag Service Interface
 */

import { ID } from '@findeg/db/types';
import { Tag, TagGroup } from '../catalog-tag/index';

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
