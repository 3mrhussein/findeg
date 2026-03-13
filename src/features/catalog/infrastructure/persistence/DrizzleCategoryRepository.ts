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
    requestedLocale: Locale = DEFAULT_LOCALE,
  ): Category {
    const localizedSlugDraft = (dbCategory.localizedSlug || {}) as Record<string, string>;
    const localizedNameDraft = (dbCategory.localizedName || {}) as Record<string, string>;
    const localizedDescriptionDraft = (dbCategory.localizedDescription || {}) as Record<
      string,
      string
    >;

    const localizedContent = {
      slug: toLocalizedString(localizedSlugDraft, dbCategory.slug),
      name: toLocalizedString(localizedNameDraft, dbCategory.slug),
      description:
        Object.keys(localizedDescriptionDraft).length > 0
          ? toLocalizedString(localizedDescriptionDraft, "")
          : undefined,
    };

    return {
      id: dbCategory.id,
      slug: resolveLocalizedString(localizedContent.slug, requestedLocale, DEFAULT_LOCALE) as Slug,
      name: resolveLocalizedString(localizedContent.name, requestedLocale, DEFAULT_LOCALE),
      description: localizedContent.description
        ? resolveLocalizedString(localizedContent.description, requestedLocale, DEFAULT_LOCALE)
        : undefined,
      locale: requestedLocale,
      localizedContent,
      icon: dbCategory.icon || undefined,
      parentId: dbCategory.parentId || undefined,
      path: dbCategory.path,
      depth: dbCategory.depth,
      sortOrder: dbCategory.sortOrder,
      isActive: dbCategory.isActive,
      children: children && children.length > 0 ? children : undefined,
    };
  }

  async getById(id: ID, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0], undefined, language);
  }

  async getAll(language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db.select().from(categories).orderBy(asc(categories.sortOrder));

    return results.map((category) => this.mapToDomain(category, undefined, language));
  }

  async getBySlug(slug: string, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db
      .select()
      .from(categories)
      .where(
        or(eq(categories.slug, slug), sql`${categories.localizedSlug} ->> ${language} = ${slug}`),
      )
      .limit(1);

    if (result.length === 0) return null;
    return this.mapToDomain(result[0], undefined, language);
  }

  // Tree Operations

  async getTree(language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const allCategories = await this.getAll(language);

    /**
     * Recursively builds the tree from the flat list.
     */
    const buildTree = (parentId: number | null = null): Category[] => {
      return allCategories
        .filter((c) => (c.parentId === undefined && parentId === null) || c.parentId === parentId)
        .map((c) => ({
          ...c,
          children: buildTree(c.id),
        }))
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

    return results.map((category) => this.mapToDomain(category, undefined, language));
  }

  async getChildren(parentId: ID, language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, parentId))
      .orderBy(asc(categories.sortOrder));

    return results.map((category) => this.mapToDomain(category, undefined, language));
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
      .map((category) => this.mapToDomain(category, undefined, language));
  }

  async getByPath(path: string, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.path, path)).limit(1);

    if (result.length === 0) return null;
    return this.mapToDomain(result[0], undefined, language);
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
          localizedSlug: Object.fromEntries(
            (input.translations || []).map((t) => [
              t.language,
              this.toRouteSlug(t.name) || input.slug,
            ]),
          ),
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

      return this.mapToDomain(
        finalCategory,
        undefined,
        (input.translations?.[0]?.language || DEFAULT_LOCALE) as Locale,
      );
    });
  }

  /**
   * Updates an existing category (including translations).
   * Note: Does NOT fully handle complex path updates if parentId changes (for MVP simplification).
   */
  async update(id: ID, input: CategoryInput): Promise<Category> {
    return await db.transaction(async (tx) => {
      // If parent changed, we need to re-calculate path and depth for this and ALL descendants
      // This is complex, for MVP lets assume simple update or handle path update logic

      const [updated] = await tx
        .update(categories)
        .set({
          slug: input.slug,
          localizedSlug: Object.fromEntries(
            (input.translations || []).map((t) => [
              t.language,
              this.toRouteSlug(t.name) || input.slug,
            ]),
          ),
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
          sortOrder: input.sortOrder,
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, id))
        .returning();

      // 3. (Legacy translations skipped)

      return this.mapToDomain(
        updated,
        undefined,
        (input.translations?.[0]?.language || DEFAULT_LOCALE) as Locale,
      );
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
}
