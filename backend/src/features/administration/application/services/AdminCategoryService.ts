import { ID } from '../../../core/domain/types/common';
import { IAdminCategoryService } from '../interfaces/IAdminCategoryService';
import { ICategoryRepository } from '../../../catalog/application/interfaces/ICategoryRepository';
import { IAuditLogService } from '../interfaces/IAuditLogService';
import { Category } from '../../../catalog/domain/entities/Category';
import { CategoryInput } from '../../../catalog/application/dtos/CategoryInput';
import type { Locale } from '../../../core/domain/value-objects';

/**
 * Admin Category Service
 *
 * Handles category CRUD operations for the admin dashboard.
 * Manages hierarchical category structure with materialized paths.
 * Logs all mutations to the audit trail.
 */
export class AdminCategoryService implements IAdminCategoryService {
  /** b
   * Creates an instance of AdminCategoryService.
   *
   * @param categoryRepository - Repository for category data management.
   * @param auditLogService - Optional service for tracking administrative changes.
   */
  constructor(
    private categoryRepository: ICategoryRepository,
    private auditLogService?: IAuditLogService,
  ) {}

  /**
   * Creates a new product category.
   *
   * @param input - The category data to create.
   * @returns The newly created category entity.
   */
  async create(input: CategoryInput): Promise<Category> {
    const category = await this.categoryRepository.create(input);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'category',
        entityId: String(category.id),
        action: 'create',
        adminUserId: undefined,
        newValues: input as unknown as Record<string, unknown>,
      });
    }

    return category;
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
    const existing = await this.categoryRepository.getById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    const updated = await this.categoryRepository.update(id, input);

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

    return updated;
  }

  /**
   * Permanently deletes a category.
   *
   * @param id - The ID of the category to remove.
   * @throws Error if the category does not exist.
   */
  async delete(id: ID): Promise<void> {
    const existing = await this.categoryRepository.getById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    await this.categoryRepository.delete(id);

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
    return this.categoryRepository.getById(id, 'en');
  }

  /**
   * Lists all categories.
   *
   * @param language - Optional localization preference.
   * @returns List of categories.
   */
  async getAll(language?: Locale): Promise<Category[]> {
    return this.categoryRepository.getAll(language);
  }

  /**
   * Retrieves categories in a hierarchical tree structure.
   */
  async getTree(language?: Locale): Promise<Category[]> {
    return this.categoryRepository.getTree(language);
  }

  /**
   * Returns the total number of categories in the system.
   */
  async count(): Promise<number> {
    return this.categoryRepository.count();
  }

  /**
   * Checks if a slug is available.
   *
   * @param slug - The slug to check.
   * @param excludeId - ID to exclude (useful for edit mode).
   */
  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await this.categoryRepository.getBySlug(slug);
    if (!existing) return true;
    return existing.id === excludeId;
  }

  /**
   * Moves a category up among its siblings (same parent, same depth).
   */
  async moveCategoryUp(id: number): Promise<void> {
    const category = await this.categoryRepository.getById(id);
    if (!category) throw new Error('Category not found');

    const siblings = await this.categoryRepository.getChildren(category.parentId || 0);
    // filter by same depth if repository doesn't guarantee it (materialized path usually does)
    const sortedSiblings = siblings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const currentIndex = sortedSiblings.findIndex((s) => s.id === id);
    if (currentIndex <= 0) return; // Already at top

    const prevSibling = sortedSiblings[currentIndex - 1];

    await this.categoryRepository.reorder([
      { id: category.id, sortOrder: prevSibling.sortOrder || 0 },
      { id: prevSibling.id, sortOrder: category.sortOrder || 0 },
    ]);
  }

  /**
   * Moves a category down among its siblings (same parent, same depth).
   */
  async moveCategoryDown(id: number): Promise<void> {
    const category = await this.categoryRepository.getById(id);
    if (!category) throw new Error('Category not found');

    const siblings = await this.categoryRepository.getChildren(category.parentId || 0);
    const sortedSiblings = siblings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const currentIndex = sortedSiblings.findIndex((s) => s.id === id);
    if (currentIndex === -1 || currentIndex >= sortedSiblings.length - 1) return; // Already at bottom

    const nextSibling = sortedSiblings[currentIndex + 1];

    await this.categoryRepository.reorder([
      { id: category.id, sortOrder: nextSibling.sortOrder || 0 },
      { id: nextSibling.id, sortOrder: category.sortOrder || 0 },
    ]);
  }

  /**
   * Reorders multiple categories directly.
   */
  async reorderCategories(items: { id: number; sortOrder: number }[]): Promise<void> {
    await this.categoryRepository.reorder(items);
  }

  /**
   * Gets the number of products assigned to a category.
   */
  async getCategoryProductCount(categoryId: number): Promise<number> {
    return this.categoryRepository.getProductCount(categoryId);
  }
}
