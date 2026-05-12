import { asc, eq } from 'drizzle-orm';

import { db } from '../../connection';
import { collections, collectionTags, tags } from '../../schema';
import type { ID } from '@findeg/db/types/common';

// ─── Read Queries ─────────────────────────────────────────────────────

/**
 * Get all collections with optional filtering for active status
 */
export async function getCollectionsAll(options?: { includeInactive?: boolean }) {
    let query = db.select().from(collections).$dynamic();

    if (!options?.includeInactive) {
        query = query.where(eq(collections.isActive, true));
    }

    const results = await query.orderBy(asc(collections.sortOrder));
    return results;
}

/**
 * Get collection by ID with associated tags
 */
export async function getCollectionByIdWithTags(id: ID) {
    const results = await db.select().from(collections).where(eq(collections.id, id as number)).limit(1);

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
 * Get collection by slug with associated tags
 */
export async function getCollectionBySlug(slug: string) {
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

// ─── Write Queries (CRUD) ──────────────────────────────────────────────

/**
 * Create a new collection
 */
export async function createCollection(input: any) {
    const [result] = await db.insert(collections).values(input).returning();
    return result;
}

/**
 * Update a collection
 */
export async function updateCollection(id: ID, input: any) {
    const [result] = await db
        .update(collections)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(collections.id, id as number))
        .returning();
    return result;
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: ID): Promise<void> {
    await db.delete(collections).where(eq(collections.id, id as number));
}

/**
 * Set tags for a collection (replace existing)
 */
export async function setCollectionTags(collectionId: ID, tagIds: ID[]): Promise<void> {
    await db.transaction(async (tx) => {
        await tx.delete(collectionTags).where(eq(collectionTags.collectionId, collectionId as number));
        if (tagIds.length > 0) {
            await tx.insert(collectionTags).values(
                tagIds.map((tagId) => ({
                    collectionId: collectionId as number,
                    tagId: tagId as number,
                })),
            );
        }
    });
}

/**
 * Update sort orders for multiple collections
 */
export async function updateCollectionSortOrders(items: { id: ID; sortOrder: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
        for (const item of items) {
            await tx
                .update(collections)
                .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                .where(eq(collections.id, item.id as number));
        }
    });
}
