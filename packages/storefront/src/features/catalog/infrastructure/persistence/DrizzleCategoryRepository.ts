import { ID, Slug } from "@/features/core/domain/types/common";
import { db } from "@/features/core/infrastructure/persistence";
import { categories } from "@/features/core/infrastructure/persistence/schema";
import { ICategoryRepository } from "../../application/interfaces/ICategoryRepository";
import { Category } from "../../domain/entities/Category";
import { CategoryInput } from "@/features/administration/domain/types";
import { eq, and, sql, desc, asc, like, isNull, or, count } from "drizzle-orm";
import {
  DEFAULT_LOCALE,
  resolveLocalizedString,
  toLocalizedString,
  type Locale,
} from "@/features/core/domain/value-objects";

type DbCategory = typeof categories.$inferSelect;

/**
 * Drizzle Category Repository
 *
 * Implements hierarchical category management using Materialized Path pattern for efficient tree queries.
 */
export class DrizzleCategoryRepository implements ICategoryRepository {
  private toRouteSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private mapToDomain(
    dbCategory: DbCategory,
    children?: Category[],
    productCount?: number,
  ): Category {
    let localizedNameDraft: Record<string, string> = {};
    let localizedDescriptionDraft: Record<string, string> = {};

    try {
      if (typeof dbCategory.localizedName === "string") {
        localizedNameDraft = JSON.parse(dbCategory.localizedName);
      } else if (dbCategory.localizedName && typeof dbCategory.localizedName === "object") {
        localizedNameDraft = dbCategory.localizedName as Record<string, string>;
      }
    } catch {
      // fallback to empty if parse fails
    }

    try {
      if (typeof dbCategory.localizedDescription === "string") {
        localizedDescriptionDraft = JSON.parse(dbCategory.localizedDescription);
      } else if (
        dbCategory.localizedDescription &&
        typeof dbCategory.localizedDescription === "object"
      ) {
        localizedDescriptionDraft = dbCategory.localizedDescription as Record<string, string>;
      }
    } catch {
      // fallback to empty if parse fails
    }

    const localizedContent = {
      name: toLocalizedString(localizedNameDraft, ""),
      description:
        Object.keys(localizedDescriptionDraft).length > 0
          ? toLocalizedString(localizedDescriptionDraft, "")
          : undefined,
    };

    return {
      id: dbCategory.id,
      slug: dbCategory.slug,
      name: localizedContent.name?.en || dbCategory.slug,
      description: localizedContent.description?.en ?? undefined,
      locale: undefined,
      localizedContent,
      icon: dbCategory.icon || undefined,
      parentId: dbCategory.parentId || undefined,
      path: dbCategory.path,
      depth: dbCategory.depth,
      sortOrder: dbCategory.sortOrder,
      isActive: dbCategory.isActive,
      children: children && children.length > 0 ? children : undefined,
      ...(productCount !== undefined && { productCount }),
    };
  }

  async getById(id: ID, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  async getAll(language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db.select().from(categories).orderBy(asc(categories.sortOrder));

    return results.map((category) => this.mapToDomain(category));
  }

  async getBySlug(slug: string, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);

    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  // Tree Operations

  async getTree(language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const allCategories = await this.getAll(language);
    const { products } = await import("@/features/core/infrastructure/persistence/schema/products");

    // Get direct product counts for all categories in one query
    const productCountsResult = await db
      .select({
        categoryId: products.categoryId,
        count: count(),
      })
      .from(products)
      .where(or(...allCategories.map((c) => eq(products.categoryId, c.id))))
      .groupBy(products.categoryId);

    const directCounts = new Map<number, number>();
    productCountsResult.forEach((row) => {
      if (row.categoryId) {
        directCounts.set(row.categoryId, Number(row.count));
      }
    });

    /**
     * Recursively builds the tree from the flat list and calculates total product count.
     */
    const buildTree = (parentId: number | null = null): Category[] => {
      return allCategories
        .filter((c) => (c.parentId === undefined && parentId === null) || c.parentId === parentId)
        .map((c) => {
          const children = buildTree(c.id);

          // Calculate product count (direct products + all products in descendants)
          const childrenProductCount = children.reduce(
            (sum, child) => sum + ((child as any).productCount || 0),
            0,
          );
          const directProductCount = directCounts.get(c.id as number) || 0;
          const totalProductCount = directProductCount + childrenProductCount;

          return {
            ...c,
            children: children.length > 0 ? children : undefined,
            productCount: totalProductCount,
          };
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    };

    return buildTree(null);
  }

  async getRoots(language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(or(isNull(categories.parentId), eq(categories.depth, 0)))
      .orderBy(asc(categories.sortOrder));

    return results.map((category) => this.mapToDomain(category));
  }

  async getChildren(parentId: ID, language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, parentId))
      .orderBy(asc(categories.sortOrder));

    return results.map((category) => this.mapToDomain(category));
  }

  /**
   * Retrieves ALL descendants efficiently using the materialized path pattern.
   */
  async getDescendants(categoryId: ID, language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    // Get the category first to find its path
    const parent = await this.getById(categoryId);
    if (!parent || !parent.path) return [];

    const results = await db
      .select()
      .from(categories)
      .where(like(categories.path, `${parent.path}%`))
      .orderBy(asc(categories.depth), asc(categories.sortOrder));

    return results
      .filter((c) => c.id !== categoryId) // Exclude self
      .map((category) => this.mapToDomain(category));
  }

  async getByPath(path: string, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.path, path)).limit(1);

    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  // Admin Operations

  /**
   * Creates a new category and calculates its materialized path and depth.
   * If a parent is provided, inherits path structure from parent.
   */
  async create(input: CategoryInput): Promise<Category> {
    return await db.transaction(async (tx) => {
      // Determine path and depth based on parentId
      let path = "/";
      let depth = 0;

      if (input.parentId) {
        const parentResult = await tx
          .select()
          .from(categories)
          .where(eq(categories.id, input.parentId))
          .limit(1);
        if (parentResult.length > 0) {
          path = `${parentResult[0].path}/${parentResult[0].id}`; // e.g., /1/3
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
          path: path, // Temporary path, will update with ID suffix if needed, but standard materialized path usually includes own ID at end or just ancestors.
          // Let's adopt strategy: path = /ancestor1/ancestor2/
          depth: depth,
        })
        .returning();

      // Update path to include own ID to ensure uniqueness or easy query?
      // Strategy: path stores inclusive path e.g. /1/3/7/
      // Let's update it to be strictly ancestors + self
      const inclusivePath = path === "/" ? `/${newCategory.id}/` : `${path}/${newCategory.id}/`;

      const [finalCategory] = await tx
        .update(categories)
        .set({ path: inclusivePath })
        .where(eq(categories.id, newCategory.id))
        .returning();

      // 3. (Legacy translations skipped)

      return this.mapToDomain(finalCategory);
    });
  }

  /**
   * Updates an existing category (including translations).
   * Note: Does NOT fully handle complex path updates if parentId changes (for MVP simplification).
   */
  async update(id: ID, input: CategoryInput): Promise<Category> {
    return await db.transaction(async (tx) => {
      const existing = await tx.select().from(categories).where(eq(categories.id, id)).limit(1);
      if (existing.length === 0) throw new Error("Category not found");

      const oldPath = existing[0].path;
      const oldDepth = existing[0].depth;
      const oldParentId = existing[0].parentId;

      let newPath = oldPath;
      let newDepth = oldDepth;

      if (input.parentId !== oldParentId) {
        let parentPath = "/";
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
        newPath = parentPath === "/" ? `/${id}/` : `${parentPath}${id}/`;
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

      return this.mapToDomain(updated);
    });
  }

  async reorder(items: { id: ID; sortOrder: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(categories)
          .set({ sortOrder: item.sortOrder })
          .where(eq(categories.id, item.id));
      }
    });
  }

  async delete(id: ID): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async count(): Promise<number> {
    const result = await db.select({ value: count() }).from(categories);
    return result[0]?.value || 0;
  }

  async getProductCount(categoryId: number): Promise<number> {
    const { products } = await import("@/features/core/infrastructure/persistence/schema/products");
    const result = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));
    return result[0]?.value || 0;
  }
}
