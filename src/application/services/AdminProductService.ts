import { IAdminProductService } from "@/application/services/interfaces/IAdminProductService";
import { IProductRepository } from "@/application/repositories/IProductRepository";
import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { IBrandRepository } from "@/application/repositories/IBrandRepository";
import { IAuditLogService } from "@/application/services/interfaces/IAuditLogService";
import { MediaService } from "@/application/services/MediaService";
import { Product } from "@/domain/entities/Product";
import { AdminProductInput } from "@/domain/types/admin";

/**
 * Admin Product Service
 *
 * Handles product CRUD operations for the admin dashboard.
 * Validates category and brand references before mutations.
 * Logs all changes to the audit trail for accountability.
 */
export class AdminProductService implements IAdminProductService {
  /**
   * Creates an instance of AdminProductService
   *
   * @param productRepository - Product data access layer
   * @param categoryRepository - Category data access layer for validation
   * @param brandRepository - Optional brand data access layer for validation
   * @param auditLogService - Optional audit logging service
   * @param mediaService - Optional media management service
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private brandRepository?: IBrandRepository,
    private auditLogService?: IAuditLogService,
    private mediaService?: MediaService,
  ) {}

  /**
   * Creates a new product with translations
   *
   * Validates that the specified category and brand exist before creation.
   * Logs the creation action to the audit trail.
   *
   * @param input - Product data including translations, pricing, inventory
   * @returns Created product entity
   * @throws Error if category or brand not found
   */
  async create(input: AdminProductInput): Promise<Product> {
    // Validate category exists
    if (input.categoryId) {
      const category = await this.categoryRepository.getById(input.categoryId);
      if (!category) {
        throw new Error(`Category with ID ${input.categoryId} not found`);
      }
    }

    // Validate brand exists
    if (input.brandId && this.brandRepository) {
      const brand = await this.brandRepository.getById(input.brandId);
      if (!brand) {
        throw new Error(`Brand with ID ${input.brandId} not found`);
      }
    }

    const product = await this.productRepository.create(input);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: "product",
        entityId: String(product.id),
        action: "create",
        adminUserId: null, // Should be passed from context
        newValues: input as any,
      });
    }

    return product;
  }

  /**
   * Updates an existing product
   *
   * Validates that the product, category, and brand exist before updating.
   * Logs both old and new values to the audit trail.
   *
   * @param id - Product ID to update
   * @param input - Updated product data
   * @returns Updated product entity
   * @throws Error if product, category, or brand not found
   */
  async update(id: number, input: AdminProductInput): Promise<Product> {
    const existing = await this.productRepository.getById(id);
    if (!existing) {
      throw new Error(`Product with ID ${id} not found`);
    }

    if (input.categoryId) {
      const category = await this.categoryRepository.getById(input.categoryId);
      if (!category) {
        throw new Error(`Category with ID ${input.categoryId} not found`);
      }
    }

    if (input.brandId && this.brandRepository) {
      const brand = await this.brandRepository.getById(input.brandId);
      if (!brand) {
        throw new Error(`Brand with ID ${input.brandId} not found`);
      }
    }

    const updated = await this.productRepository.update(id, input);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: "product",
        entityId: String(id),
        action: "update",
        adminUserId: null,
        oldValues: existing as any,
        newValues: input as any,
      });
    }

    return updated;
  }

  /**
   * Deletes a product
   *
   * Logs the deletion action with the product's final state to the audit trail.
   *
   * @param id - Product ID to delete
   * @throws Error if product not found
   */
  async delete(id: number): Promise<void> {
    const existing = await this.productRepository.getById(id);
    if (!existing) {
      throw new Error(`Product with ID ${id} not found`);
    }

    await this.productRepository.delete(id);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: "product",
        entityId: String(id),
        action: "delete",
        adminUserId: null,
        oldValues: existing as any,
      });
    }
  }

  /**
   * Retrieves a product by ID with translations
   *
   * @param id - Product ID
   * @param language - Optional language code (default: "en")
   * @returns Product entity or null if not found
   */
  async getById(id: number, language?: string): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  /**
   * Retrieves a product with all translations for editing
   *
   * @param id - Product ID
   * @returns Product with all language translations or null if not found
   */
  async getByIdWithTranslations(id: number): Promise<(AdminProductInput & { id: number }) | null> {
    return this.productRepository.getByIdWithTranslations(id);
  }

  /**
   * Retrieves all products
   *
   * @param language - Optional language code (default: "en")
   * @returns Array of all products
   */
  async getAll(language?: string): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  /**
   * Counts total number of products
   *
   * @returns Total product count
   */
  async count(): Promise<number> {
    return this.productRepository.count();
  }
}
