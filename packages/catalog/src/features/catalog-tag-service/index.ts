import { ID } from '@findeg/db/types';
import { ITagService } from '../catalog-i-tag-service/types';
import { Tag, TagGroup } from '../catalog-tag/index';
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
      const entries = Object.prototype.hasOwnProperty.call(grouped, tag.group)
        ? grouped[tag.group]
        : [];
      entries.push(tag as unknown as Tag);
      grouped[tag.group] = entries;
    }

    return grouped;
  }
}
