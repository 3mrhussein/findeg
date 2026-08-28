/**
 * Tag Query Primitives
 *
 * Low-level database access for tag operations.
 * Used by TagService and other services that need tag data.
 */

import { db } from '@findeg/db/connection';
import { tags, productTags } from '@findeg/db/schema';
import { eq } from 'drizzle-orm';

export type TagRow = typeof tags.$inferSelect;
export type CreateTagInput = typeof tags.$inferInsert;

/**
 * Get all tags ordered by group and key
 */
export async function getAllTags(): Promise<TagRow[]> {
    return db.select().from(tags).orderBy(tags.group, tags.key);
}

/**
 * Get tags by group
 */
export async function getTagsByGroup(group: string): Promise<TagRow[]> {
    return db.select().from(tags).where(eq(tags.group, group)).orderBy(tags.key);
}

/**
 * Get tag by ID
 */
export async function getTagById(id: number): Promise<TagRow | null> {
    const [row] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return row || null;
}

/**
 * Create a new tag
 */
export async function createTag(input: CreateTagInput): Promise<TagRow> {
    const [result] = await db.insert(tags).values(input).returning();
    return result;
}

/**
 * Update a tag
 */
export async function updateTag(
    id: number,
    input: Partial<CreateTagInput>,
): Promise<TagRow> {
    const [result] = await db
        .update(tags)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(tags.id, id))
        .returning();
    return result;
}

/**
 * Delete a tag
 */
export async function deleteTag(id: number): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
}

/**
 * Get tags assigned to a product
 */
export async function getTagsForProduct(productId: number): Promise<TagRow[]> {
    const results = await db
        .select({ tag: tags })
        .from(productTags)
        .innerJoin(tags, eq(productTags.tagId, tags.id))
        .where(eq(productTags.productId, productId));

    return results.map((r) => r.tag);
}

/**
 * Set tags for a product (replace all existing)
 */
export async function setProductTags(productId: number, tagIds: number[]): Promise<void> {
    await db.transaction(async (tx) => {
        // Delete existing
        await tx.delete(productTags).where(eq(productTags.productId, productId));
        // Insert new
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

/**
 * Get product IDs for a tag
 */
export async function getProductIdsByTag(tagId: number): Promise<number[]> {
    const results = await db
        .select({ productId: productTags.productId })
        .from(productTags)
        .where(eq(productTags.tagId, tagId));

    return results.map((r) => r.productId);
}
