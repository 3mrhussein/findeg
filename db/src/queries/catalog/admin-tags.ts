import { and, count, eq, inArray, ne } from 'drizzle-orm';

import { db } from '../../connection';
import { productTags, tags } from '../../schema';
import type { ID } from '@findeg/db/types/common';

// ─── Query Helpers ────────────────────────────────────────────────────

export async function checkTagSlugAvailableRaw(
    slug: string,
    excludeId?: number,
): Promise<boolean> {
    const where = excludeId
        ? and(eq(tags.slug, slug), ne(tags.id, excludeId))
        : eq(tags.slug, slug);

    const [result] = await db.select({ value: count() }).from(tags).where(where);

    return Number(result?.value ?? 0) === 0;
}

export async function getTagProductCountRaw(tagId: number): Promise<number> {
    const [result] = await db
        .select({ value: count() })
        .from(productTags)
        .where(eq(productTags.tagId, tagId));

    return Number(result?.value ?? 0);
}

// ─── Read Queries ─────────────────────────────────────────────────────

/**
 * Get all tags ordered by group and key
 */
export async function getAllTags() {
    const results = await db.select().from(tags).orderBy(tags.group, tags.key);
    return results;
}

/**
 * Get tag by ID
 */
export async function getTagById(id: ID) {
    const [row] = await db.select().from(tags).where(eq(tags.id, id as number)).limit(1);
    return row || null;
}

/**
 * Get all distinct tag groups
 */
export async function listDistinctTagGroups(): Promise<string[]> {
    const results = await db.selectDistinct({ group: tags.group }).from(tags);
    return results.map((r) => r.group);
}

// ─── Write Queries (CRUD) ──────────────────────────────────────────────

/**
 * Create a new tag
 */
export async function createTag(input: any) {
    const [result] = await db.insert(tags).values(input).returning();
    return result;
}

/**
 * Update a tag
 */
export async function updateTag(id: ID, input: any) {
    const [result] = await db
        .update(tags)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(tags.id, id as number))
        .returning();
    return result;
}

/**
 * Delete a tag by ID
 */
export async function deleteTag(id: ID): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id as number));
}

/**
 * Bulk delete tags
 */
export async function bulkDeleteTags(ids: ID[]): Promise<void> {
    if (ids.length === 0) return;
    await db.delete(tags).where(inArray(tags.id, ids as number[]));
}

/**
 * Bulk update tag status (isActive)
 */
export async function bulkUpdateTagStatus(ids: ID[], isActive: boolean): Promise<void> {
    if (ids.length === 0) return;
    await db
        .update(tags)
        .set({ isActive, updatedAt: new Date() })
        .where(inArray(tags.id, ids as number[]));
}
