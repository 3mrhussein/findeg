/**
 * Query Primitives for Categories
 *
 * Pure database queries for hierarchical category management.
 * Uses materialized path pattern for efficient tree queries.
 * No ORM abstraction - direct Drizzle SQL operations.
 * 
 * Note: Returns raw database rows. Domain mapping (i18n, tree building) handled by CategoryService.
 */

import { eq, count, asc, isNull, or, like, sql } from 'drizzle-orm';
import { db } from '../../connection';
import { categories, products } from '../../schema';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CategoryRow = typeof categories.$inferSelect;

export interface CategoryInput {
  slug: string;
  translations?: Array<{ language: string; name: string; description?: string }>;
  parentId?: number | null;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

// ─── Query Functions ─────────────────────────────────────────────────────────

export async function getById(id: number): Promise<CategoryRow | null> {
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0] || null;
}

export async function getAll(): Promise<CategoryRow[]> {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getBySlug(slug: string): Promise<CategoryRow | null> {
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getByPath(path: string): Promise<CategoryRow | null> {
  const result = await db.select().from(categories).where(eq(categories.path, path)).limit(1);
  return result[0] || null;
}

// ─── Tree Operations ─────────────────────────────────────────────────────────

export async function getTree(): Promise<CategoryRow[]> {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getRoots(): Promise<CategoryRow[]> {
  return db
    .select()
    .from(categories)
    .where(or(isNull(categories.parentId), eq(categories.depth, 0)))
    .orderBy(asc(categories.sortOrder));
}

export async function getChildren(parentId: number): Promise<CategoryRow[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.parentId, parentId))
    .orderBy(asc(categories.sortOrder));
}

/**
 * Get product counts for all categories efficiently in one query
 */
export async function getProductCounts(categoryIds: number[]): Promise<Map<number, number>> {
  if (categoryIds.length === 0) return new Map();

  const results = await db
    .select({
      categoryId: products.categoryId,
      count: count(),
    })
    .from(products)
    .where(or(...categoryIds.map((id) => eq(products.categoryId, id))))
    .groupBy(products.categoryId);

  const counts = new Map<number, number>();
  results.forEach((row) => {
    if (row.categoryId) {
      counts.set(row.categoryId, Number(row.count));
    }
  });
  return counts;
}

/**
 * Get all descendants efficiently using materialized path pattern
 */
export async function getDescendants(categoryId: number): Promise<CategoryRow[]> {
  // Get the category first to find its path
  const parent = await getById(categoryId);
  if (!parent || !parent.path) return [];

  const results = await db
    .select()
    .from(categories)
    .where(like(categories.path, `${parent.path}%`))
    .orderBy(asc(categories.depth), asc(categories.sortOrder));

  return results.filter((c) => c.id !== categoryId); // Exclude self
}

// ─── Admin Operations ────────────────────────────────────────────────────────

export async function create(input: CategoryInput): Promise<CategoryRow> {
  return await db.transaction(async (tx) => {
    // Determine path and depth based on parentId
    let path = '/';
    let depth = 0;

    if (input.parentId) {
      const parentResult = await tx
        .select()
        .from(categories)
        .where(eq(categories.id, input.parentId))
        .limit(1);
      if (parentResult.length > 0) {
        path = `${parentResult[0].path}/${parentResult[0].id}`;
        depth = parentResult[0].depth + 1;
      }
    }

    const [newCategory] = await tx
      .insert(categories)
      .values({
        slug: input.slug,
        localizedName: Object.fromEntries(
          (input.translations || []).map((t) => [t.language, t.name]),
        ),
        localizedDescription: Object.fromEntries(
          (input.translations || [])
            .filter((t) => !!t.description)
            .map((t) => [t.language, t.description as string]),
        ),
        parentId: input.parentId || null,
        icon: input.icon || null,
        sortOrder: input.sortOrder || 0,
        isActive: input.isActive ?? true,
        path: path,
        depth: depth,
      })
      .returning();

    // Update path to include own ID
    const inclusivePath = path === '/' ? `/${newCategory.id}/` : `${path}/${newCategory.id}/`;

    const [finalCategory] = await tx
      .update(categories)
      .set({ path: inclusivePath })
      .where(eq(categories.id, newCategory.id))
      .returning();

    return finalCategory;
  });
}

export async function update(id: number, input: CategoryInput): Promise<CategoryRow> {
  return await db.transaction(async (tx) => {
    const existing = await tx.select().from(categories).where(eq(categories.id, id)).limit(1);
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
          .where(eq(categories.id, input.parentId))
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
        localizedName: Object.fromEntries(
          (input.translations || []).map((t) => [t.language, t.name]),
        ),
        localizedDescription: Object.fromEntries(
          (input.translations || [])
            .filter((t) => !!t.description)
            .map((t) => [t.language, t.description as string]),
        ),
        parentId: input.parentId || null,
        icon: input.icon || null,
        sortOrder: input.sortOrder ?? existing[0].sortOrder,
        isActive: input.isActive ?? existing[0].isActive,
        path: newPath,
        depth: newDepth,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated;
  });
}

export async function reorder(items: { id: number; sortOrder: number }[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(categories)
        .set({ sortOrder: item.sortOrder })
        .where(eq(categories.id, item.id));
    }
  });
}

export async function deleteById(id: number): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}

export async function getCount(): Promise<number> {
  const result = await db.select({ value: count() }).from(categories);
  return result[0]?.value || 0;
}

export async function getProductCount(categoryId: number): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, categoryId));
  return result[0]?.value || 0;
}
