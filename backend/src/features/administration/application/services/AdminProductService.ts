import type { ID } from '../../../core/domain/types/common';
import type { IAdminProductService } from '../interfaces/IAdminProductService';
import type { IProductRepository } from '../../../catalog/application/interfaces/IProductRepository';
import type { ICategoryRepository } from '../../../catalog/application/interfaces/ICategoryRepository';
import type { IBrandRepository } from '../../../catalog/application/interfaces/IBrandRepository';
import type { IAuditLogService } from '../interfaces/IAuditLogService';
// Reserved for future product-media orchestration. Current admin product flows persist media URLs only.
// import type { MediaService } from '../../../media/application/services/MediaService';
import type { Product } from '../../../catalog/domain/entities/Product';
import type { Locale } from '../../../core/domain/value-objects';
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
  ImageInput,
  CreateVariantInput,
} from '../../domain/types/VariantInput';
import type { VariantDimension } from '../../../catalog/domain/types/VariantDimension';
import {
  bulkActivateProducts,
  bulkDeactivateProducts,
  bulkDeleteProducts,
  checkProductSlugAvailable,
  checkProductVariantSkuAvailable,
  createProductWithVariantsInDb,
  deactivateProductVariant,
  duplicateProductWithVariants,
  getAdminProductForEditRaw,
  getProductVariantAttributes,
  getAdminProductsListRaw,
  insertGeneratedProductVariants,
  updateProductWithVariantsInDb,
  updateProductVariantKey,
  upsertProductVariantImages,
} from '@findeg/db/queries';
import {
  buildGeneratedProductVariants,
  buildVariantKeyUpdates,
  mapAdminProductEditData,
  mapAdminProductListResult,
} from './AdminProductService.helpers';
import {
  ProductListFilters,
  ProductListResult,
  ProductEditData,
} from '../interfaces/IAdminProductService';

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
  /**
   *
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private brandRepository?: IBrandRepository,
    private auditLogService?: IAuditLogService,
    // Kept for planned direct upload/delete integration; not used by the current product flows.
   // private mediaService?: MediaService,
  ) {}

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * Retrieves all products for administrative listing with filters, sort, and pagination.
   */
  async getProductsList(filters: ProductListFilters): Promise<ProductListResult> {
    const result = await getAdminProductsListRaw(filters);
    return mapAdminProductListResult(result);
  }

  /**
   *
   */
  async getAll(language?: Locale): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  /**
   *
   */
  async getById(id: ID, language?: Locale): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  /**
   *
   */
  async count(): Promise<number> {
    return this.productRepository.count();
  }

  // ─── Create Product ────────────────────────────────────────────────────────

  /**
   * Creates a product (SPU) shell with all its variants in a single DB transaction.
   */
  async createProduct(
    input: CreateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<{ productId: number }> {
    await this.ensureCategoryExists(input.categoryId);
    await this.ensureBrandExists(input.brandId);

    const productId = await createProductWithVariantsInDb(input);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(productId),
      action: 'create',
      adminUserId,
      newValues: { ...input } as Record<string, unknown>,
    });

    return { productId };
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
    await this.getExistingProductOrThrow(id);
    await this.ensureCategoryExists(input.categoryId);

    await updateProductWithVariantsInDb(id as number, input);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'update',
      adminUserId,
      newValues: input as Record<string, unknown>,
    });
  }

  /**
   * Duplicates an existing product and its variants.
   */
  async duplicateProduct(id: number, adminUserId?: number): Promise<{ newId: number }> {
    const result = await duplicateProductWithVariants(id);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'duplicate',
      adminUserId,
      newValues: { newProductId: result.newId },
    });

    return result;
  }

  // ─── Bulk Mutations ─────────────────────────────────────────────────────────

  /**
   * Activates multiple products at once.
   */
  async bulkActivate(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;
    await bulkActivateProducts(ids);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_activate',
      adminUserId,
      newValues: { ids },
    });
  }

  /**
   * Deactivates multiple products at once.
   */
  async bulkDeactivate(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;
    await bulkDeactivateProducts(ids);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_deactivate',
      adminUserId,
      newValues: { ids },
    });
  }

  /**
   * Deletes multiple products at once.
   */
  async bulkDelete(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;
    await bulkDeleteProducts(ids);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_delete',
      adminUserId,
      newValues: { ids },
    });
  }

  // ─── Delete Product ────────────────────────────────────────────────────────

  /**
   *
   */
  async deleteProduct(id: ID, adminUserId?: number): Promise<void> {
    const existing = await this.getExistingProductOrThrow(id);

    await this.productRepository.delete(id);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'delete',
      adminUserId,
      oldValues: existing as unknown as Record<string, unknown>,
    });
  }

  // ─── Deactivate Variant ────────────────────────────────────────────────────

  /**
   *
   */
  async deactivateVariant(variantId: number, adminUserId?: number): Promise<void> {
    await deactivateProductVariant(variantId);

    await this.auditLogService?.logAction({
      entityType: 'product_variant',
      entityId: String(variantId),
      action: 'deactivate',
      adminUserId,
    });
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
    const generatedVariants = buildGeneratedProductVariants(dimensions, defaults);

    const newIds = await insertGeneratedProductVariants(productId, generatedVariants);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(productId),
      action: 'generate_variants',
      adminUserId,
      newValues: { count: newIds.length } as Record<string, unknown>,
    });

    return newIds;
  }

  // ─── Rebuild Variant Keys ──────────────────────────────────────────────────

  /**
   *
   */
  async rebuildVariantKeys(productId: number, adminUserId?: number): Promise<void> {
    const attributeRows = await getProductVariantAttributes(productId);

    for (const update of buildVariantKeyUpdates(attributeRows)) {
      await updateProductVariantKey(update.variantId, update.variantKey);
    }

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(productId),
      action: 'rebuild_variant_keys',
      adminUserId,
    });
  }

  // ─── SKU Validation ────────────────────────────────────────────────────────

  /**
   *
   */
  async checkSkuAvailable(sku: string, excludeVariantId?: number): Promise<boolean> {
    const normalizedSku = sku.trim().toUpperCase();
    return checkProductVariantSkuAvailable(normalizedSku, excludeVariantId);
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
    await upsertProductVariantImages(variantId, images);

    await this.auditLogService?.logAction({
      entityType: 'product_variant',
      entityId: String(variantId),
      action: 'upsert_images',
      adminUserId,
    });
  }

  /**
   *
   */

  // ─── Fetch for Edit ────────────────────────────────────────────────────────

  /**
   * Retrieves full product data for the edit form.
   */
  async getProductForEdit(id: number): Promise<ProductEditData | null> {
    const data = await getAdminProductForEditRaw(id);

    if (!data) return null;

    return mapAdminProductEditData(data);
  }

  /**
   * Checks if a slug is available (not used by another product).
   * Note: This checks the 'en' slug specifically as the primary handle.
   */
  async checkSlugAvailable(slug: string, excludeProductId?: number): Promise<boolean> {
    return checkProductSlugAvailable(slug, excludeProductId);
  }

  private async ensureCategoryExists(categoryId?: number | null): Promise<void> {
    if (!categoryId) return;

    const category = await this.categoryRepository.getById(categoryId);
    if (!category) throw new Error(`Category ${categoryId} not found`);
  }

  private async ensureBrandExists(brandId?: number | null): Promise<void> {
    if (!brandId || !this.brandRepository) return;

    const brand = await this.brandRepository.getById(brandId);
    if (!brand) throw new Error(`Brand ${brandId} not found`);
  }

  private async getExistingProductOrThrow(id: ID): Promise<Product> {
    const existing = await this.productRepository.getById(id);
    if (!existing) throw new Error(`Product ${id} not found`);

    return existing;
  }

}
