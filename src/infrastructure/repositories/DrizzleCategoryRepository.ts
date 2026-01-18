import { db } from "@/infrastructure/config/database.config";
import { categories, categoryTranslations, type Category as DbCategory, type CategoryTranslation as DbTranslation } from "@/infrastructure/database/schema";
import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { Category } from "@/domain/entities/Category";
import { eq, and } from "drizzle-orm";

export class DrizzleCategoryRepository implements ICategoryRepository {
  private mapToDomain(dbCategory: DbCategory, translation?: DbTranslation): Category {
    return {
      id: dbCategory.id,
      slug: dbCategory.slug,
      name: translation?.name || dbCategory.slug,
      description: translation?.description || undefined,
      parentId: dbCategory.parentId || undefined,
      image: undefined, // Add logic if image is added to schema later
    };
  }

  async getById(id: number, language: string = "en"): Promise<Category | null> {
    const result = await db
      .select({
        category: categories,
        translation: categoryTranslations,
      })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language)
        )
      )
      .where(eq(categories.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return this.mapToDomain(result[0].category, result[0].translation || undefined);
  }

  async getAll(language: string = "en"): Promise<Category[]> {
    const results = await db
      .select({
        category: categories,
        translation: categoryTranslations,
      })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language)
        )
      );

    return results.map(({ category, translation }) => this.mapToDomain(category, translation || undefined));
  }

  async getBySlug(slug: string, language: string = "en"): Promise<Category | null> {
    const result = await db
      .select({
        category: categories,
        translation: categoryTranslations,
      })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language)
        )
      )
      .where(eq(categories.slug, slug))
      .limit(1);

    if (result.length === 0) return null;

    return this.mapToDomain(result[0].category, result[0].translation || undefined);
  }
}
