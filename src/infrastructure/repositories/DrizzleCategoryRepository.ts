import { db } from "@/infrastructure/config/database.config";
import {
  categories,
  categoryTranslations,
  type Category as DbCategory,
  type CategoryTranslation as DbTranslation,
} from "@/infrastructure/database/schema";
import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { Category } from "@/domain/entities/Category";
import { AdminCategoryInput } from "@/domain/types/admin";
import { eq, and, count as sqlCount } from "drizzle-orm";

/**
 *
 */
export class DrizzleCategoryRepository implements ICategoryRepository {
  /**
   *
   */
  private mapToDomain(dbCategory: DbCategory, translation?: DbTranslation): Category {
    return {
      id: dbCategory.id,
      slug: dbCategory.slug,
      name: translation?.name || dbCategory.slug,
      description: translation?.description || undefined,
      parentId: dbCategory.parentId || undefined,
      image: undefined,
    };
  }

  /**
   *
   */
  async getById(id: number, language: string = "en"): Promise<Category | null> {
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
    return this.mapToDomain(result[0].category, result[0].translation || undefined);
  }

  /**
   *
   */
  async getAll(language: string = "en"): Promise<Category[]> {
    const results = await db
      .select({ category: categories, translation: categoryTranslations })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language),
        ),
      );
    return results.map(({ category, translation }) =>
      this.mapToDomain(category, translation || undefined),
    );
  }

  /**
   *
   */
  async getBySlug(slug: string, language: string = "en"): Promise<Category | null> {
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
      .where(eq(categories.slug, slug))
      .limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0].category, result[0].translation || undefined);
  }

  /**
   *
   */
  async create(input: AdminCategoryInput): Promise<Category> {
    return await db.transaction(async (tx) => {
      const [newCategory] = await tx
        .insert(categories)
        .values({
          slug: input.slug,
          parentId: input.parentId || null,
          icon: input.icon || null,
        })
        .returning();

      if (input.translations && input.translations.length > 0) {
        await tx.insert(categoryTranslations).values(
          input.translations.map((t) => ({
            categoryId: newCategory.id,
            language: t.language,
            name: t.name,
            description: t.description || null,
          })),
        );
      }

      const firstTranslation = input.translations?.[0];
      return this.mapToDomain(
        newCategory,
        firstTranslation
          ? {
              categoryId: newCategory.id,
              language: firstTranslation.language,
              name: firstTranslation.name,
              description: firstTranslation.description || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
      );
    });
  }

  /**
   *
   */
  async update(id: number, input: AdminCategoryInput): Promise<Category> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(categories)
        .set({
          slug: input.slug,
          parentId: input.parentId || null,
          icon: input.icon || null,
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
              description: firstTranslation.description || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
      );
    });
  }

  /**
   *
   */
  async delete(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  /**
   *
   */
  async count(): Promise<number> {
    const result = await db.select({ value: sqlCount() }).from(categories);
    return result[0]?.value || 0;
  }
}
