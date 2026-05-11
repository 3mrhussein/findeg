import type { ID } from '../../../core/domain/types/common';
import type { IAdminProductService } from '../interfaces/IAdminProductService';
import type { IProductRepository } from '../../../catalog/application/interfaces/IProductRepository';
import type { ICategoryRepository } from '../../../catalog/application/interfaces/ICategoryRepository';
import type { IBrandRepository } from '../../../catalog/application/interfaces/IBrandRepository';
import type { IAuditLogService } from '../interfaces/IAuditLogService';
import type { Product } from '../../../catalog/domain/entities/Product';
import type { Locale } from '../../../core/domain/value-objects';
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
  ImageInput,
  CreateVariantInput,
} from '../dtos/VariantInput';
import type { VariantDimension } from '../../../catalog/domain/types/VariantDimension';
import {
  ProductListFilters,
  ProductListResult,
  ProductEditData,
} from '../interfaces/IAdminProductService';
import { AdminProductReadService } from './AdminProductReadService';
import { AdminProductMutationService } from './AdminProductMutationService';
import { AdminProductVariantService } from './AdminProductVariantService';

/**
 * Admin Product Service
 *
 * Orchestrates full product lifecycle for the admin dashboard:
 * - Product shell (SPU) creation/update/delete
 * - Variant generation from attribute dimensions
 * - Price management per variant
 * - SKU uniqueness validation
 * - Audit logging for all mutations
 */
export class AdminProductService implements IAdminProductService {
  private readService: AdminProductReadService;

  private mutationService: AdminProductMutationService;

  private variantService: AdminProductVariantService;

  /**
   *
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private brandRepository?: IBrandRepository,
    private auditLogService?: IAuditLogService,
  ) {
    this.readService = new AdminProductReadService(this.productRepository);
    this.mutationService = new AdminProductMutationService({
      productRepository: this.productRepository,
      categoryRepository: this.categoryRepository,
      brandRepository: this.brandRepository,
      auditLogService: this.auditLogService,
    });
    this.variantService = new AdminProductVariantService(this.auditLogService);
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * Retrieves all products for administrative listing with filters, sort, and pagination.
   */
  async getProductsList(filters: ProductListFilters): Promise<ProductListResult> {
    return this.readService.getProductsList(filters);
  }

  /**
   *
   */
  async getAll(language?: Locale): Promise<Product[]> {
    return this.readService.getAll(language);
  }

  /**
   *
   */
  async getById(id: ID, language?: Locale): Promise<Product | null> {
    return this.readService.getById(id, language);
  }

  /**
   *
   */
  async count(): Promise<number> {
    return this.readService.count();
  }

  // ─── Create Product ────────────────────────────────────────────────────────

  /**
   * Creates a product (SPU) shell with all its variants in a single DB transaction.
   */
  async createProduct(
    input: CreateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<{ productId: number }> {
    return this.mutationService.createProduct(input, adminUserId);
  }

  // ─── Update Product ────────────────────────────────────────────────────────

  /**
   *
   */
  async updateProduct(
    id: ID,
    input: UpdateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<void> {
    return this.mutationService.updateProduct(id, input, adminUserId);
  }

  /**
   * Duplicates an existing product and its variants.
   */
  async duplicateProduct(id: number, adminUserId?: number): Promise<{ newId: number }> {
    return this.mutationService.duplicateProduct(id, adminUserId);
  }

  // ─── Bulk Mutations ─────────────────────────────────────────────────────────

  /**
   * Activates multiple products at once.
   */
  async bulkActivate(ids: number[], adminUserId?: number): Promise<void> {
    return this.mutationService.bulkActivate(ids, adminUserId);
  }

  /**
   * Deactivates multiple products at once.
   */
  async bulkDeactivate(ids: number[], adminUserId?: number): Promise<void> {
    return this.mutationService.bulkDeactivate(ids, adminUserId);
  }

  /**
   * Deletes multiple products at once.
   */
  async bulkDelete(ids: number[], adminUserId?: number): Promise<void> {
    return this.mutationService.bulkDelete(ids, adminUserId);
  }

  // ─── Delete Product ────────────────────────────────────────────────────────

  /**
   *
   */
  async deleteProduct(id: ID, adminUserId?: number): Promise<void> {
    return this.mutationService.deleteProduct(id, adminUserId);
  }

  // ─── Deactivate Variant ────────────────────────────────────────────────────

  /**
   *
   */
  async deactivateVariant(variantId: number, adminUserId?: number): Promise<void> {
    return this.variantService.deactivateVariant(variantId, adminUserId);
  }

  // ─── Variant Generation ────────────────────────────────────────────────────

  /**
   *
   */
  async generateVariants(
    productId: number,
    dimensions: VariantDimension[],
    defaults: Partial<CreateVariantInput>,
    adminUserId?: number,
  ): Promise<number[]> {
    return this.variantService.generateVariants(productId, dimensions, defaults, adminUserId);
  }

  // ─── Rebuild Variant Keys ──────────────────────────────────────────────────

  /**
   *
   */
  async rebuildVariantKeys(productId: number, adminUserId?: number): Promise<void> {
    return this.variantService.rebuildVariantKeys(productId, adminUserId);
  }

  // ─── SKU Validation ────────────────────────────────────────────────────────

  /**
   *
   */
  async checkSkuAvailable(sku: string, excludeVariantId?: number): Promise<boolean> {
    return this.variantService.checkSkuAvailable(sku, excludeVariantId);
  }


  /**
   *
   */

  // ─── Image Management ──────────────────────────────────────────────────────

  /**
   *
   */
  async upsertVariantImages(
    variantId: number,
    images: ImageInput[],
    adminUserId?: number,
  ): Promise<void> {
    return this.variantService.upsertVariantImages(variantId, images, adminUserId);
  }

  /**
   *
   */

  // ─── Fetch for Edit ────────────────────────────────────────────────────────

  /**
   * Retrieves full product data for the edit form.
   */
  async getProductForEdit(id: number): Promise<ProductEditData | null> {
    return this.readService.getProductForEdit(id);
  }

  /**
   * Checks if a slug is available (not used by another product).
   * Note: This checks the 'en' slug specifically as the primary handle.
   */
  async checkSlugAvailable(slug: string, excludeProductId?: number): Promise<boolean> {
    return this.variantService.checkSlugAvailable(slug, excludeProductId);
  }

}
