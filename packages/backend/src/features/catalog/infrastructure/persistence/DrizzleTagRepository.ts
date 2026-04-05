import { db } from "@/features/core/infrastructure/persistence";
import { tags, productTags, products } from "@/features/core/infrastructure/persistence/schema";
import { ITagRepository } from "../../application/interfaces/ITagRepository";
import { Tag, TagGroup, CreateTag } from "../../domain/entities/Tag";
import { Product } from "../../domain/entities/Product";
import { eq, and, inArray } from "drizzle-orm";
import { ID, Locale } from "@/features/core/domain/types/common";
import { DEFAULT_LOCALE } from "@/features/core/domain/value-objects";

export class DrizzleTagRepository implements ITagRepository {
  async getAll(): Promise<Tag[]> {
    const results = await db.select().from(tags).orderBy(tags.group, tags.key);
    return results as Tag[];
  }

  async getByGroup(group: TagGroup): Promise<Tag[]> {
    const results = await db.select().from(tags).where(eq(tags.group, group)).orderBy(tags.key);
    return results as Tag[];
  }

  async getById(id: ID): Promise<Tag | null> {
    const [row] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return (row as Tag) || null;
  }

  async create(input: CreateTag): Promise<Tag> {
    const [result] = await db.insert(tags).values(input).returning();
    return result as Tag;
  }

  async update(id: ID, input: Partial<CreateTag>): Promise<Tag> {
    const [result] = await db
      .update(tags)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tags.id, id))
      .returning();
    return result as Tag;
  }

  async delete(id: ID): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }

  async getTagsForProduct(productId: ID): Promise<Tag[]> {
    const results = await db
      .select({ tag: tags })
      .from(productTags)
      .innerJoin(tags, eq(productTags.tagId, tags.id))
      .where(eq(productTags.productId, productId));

    return results.map((r) => r.tag as Tag);
  }

  async setProductTags(productId: ID, tagIds: ID[]): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(productTags).where(eq(productTags.productId, productId));
      if (tagIds.length > 0) {
        await tx.insert(productTags).values(
          tagIds.map((tagId) => ({
            productId,
            tagId,
          })),
        );
      }
    });
  }

  async getProductsByTag(tagId: ID, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
    // This is a simplified version; real implementation would likely delegate to ProductRepository
    // or share the join logic.
    const results = await db
      .select({ productId: productTags.productId })
      .from(productTags)
      .where(eq(productTags.tagId, tagId));

    const productIds = results.map((r) => r.productId);
    if (productIds.length === 0) return [];

    // NOTE: In a real app, we'd inject IProductRepository or use a shared query builder
    // For now, this is a placeholder to satisfy the interface if needed,
    // but primary product fetching happens in DrizzleProductRepository.
    return [];
  }

  async listDistinctGroups(): Promise<string[]> {
    const results = await db.selectDistinct({ group: tags.group }).from(tags);
    return results.map((r) => r.group);
  }

  async bulkUpdateStatus(ids: ID[], isActive: boolean): Promise<void> {
    if (ids.length === 0) return;
    await db
      .update(tags)
      .set({ isActive, updatedAt: new Date() })
      .where(inArray(tags.id, ids as number[]));
  }

  async bulkDelete(ids: ID[]): Promise<void> {
    if (ids.length === 0) return;
    await db.delete(tags).where(inArray(tags.id, ids as number[]));
  }
}
