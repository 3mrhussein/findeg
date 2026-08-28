/**
 * Collection Query Primitives
 *
 * Low-level database access for collection operations.
 * Used by CollectionService and other services that need collection data.
 */

import { db } from '@findeg/db/connection';
import { collections, collectionTags, tags } from '@findeg/db/schema';
import { eq, asc } from 'drizzle-orm';

export type CollectionRow = typeof collections.$inferSelect;
export type CreateCollectionInput = typeof collections.$inferInsert;
export type TagRow = typeof tags.$inferSelect;

/**
 * Get all collections, optionally filtered by active status
 */
export async function getAllCollections(options?: {
    includeInactive?: boolean;
}): Promise<CollectionRow[]> {
    let query = db.select().from(collections).$dynamic();

    if (!options?.includeInactive) {
        query = query.where(eq(collections.isActive, true));
    }

    return query.orderBy(asc(collections.sortOrder));
}

/**
 * Get collection by ID
 */
export async function getCollectionById(id: number): Promise<CollectionRow | null> {
    const results = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    return results[0] || null;
}

/**
 * Get collection by slug
 */
export async function getCollectionBySlug(slug: string): Promise<CollectionRow | null> {
    const results = await db.select().from(collections).where(eq(collections.slug, slug)).limit(1);
    return results[0] || null;
}

/**
 * Get collection with its associated tags
 */
export async function getCollectionWithTags(
    id: number,
): Promise<(CollectionRow & { tags: TagRow[] }) | null> {
    const results = await db.select().from(collections).where(eq(collections.id, id)).limit(1);

    const collection = results[0];
    if (!collection) return null;

    // Fetch associated tags
    const tagResults = await db
        .select({ tag: tags })
        .from(collectionTags)
        .innerJoin(tags, eq(collectionTags.tagId, tags.id))
        .where(eq(collectionTags.collectionId, collection.id));

    return {
        ...collection,
        tags: tagResults.map((r) => r.tag),
    };
}

/**
 * Get collection by slug with its associated tags
 */
export async function getCollectionBySlugWithTags(
    slug: string,
): Promise<(CollectionRow & { tags: TagRow[] }) | null> {
    const results = await db.select().from(collections).where(eq(collections.slug, slug)).limit(1);

    const collection = results[0];
    if (!collection) return null;

    // Fetch associated tags
    const tagResults = await db
        .select({ tag: tags })
        .from(collectionTags)
        .innerJoin(tags, eq(collectionTags.tagId, tags.id))
        .where(eq(collectionTags.collectionId, collection.id));

    return {
        ...collection,
        tags: tagResults.map((r) => r.tag),
    };
}

/**
 * Create a new collection
 */
export async function createCollection(input: CreateCollectionInput): Promise<CollectionRow> {
    const [result] = await db.insert(collections).values(input).returning();
    return result;
}

/**
 * Update a collection
 */
export async function updateCollection(
    id: number,
    input: Partial<CreateCollectionInput>,
): Promise<CollectionRow> {
    const [result] = await db
        .update(collections)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(collections.id, id))
        .returning();
    return result;
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: number): Promise<void> {
    await db.delete(collections).where(eq(collections.id, id));
}

/**
 * Set tags for a collection (replace all existing)
 */
export async function setCollectionTags(collectionId: number, tagIds: number[]): Promise<void> {
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

/**
 * Get tag IDs for a collection
 */
export async function getCollectionTagIds(collectionId: number): Promise<number[]> {
    const results = await db
        .select({ tagId: collectionTags.tagId })
        .from(collectionTags)
        .where(eq(collectionTags.collectionId, collectionId));

    return results.map((r) => r.tagId);
}
