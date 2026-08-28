import { eq, count, asc, isNull, or, like, sql } from 'drizzle-orm';

import { db } from '../../connection';
import { categories } from '../../schema';
import type { ID } from '@findeg/db/types/common';

export type DbCategory = typeof categories.$inferSelect;

// ─── Read Queries ─────────────────────────────────────────────────────

/**
 * Get category by ID
 */
export async function getCategoryById(id: ID) {
  const result = await db.select().from(categories).where(eq(categories.id, id as number)).limit(1);
  return result[0] || null;
}

/**
 * Get all categories ordered by sort order
 */
export async function getAllCategories() {
  const results = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return results;
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0] || null;
}

/**
 * Get root categories (parentId is null or depth is 0)
 */
export async function getCategoryRoots() {
  const results = await db
    .select()
    .from(categories)
    .where(or(isNull(categories.parentId), eq(categories.depth, 0)))
    .orderBy(asc(categories.sortOrder));
  return results;
}

/**
 * Get direct children of a category
 */
export async function getCategoryChildren(parentId: ID) {
  const results = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, parentId as number))
    .orderBy(asc(categories.sortOrder));
  return results;
}

/**
 * Get all descendants of a category using materialized path
 */
export async function getCategoryDescendants(categoryId: ID) {
  const parent = await getCategoryById(categoryId);
  if (!parent || !parent.path) return [];

  const results = await db
    .select()
    .from(categories)
    .where(like(categories.path, `${parent.path}%`))
    .orderBy(asc(categories.depth), asc(categories.sortOrder));

  // Exclude self
  return results.filter((c) => c.id !== categoryId);
}

/**
 * Get category by materialized path
 */
export async function getCategoryByPath(path: string) {
  const result = await db.select().from(categories).where(eq(categories.path, path)).limit(1);
  return result[0] || null;
}

/**
 * Count total categories
 */
export async function countCategories(): Promise<number> {
  const result = await db.select({ value: count() }).from(categories);
  return result[0]?.value || 0;
}

/**
 * Get product count for a category
 */
export async function getCategoryProductCount(categoryId: ID): Promise<number> {
  const { products } = await import('@findeg/db/schema');
  const result = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, categoryId as number));
  return result[0]?.value || 0;
}

// ─── Write Queries (CRUD) ──────────────────────────────────────────────

/**
 * Create a new category with materialized path calculation
 */
export async function createCategory(input: any) {
  return await db.transaction(async (tx) => {
    // Determine path and depth based on parentId
    let path = '/';
    let depth = 0;

    if (input.parentId) {
      const parentResult = await tx
        .select()
        .from(categories)
        .where(eq(categories.id, input.parentId as number))
        .limit(1);
      if (parentResult.length > 0) {
        path = `${parentResult[0].path}${parentResult[0].id}/`;
        depth = parentResult[0].depth + 1;
      }
    }

    const [newCategory] = await tx
      .insert(categories)
      .values({
        slug: input.slug,
        localizedName: input.localizedName || {},
        localizedDescription: input.localizedDescription || {},
        parentId: input.parentId || null,
        icon: input.icon || null,
        sortOrder: input.sortOrder || 0,
        isActive: input.isActive ?? true,
        path: `${path}`,
        depth: depth,
      })
      .returning();

    // Update path to include own ID
    const inclusivePath = path === '/' ? `/${newCategory.id}/` : `${path}${newCategory.id}/`;
    const [finalCategory] = await tx
      .update(categories)
      .set({ path: inclusivePath })
      .where(eq(categories.id, newCategory.id as number))
      .returning();

    return finalCategory;
  });
}

/**
 * Update a category (including path recalculation if parentId changes)
 */
export async function updateCategory(id: ID, input: any) {
  return await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(categories)
      .where(eq(categories.id, id as number))
      .limit(1);
    if (existing.length === 0) throw new Error('Category not found');

    const oldPath = existing[0].path;
    const oldDepth = existing[0].depth;
    const oldParentId = existing[0].parentId;

    let newPath = oldPath;
    let newDepth = oldDepth;

    if (input.parentId !== oldParentId) {
      let parentPath = '/';
      let parentDepth = 0;

      if (input.parentId) {
        const parentResult = await tx
          .select()
          .from(categories)
          .where(eq(categories.id, input.parentId as number))
          .limit(1);
        if (parentResult.length > 0) {
          parentPath = parentResult[0].path;
          parentDepth = parentResult[0].depth;
        }
      }
      newPath = parentPath === '/' ? `/${id}/` : `${parentPath}${id}/`;
      newDepth = parentDepth + 1;

      // Update all descendants
      const depthDelta = newDepth - oldDepth;
      await tx.execute(sql`
        UPDATE ${categories}
        SET path = REPLACE(path, ${oldPath}, ${newPath}),
            depth = depth + ${depthDelta}
        WHERE path LIKE ${oldPath} || '%'
      `);
    }

    const [updated] = await tx
      .update(categories)
      .set({
        slug: input.slug,
        localizedName: input.localizedName || {},
        localizedDescription: input.localizedDescription || {},
        parentId: input.parentId || null,
        icon: input.icon || null,
        sortOrder: input.sortOrder ?? existing[0].sortOrder,
        isActive: input.isActive ?? existing[0].isActive,
        path: newPath,
        depth: newDepth,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id as number))
      .returning();

    return updated;
  });
}

/**
 * Reorder categories
 */
export async function reorderCategories(items: { id: ID; sortOrder: number }[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(categories)
        .set({ sortOrder: item.sortOrder })
        .where(eq(categories.id, item.id as number));
    }
  });
}

/**
 * Delete a category
 */
export async function deleteCategory(id: ID): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id as number));
}
