import { ID } from "@/features/core/domain/types/common";
import { IAdminCategoryService } from "../interfaces/IAdminCategoryService";
import { ICategoryRepository } from "@/features/catalog/application/interfaces/ICategoryRepository";
import { IAuditLogService } from "../interfaces/IAuditLogService";
import { Category } from "@/features/catalog/domain/entities/Category";
import { CategoryInput } from "../../domain/types/CategoryInput";

/**
 * Admin Category Service
 *
 * Handles category CRUD operations for the admin dashboard.
 * Manages hierarchical category structure with materialized paths.
 * Logs all mutations to the audit trail.
 */
export class AdminCategoryService implements IAdminCategoryService {
  /**
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
        entityType: "category",
        entityId: String(category.id),
        action: "create",
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
        entityType: "category",
        entityId: String(id),
        action: "update",
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
        entityType: "category",
        entityId: String(id),
        action: "delete",
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
    return this.categoryRepository.getById(id, "en");
  }

  /**
   * Lists all categories.
   *
   * @param language - Optional localization preference.
   * @returns List of categories.
   */
  async getAll(language?: string): Promise<Category[]> {
    return this.categoryRepository.getAll(language);
  }

  /**
   * Returns the total number of categories in the system.
   */
  async count(): Promise<number> {
    return this.categoryRepository.count();
  }
}
