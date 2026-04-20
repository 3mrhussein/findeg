/**
 * Drizzle Collection Repository
 *
 * PostgreSQL implementation of collection management using Drizzle ORM.
 */

import { db } from "@findeg/db";
import {
  collections,
  collectionTags,
  productTags,
  tags,
} from "@findeg/db/schema";
import { ICollectionRepository } from "../../application/interfaces/ICollectionRepository";
import { Collection, CreateCollection } from "../../domain/entities/Collection";
import { Product } from "../../domain/entities/Product";
import { Tag } from "../../domain/entities/Tag";
import { eq, asc, inArray } from "drizzle-orm";
import { ID, Locale } from "../../../core/domain/types/common";
import { DEFAULT_LOCALE } from "../../../core/domain/value-objects";

export class DrizzleCollectionRepository implements ICollectionRepository {
  async getAll(options?: { includeInactive?: boolean }): Promise<Collection[]> {
    let query = db.select().from(collections);

    if (!options?.includeInactive) {
      // @ts-ignore - Drizzle query builder typing
      query = query.where(eq(collections.isActive, true));
    }

    const results = await query.orderBy(asc(collections.sortOrder));
    return results as Collection[];
  }

  async getBySlug(slug: string): Promise<Collection | null> {
    const results = await db.select().from(collections).where(eq(collections.slug, slug)).limit(1);

    const collection = results[0] as Collection | undefined;
    if (!collection) return null;

    // Fetch associated tags
    const tagResults = await db
      .select({ tag: tags })
      .from(collectionTags)
      .innerJoin(tags, eq(collectionTags.tagId, tags.id))
      .where(eq(collectionTags.collectionId, collection.id));

    return {
      ...collection,
      tags: tagResults.map((r) => r.tag as Tag),
    };
  }

  async getById(id: ID): Promise<Collection | null> {
    const results = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    return (results[0] as Collection) || null;
  }

  async create(input: CreateCollection): Promise<Collection> {
    const [result] = await db.insert(collections).values(input).returning();
    return result as Collection;
  }

  async update(id: ID, input: Partial<CreateCollection>): Promise<Collection> {
    const [result] = await db
      .update(collections)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(collections.id, id))
      .returning();
    return result as Collection;
  }

  async delete(id: ID): Promise<void> {
    await db.delete(collections).where(eq(collections.id, id));
  }

  /**
   * Retrieves products belonging to a collection.
   * Scoped by tag membership (Rule A).
   */
  async getProductsByCollection(
    collectionId: ID,
    language: Locale = DEFAULT_LOCALE,
  ): Promise<Product[]> {
    // 1. Get the tag IDs associated with this collection
    const collectionTagResults = await db
      .select({ tagId: collectionTags.tagId })
      .from(collectionTags)
      .where(eq(collectionTags.collectionId, collectionId));

    const tagIds = collectionTagResults.map((r) => r.tagId);
    if (tagIds.length === 0) return [];

    // 2. Fetch products that have any of these tags
    // NOTE: This usually delegates to a complex multi-join product fetcher.
    // For now, we'll return an empty array and expect the application layer
    // to use ProductRepository.getFiltered(ids: ...) once implemented.
    return [];
  }

  async setCollectionTags(collectionId: ID, tagIds: ID[]): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(collectionTags).where(eq(collectionTags.collectionId, collectionId));
      if (tagIds.length > 0) {
        await tx.insert(collectionTags).values(
          tagIds.map((tagId) => ({
            collectionId,
            tagId,
          })),
        );
      }
    });
  }

  async getByIdWithTags(id: ID): Promise<(Collection & { tags: Tag[] }) | null> {
    const results = await db.select().from(collections).where(eq(collections.id, id)).limit(1);

    const collection = results[0] as Collection | undefined;
    if (!collection) return null;

    // Fetch associated tags
    const tagResults = await db
      .select({ tag: tags })
      .from(collectionTags)
      .innerJoin(tags, eq(collectionTags.tagId, tags.id))
      .where(eq(collectionTags.collectionId, collection.id));

    return {
      ...collection,
      tags: tagResults.map((r) => r.tag as Tag),
    };
  }

  async updateSortOrders(items: { id: ID; sortOrder: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(collections)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(collections.id, item.id));
      }
    });
  }
}
