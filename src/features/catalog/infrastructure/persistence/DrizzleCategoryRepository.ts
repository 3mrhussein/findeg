import { ID, Slug } from "@/features/core/domain/types/common";
import { db } from "@/features/core/infrastructure/persistence";
import {
  categories,
  categoryTranslations,
} from "@/features/core/infrastructure/persistence/schema";
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
type DbTranslation = typeof categoryTranslations.$inferSelect;

/**
 * Drizzle Category Repository
 *
 * Implements hierarchical category management using Materialized Path pattern for efficient tree queries.
 */
export class DrizzleCategoryRepository implements ICategoryRepository {
  /**
   * Converts free text into a URL-safe slug format.
   */
  private toRouteSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Internal mapper to convert database records into Domain Category entities.
   * Handles optional fields and nested children arrays.
   *
   * @param dbCategory - Raw DB category record.
   * @param translation - Optional translation record.
   * @param children - Optional pre-loaded children.
   */
  private mapToDomain(
    dbCategory: DbCategory,
    translation?: DbTranslation,
    children?: Category[],
    requestedLocale: Locale = DEFAULT_LOCALE,
  ): Category {
    const localizedSlugDraft = (dbCategory.localizedSlug || {}) as Record<string, string>;
    const localizedNameDraft = (dbCategory.localizedName || {}) as Record<string, string>;
    const localizedDescriptionDraft = (dbCategory.localizedDescription || {}) as Record<
      string,
      string
    >;

    const translatedSlug =
      translation?.name && this.toRouteSlug(translation.name)
        ? this.toRouteSlug(translation.name)
        : dbCategory.slug;

    const localizedContent = {
      slug: toLocalizedString(
        Object.keys(localizedSlugDraft).length > 0
          ? localizedSlugDraft
          : translation
            ? { [translation.language]: translatedSlug }
            : undefined,
        dbCategory.slug,
      ),
      name: toLocalizedString(
        Object.keys(localizedNameDraft).length > 0
          ? localizedNameDraft
          : translation
            ? { [translation.language]: translation.name }
            : undefined,
        translation?.name || dbCategory.slug,
      ),
      description:
        Object.keys(localizedDescriptionDraft).length > 0 || translation?.description
          ? toLocalizedString(
              Object.keys(localizedDescriptionDraft).length > 0
                ? localizedDescriptionDraft
                : translation?.description
                  ? { [translation.language]: translation.description }
                  : undefined,
              translation?.description || "",
            )
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

  /**
   * Retrieves a category by its numerical ID.
   *
   * @param id - Category ID.
   * @param language - Language code for translation (default 'en').
   * @returns Category entity or null.
   */
  async getById(id: ID, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      )
      .where(eq(categories.id, id))
      .limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(
      result[0].category,
      result[0].translation || undefined,
      undefined,
      language,
    );
  }

  /**
   * Retrieves all categories as a flat list, ordered by sort order.
   *
   * @param language - Localization language.
   * @returns Array of Category entities.
   */
  async getAll(language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      )
      .orderBy(asc(categories.sortOrder));

    return results.map(({ category, translation }) =>
      this.mapToDomain(category, translation || undefined, undefined, language),
    );
  }

  /**
   * Retrieves a category by its URL slug.
   *
   * @param slug - The unique slug string.
   * @param language - Localization language.
   * @returns Category entity or null.
   */
  async getBySlug(slug: string, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      )
      .where(
        or(eq(categories.slug, slug), sql`${categories.localizedSlug} ->> ${language} = ${slug}`),
      )
      .limit(1);

    if (result.length === 0) return null;
    return this.mapToDomain(
      result[0].category,
      result[0].translation || undefined,
      undefined,
      language,
    );
  }

  // Tree Operations

  /**
   * Builds the complete category tree structure.
   * Fetches all categories flat and reconstructs the hierarchy in-memory.
   *
   * @param language - Localization language.
   * @returns Root categories with popluated 'children' arrays.
   */
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

  /**
   * Retrieves only the top-level (root) categories.
   *
   * @param language - Localization language.
   * @returns Array of root Category entities.
   */
  async getRoots(language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      )
      .where(or(isNull(categories.parentId), eq(categories.depth, 0)))
      .orderBy(asc(categories.sortOrder));

    return results.map(({ category, translation }) =>
      this.mapToDomain(category, translation || undefined, undefined, language),
    );
  }

  /**
   * Retrieves direct children of a specific parent category.
   *
   * @param parentId - The parent category ID.
   * @param language - Localization language.
   * @returns Array of child categories.
   */
  async getChildren(parentId: ID, language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    const results = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      )
      .where(eq(categories.parentId, parentId))
      .orderBy(asc(categories.sortOrder));

    return results.map(({ category, translation }) =>
      this.mapToDomain(category, translation || undefined, undefined, language),
    );
  }

  /**
   * Retrieves ALL descendants (children, grandchildren, etc.) of a category
   * efficiently using the materialized path pattern.
   *
   * @param categoryId - The ancestor category ID.
   * @param language - Localization language.
   * @returns List of all descendant categories.
   */
  async getDescendants(categoryId: ID, language: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    // Get the category first to find its path
    const parent = await this.getById(categoryId);
    if (!parent || !parent.path) return [];

    const results = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      )
      .where(like(categories.path, `${parent.path}%`))
      .orderBy(asc(categories.depth), asc(categories.sortOrder));

    return results
      .filter((r) => r.category.id !== categoryId) // Exclude self
      .map(({ category, translation }) =>
        this.mapToDomain(category, translation || undefined, undefined, language),
      );
  }

  /**
   * Retrieves a category directly by its materialized path.
   *
   * @param path - The exact materialized path string (e.g., "/1/3/").
   * @param language - Localization language.
   * @returns Category entity or null.
   */
  async getByPath(path: string, language: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    const result = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      )
      .where(eq(categories.path, path))
      .limit(1);

    if (result.length === 0) return null;
    return this.mapToDomain(
      result[0].category,
      result[0].translation || undefined,
      undefined,
      language,
    );
  }

  // Admin Operations

  /**
   * Creates a new category and calculates its materialized path and depth.
   * If a parent is provided, inherits path structure from parent.
   *
   * @param input - Category creation data.
   * @returns The newly created Category entity.
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

      if (input.translations && input.translations.length > 0) {
        await tx.insert(categoryTranslations).values(
          input.translations.map((t) => ({
            categoryId: finalCategory.id,
            language: t.language,
            name: t.name,
            description: t.description || null,
          })),
        );
      }

      const firstTranslation = input.translations?.[0];
      return this.mapToDomain(
        finalCategory,
        firstTranslation
          ? {
              categoryId: finalCategory.id,
              language: firstTranslation.language,
              name: firstTranslation.name,
              nameNormalized: null,
              description: firstTranslation.description || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
        undefined,
        (firstTranslation?.language || DEFAULT_LOCALE) as Locale,
      );
    });
  }

  /**
   * Updates an existing category (including translations).
   * Note: Does NOT fully handle complex path updates if parentId changes (for MVP simplification).
   *
   * @param id - Category ID.
   * @param input - Updated fields.
   * @returns Updated Category entity.
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

      await tx.delete(categoryTranslations).where(eq(categoryTranslations.categoryId, id));

      if (input.translations && input.translations.length > 0) {
        await tx.insert(categoryTranslations).values(
          input.translations.map((t) => ({
            categoryId: id,
            language: t.language,
            name: t.name,
            description: t.description || null,
          })),
        );
      }

      const firstTranslation = input.translations?.[0];
      return this.mapToDomain(
        updated,
        firstTranslation
          ? {
              categoryId: id,
              language: firstTranslation.language,
              name: firstTranslation.name,
              nameNormalized: null,
              description: firstTranslation.description || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
        undefined,
        (firstTranslation?.language || DEFAULT_LOCALE) as Locale,
      );
    });
  }

  /**
   * Bulk updates the sort order of multiple categories in a transaction.
   *
   * @param items - Array of objects with ID and new sort order.
   */
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

  /**
   * Permanently deletes a category from the database.
   *
   * @param id - Category ID.
   */
  async delete(id: ID): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  /**
   * Counts the total number of categories.
   */
  async count(): Promise<number> {
    const result = await db.select({ value: count() }).from(categories);
    return result[0]?.value || 0;
  }
}
