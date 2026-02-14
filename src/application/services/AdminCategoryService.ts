import { IAdminCategoryService } from "@/application/services/interfaces/IAdminCategoryService";
import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { IAuditLogService } from "@/application/services/interfaces/IAuditLogService";
import { Category } from "@/domain/entities/Category";
import { AdminCategoryInput } from "@/domain/types/admin";

/**
 * Admin Category Service
 *
 * Handles category CRUD operations for the admin dashboard.
 * Manages hierarchical category structure with materialized paths.
 * Logs all mutations to the audit trail.
 */
export class AdminCategoryService implements IAdminCategoryService {
  /**
   * Creates an instance of AdminCategoryService
   *
   * @param categoryRepository - Category data access layer
   * @param auditLogService - Optional audit logging service
   */
  constructor(
    private categoryRepository: ICategoryRepository,
    private auditLogService?: IAuditLogService,
  ) {}

  /**
   * Creates a new category with translations
   *
   * Logs the creation action to the audit trail.
   *
   * @param input - Category data including slug, parent ID, translations
   * @returns Created category entity
   */
  async create(input: AdminCategoryInput): Promise<Category> {
    // renamed createCategory -> create
    const category = await this.categoryRepository.create(input);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: "category",
        entityId: String(category.id),
        action: "create",
        adminUserId: null,
        newValues: input as any, // newData -> newValues
      });
    }

    return category;
  }

  /**
   * Updates an existing category
   *
   * Validates that the category exists before updating.
   * Logs both old and new values to the audit trail.
   *
   * @param id - Category ID to update
   * @param input - Updated category data
   * @returns Updated category entity
   * @throws Error if category not found
   */
  async update(id: number, input: AdminCategoryInput): Promise<Category> {
    // renamed updateCategory -> update
    const existing = await this.categoryRepository.getById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    const updated = await this.categoryRepository.update(id, input);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: "category",
        entityId: String(id),
        action: "update",
        adminUserId: null,
        oldValues: existing as any, // oldData -> oldValues
        newValues: input as any, // newData -> newValues
      });
    }

    return updated;
  }

  /**
   * Deletes a category
   *
   * Logs the deletion action with the category's final state to the audit trail.
   *
   * @param id - Category ID to delete
   * @throws Error if category not found
   */
  async delete(id: number): Promise<void> {
    // renamed deleteCategory -> delete
    const existing = await this.categoryRepository.getById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    await this.categoryRepository.delete(id);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: "category",
        entityId: String(id),
        action: "delete",
        adminUserId: null,
        oldValues: existing as any, // oldData -> oldValues
      });
    }
  }

  /**
   * Retrieves a category by ID
   *
   * @param id - Category ID
   * @returns Category entity or null if not found
   */
  async getById(id: number): Promise<Category | null> {
    // renamed getCategory -> getById
    return this.categoryRepository.getById(id, "en");
  }

  /**
   * Retrieves all categories
   *
   * @param language - Optional language code (default: "en")
   * @returns Array of all categories
   */
  async getAll(language?: string): Promise<Category[]> {
    // renamed getAllCategories -> getAll
    return this.categoryRepository.getAll(language);
  }

  /**
   * Counts total number of categories
   *
   * @returns Total category count
   */
  async count(): Promise<number> {
    // Added count implementation required by interface
    return this.categoryRepository.count();
  }
}
