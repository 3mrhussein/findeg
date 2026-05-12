import { ID } from '../../../core/domain/types/common';
import { IAdminCategoryService } from '../interfaces/IAdminCategoryService';
import { IAuditLogService } from '../interfaces/IAuditLogService';
import { Category } from '../../../catalog/domain/entities/Category';
import { CategoryInput } from '../../../catalog/application/dtos/CategoryInput';
import type { Locale } from '../../../core/domain/value-objects';
import {
  getCategoryById,
  getAllCategories,
  getCategoryBySlug,
  getCategoryChildren,
  getCategoryProductCount,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  countCategories,
} from '@findeg/db/queries';

/**
 * Admin Category Service
 *
 * Handles category CRUD operations using query primitives.
 * Manages hierarchical category structure with materialized paths.
 * Logs all mutations to the audit trail.
 */
export class AdminCategoryService implements IAdminCategoryService {
  /**
   * Creates an instance of AdminCategoryService.
   *
   * @param auditLogService - Optional service for tracking administrative changes.
   */
  constructor(private auditLogService?: IAuditLogService) {}

  /**
   * Creates a new product category.
   *
   * @param input - The category data to create.
   * @returns The newly created category entity.
   */
  async create(input: CategoryInput): Promise<Category> {
    const category = await createCategory({
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
    } as any);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'category',
        entityId: String(category.id),
        action: 'create',
        adminUserId: undefined,
        newValues: input as unknown as Record<string, unknown>,
      });
    }

    return category as any as Category;
  }

  /**
   * Updates an existing category's properties.
   *
   * @param id - The ID of the category to update.
   * @param input - The updated category fields.
   * @returns The updated category entity.
   * @throws Error if the category is not found.
   */
  async update(id: ID, input: CategoryInput): Promise<Category> {
    const existing = await getCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    const updated = await updateCategory(id, {
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
    } as any);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'category',
        entityId: String(id),
        action: 'update',
        adminUserId: undefined,
        oldValues: existing as unknown as Record<string, unknown>,
        newValues: input as unknown as Record<string, unknown>,
      });
    }

    return updated as any as Category;
  }

  /**
   * Permanently deletes a category.
   *
   * @param id - The ID of the category to remove.
   * @throws Error if the category does not exist.
   */
  async delete(id: ID): Promise<void> {
    const existing = await getCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    await deleteCategory(id);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'category',
        entityId: String(id),
        action: 'delete',
        adminUserId: undefined,
        oldValues: existing as unknown as Record<string, unknown>,
      });
    }
  }

  /**
   * Retrieves a category by ID for administrative editing.
   *
   * @param id - The category ID.
   * @returns The category if found.
   */
  async getById(id: ID): Promise<Category | null> {
    const result = await getCategoryById(id);
    return result as any as Category | null;
  }

  /**
   * Lists all categories.
   *
   * @param language - Optional localization preference.
   * @returns List of categories.
   */
  async getAll(language?: Locale): Promise<Category[]> {
    const results = await getAllCategories();
    return results as any as Category[];
  }

  /**
   * Retrieves categories in a hierarchical tree structure.
   */
  async getTree(language?: Locale): Promise<Category[]> {
    // Fetch all categories and build tree in-memory
    const allCategories = await getAllCategories();

    // Get product counts for all categories
    const productCounts = new Map<number, number>();
    for (const cat of allCategories) {
      const count = await getCategoryProductCount(cat.id);
      productCounts.set(cat.id, count);
    }

    /**
     * Recursively builds the tree from the flat list and calculates total product count.
     */
    const buildTree = (parentId: number | null = null): any[] => {
      return allCategories
        .filter((c) => (c.parentId === undefined && parentId === null) || c.parentId === parentId)
        .map((c) => {
          const children = buildTree(c.id);
          const childrenProductCount = children.reduce(
            (sum, child) => sum + (child.productCount || 0),
            0,
          );
          const directProductCount = productCounts.get(c.id) || 0;
          const totalProductCount = directProductCount + childrenProductCount;

          return {
            ...c,
            children: children.length > 0 ? children : undefined,
            productCount: totalProductCount,
          };
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    };

    return buildTree(null) as any as Category[];
  }

  /**
   * Returns the total number of categories in the system.
   */
  async count(): Promise<number> {
    return countCategories();
  }

  /**
   * Checks if a slug is available.
   *
   * @param slug - The slug to check.
   * @param excludeId - ID to exclude (useful for edit mode).
   */
  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await getCategoryBySlug(slug);
    if (!existing) return true;
    return existing.id === excludeId;
  }

  /**
   * Moves a category up among its siblings (same parent, same depth).
   */
  async moveCategoryUp(id: number): Promise<void> {
    const category = await getCategoryById(id);
    if (!category) throw new Error('Category not found');

    const siblings = await getCategoryChildren(category.parentId || 0);
    const sortedSiblings = siblings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const currentIndex = sortedSiblings.findIndex((s) => s.id === id);
    if (currentIndex <= 0) return; // Already at top

    const prevSibling = sortedSiblings[currentIndex - 1];

    await reorderCategories([
      { id: category.id, sortOrder: prevSibling.sortOrder || 0 },
      { id: prevSibling.id, sortOrder: category.sortOrder || 0 },
    ]);
  }

  /**
   * Moves a category down among its siblings (same parent, same depth).
   */
  async moveCategoryDown(id: number): Promise<void> {
    const category = await getCategoryById(id);
    if (!category) throw new Error('Category not found');

    const siblings = await getCategoryChildren(category.parentId || 0);
    const sortedSiblings = siblings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const currentIndex = sortedSiblings.findIndex((s) => s.id === id);
    if (currentIndex === -1 || currentIndex >= sortedSiblings.length - 1) return; // Already at bottom

    const nextSibling = sortedSiblings[currentIndex + 1];

    await reorderCategories([
      { id: category.id, sortOrder: nextSibling.sortOrder || 0 },
      { id: nextSibling.id, sortOrder: category.sortOrder || 0 },
    ]);
  }

  /**
   * Reorders multiple categories directly.
   */
  async reorderCategories(items: { id: number; sortOrder: number }[]): Promise<void> {
    await reorderCategories(items);
  }

  /**
   * Gets the number of products assigned to a category.
   */
  async getCategoryProductCount(categoryId: number): Promise<number> {
    return getCategoryProductCount(categoryId);
  }
}
