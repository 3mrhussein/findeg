import { ID } from '@findeg/backend/features/core/domain/types/common';
import { ITagService } from '../interfaces/ITagService';
import { Tag, TagGroup } from '../../domain/entities/Tag';
import { tagQueries } from '@findeg/db/queries';

export class TagService implements ITagService {
  async getAllTags(): Promise<Tag[]> {
    return tagQueries.getAllTags() as Promise<Tag[]>;
  }

  async getTagsByGroup(group: TagGroup): Promise<Tag[]> {
    return tagQueries.getTagsByGroup(group) as Promise<Tag[]>;
  }

  async getProductTags(productId: ID): Promise<Tag[]> {
    return tagQueries.getTagsForProduct(productId) as Promise<Tag[]>;
  }

  async getGroupedTags(): Promise<Record<TagGroup, Tag[]>> {
    const allTags = await tagQueries.getAllTags();
    const grouped: Record<string, Tag[]> = {};

    for (const tag of allTags) {
      if (!grouped[tag.group]) {
        grouped[tag.group] = [];
      }
      grouped[tag.group].push(tag as unknown as Tag);
    }

    return grouped as Record<TagGroup, Tag[]>;
  }
}
