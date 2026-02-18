import { ID } from "@/features/core/domain/types/common";
import { IAdminProductService } from "../interfaces/IAdminProductService";
import { IProductRepository } from "@/features/catalog/application/interfaces/IProductRepository";
import { ICategoryRepository } from "@/features/catalog/application/interfaces/ICategoryRepository";
import { IBrandRepository } from "@/features/catalog/application/interfaces/IBrandRepository";
import { IAuditLogService } from "../interfaces/IAuditLogService";
import { MediaService } from "@/features/media/application/services/MediaService";
import { Product } from "@/features/catalog/domain/entities/Product";
import { ProductInput } from "../../domain/types/ProductInput";
import type { Locale } from "@/features/core/domain/value-objects";

/**
 * Admin Product Service
 *
 * Handles product CRUD operations for the admin dashboard.
 * Validates category and brand references before mutations.
 * Logs all changes to the audit trail for accountability.
 */
export class AdminProductService implements IAdminProductService {
  /**
   * Creates an instance of AdminProductService.
   *
   * @param productRepository - Repository for product data persistence.
   * @param categoryRepository - Repository for validating category existence.
   * @param brandRepository - Optional repository for validating brand existence.
   * @param auditLogService - Optional service for tracking administrative changes.
   * @param mediaService - Optional service for handling product images.
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private brandRepository?: IBrandRepository,
    private auditLogService?: IAuditLogService,
    private mediaService?: MediaService,
  ) {}

  /**
   * Creates a new product after validating its category and brand references.
   * Logs the creation event to the audit trail if available.
   *
   * @param input - The product data to create.
   * @returns The newly created product entity.
   * @throws Error if the associated category or brand is not found.
   */
  async create(input: ProductInput): Promise<Product> {
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

    const product = await this.productRepository.create(input);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: "product",
        entityId: String(product.id),
        action: "create",
        adminUserId: undefined,
        newValues: input as unknown as Record<string, unknown>,
      });
    }

    return product;
  }

  /**
   * Updates an existing product's information.
   * Performs partial validation of references and logs the old/new values for auditing.
   *
   * @param id - The ID of the product to update.
   * @param input - The updated product fields.
   * @returns The updated product entity.
   * @throws Error if the product, category, or brand is not found.
   */
  async update(id: ID, input: ProductInput): Promise<Product> {
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
        adminUserId: undefined,
        oldValues: existing as unknown as Record<string, unknown>,
        newValues: input as unknown as Record<string, unknown>,
      });
    }

    return updated;
  }

  /**
   * Permanently deletes a product from the system.
   *
   * @param id - The ID of the product to remove.
   * @throws Error if the product does not exist.
   */
  async delete(id: ID): Promise<void> {
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
        adminUserId: undefined,
        oldValues: existing as unknown as Record<string, unknown>,
      });
    }
  }

  /**
   * Retrieves a product by ID for administrative purposes.
   *
   * @param id - Product unique identifier.
   * @param language - Optional language for localized snapshots.
   * @returns Product or null.
   */
  async getById(id: ID, language?: Locale): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  /**
   * Retrieves a product with all its raw localized translations.
   * Used primarily for administrative editing forms.
   *
   * @param id - Product ID.
   * @returns ProductInput data with all languages, or null.
   */
  async getByIdWithTranslations(id: ID): Promise<(ProductInput & { id: ID }) | null> {
    return this.productRepository.getByIdWithTranslations(id);
  }

  /**
   * Lists all products in the system.
   *
   * @param language - Optional language filter.
   * @returns List of products.
   */
  async getAll(language?: Locale): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  /**
   * Returns the total number of products in the database.
   */
  async count(): Promise<number> {
    return this.productRepository.count();
  }
}
