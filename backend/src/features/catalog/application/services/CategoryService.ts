import { categoryQueries } from '@findeg/db/queries';
import { ID, Slug } from '@findeg/backend/features/core/domain/types/common';
import type { ICategoryService } from '@findeg/backend/features/catalog/application/interfaces/ICategoryService';
import type { Category } from '@findeg/backend/features/catalog/domain/entities/Category';
import { DEFAULT_LOCALE, asTranslationMap, type Locale } from '@findeg/backend/features/core/domain/value-objects';
import type { CategoryInput } from '../dtos/CategoryInput';

export class CategoryService implements ICategoryService {
  /**
   * Map database row to domain entity with i18n support
   */
  private mapToDomain(
    dbCategory: categoryQueries.CategoryRow,
    language: Locale = DEFAULT_LOCALE,
    children?: Category[],
    productCount?: number,
  ): Category {
    let localizedNameDraft: Record<string, string> = {};
    let localizedDescriptionDraft: Record<string, string> = {};

    try {
      if (typeof dbCategory.localizedName === 'string') {
        localizedNameDraft = JSON.parse(dbCategory.localizedName);
      } else if (dbCategory.localizedName && typeof dbCategory.localizedName === 'object') {
        localizedNameDraft = dbCategory.localizedName as Record<string, string>;
      }
    } catch {
      // fallback to empty if parse fails
    }

    try {
      if (typeof dbCategory.localizedDescription === 'string') {
        localizedDescriptionDraft = JSON.parse(dbCategory.localizedDescription);
      } else if (
        dbCategory.localizedDescription &&
        typeof dbCategory.localizedDescription === 'object'
      ) {
        localizedDescriptionDraft = dbCategory.localizedDescription as Record<string, string>;
      }
    } catch {
      // fallback to empty if parse fails
    }

    const localizedContent = {
      name: asTranslationMap(localizedNameDraft, ''),
      slug: dbCategory.slug as Slug,
      description:
        localizedDescriptionDraft && Object.keys(localizedDescriptionDraft).length > 0
          ? asTranslationMap(localizedDescriptionDraft, '')
          : undefined,
    };

    return {
      id: dbCategory.id,
      slug: dbCategory.slug,
      name: localizedContent.name[language] || localizedContent.name.en || dbCategory.slug,
      description:
        localizedContent.description?.[language] || localizedContent.description?.en || undefined,
      locale: language,
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

  async getById(id: ID, language?: Locale): Promise<Category | null> {
    const row = await categoryQueries.getById(id);
    return row ? this.mapToDomain(row, language) : null;
  }

  async getAll(language?: Locale): Promise<Category[]> {
    const rows = await categoryQueries.getAll();
    return rows.map((category) => this.mapToDomain(category, language));
  }

  async getBySlug(slug: Slug, language?: Locale): Promise<Category | null> {
    const row = await categoryQueries.getBySlug(slug);
    return row ? this.mapToDomain(row, language) : null;
  }

  async getTree(language?: Locale): Promise<Category[]> {
    const allCategories = await categoryQueries.getAll();

    // Get direct product counts for all categories in one query
    const directCounts = await categoryQueries.getProductCounts(allCategories.map((c) => c.id));

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
            (sum, child) =>
              sum +
              (((child as unknown as Record<string, unknown>).productCount as number) || 0),
            0,
          );
          const directProductCount = directCounts.get(c.id) || 0;
          const totalProductCount = directProductCount + childrenProductCount;

          return {
            ...this.mapToDomain(c, language, children, totalProductCount),
          };
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    };

    return buildTree(null);
  }

  async getRoots(language?: Locale): Promise<Category[]> {
    const rows = await categoryQueries.getRoots();
    return rows.map((category) => this.mapToDomain(category, language));
  }

  async getChildren(parentId: ID, language?: Locale): Promise<Category[]> {
    const rows = await categoryQueries.getChildren(parentId);
    return rows.map((category) => this.mapToDomain(category, language));
  }

  async getDescendants(categoryId: ID, language?: Locale): Promise<Category[]> {
    const rows = await categoryQueries.getDescendants(categoryId);
    return rows.map((category) => this.mapToDomain(category, language));
  }

  async create(input: CategoryInput): Promise<Category> {
    const row = await categoryQueries.create(input);
    return this.mapToDomain(row);
  }

  async update(id: ID, input: CategoryInput): Promise<Category> {
    const row = await categoryQueries.update(id, input);
    return this.mapToDomain(row);
  }

  async delete(id: ID): Promise<void> {
    return categoryQueries.deleteById(id);
  }

  async reorder(items: { id: ID; sortOrder: number }[]): Promise<void> {
    return categoryQueries.reorder(items as { id: number; sortOrder: number }[]);
  }

  async count(): Promise<number> {
    return categoryQueries.getCount();
  }

  async getProductCount(categoryId: number): Promise<number> {
    return categoryQueries.getProductCount(categoryId);
  }
}
