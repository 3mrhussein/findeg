import { ID } from "@backend/features/core/domain/types/common";
import { ITagRepository } from "../interfaces/ITagRepository";
import { ITagService } from "../interfaces/ITagService";
import { Tag, TagGroup } from "../../domain/entities/Tag";

export class TagService implements ITagService {
  constructor(private tagRepository: ITagRepository) {}

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.getAll();
  }

  async getTagsByGroup(group: TagGroup): Promise<Tag[]> {
    return this.tagRepository.getByGroup(group);
  }

  async getProductTags(productId: ID): Promise<Tag[]> {
    return this.tagRepository.getTagsForProduct(productId);
  }

  async getGroupedTags(): Promise<Record<TagGroup, Tag[]>> {
    const allTags = await this.tagRepository.getAll();
    const grouped: Record<string, Tag[]> = {};

    for (const tag of allTags) {
      if (!grouped[tag.group]) {
        grouped[tag.group] = [];
      }
      grouped[tag.group].push(tag);
    }

    return grouped as Record<TagGroup, Tag[]>;
  }
}
