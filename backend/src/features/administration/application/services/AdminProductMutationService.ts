import type { ID } from '../../../core/domain/types/common';
import type { IAuditLogService } from '../interfaces/IAuditLogService';
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
} from '@findeg/backend/features/catalog/application/dtos/VariantInput';
import {
  bulkActivateProducts,
  bulkDeactivateProducts,
  bulkDeleteProducts,
  createProductWithVariantsInDb,
  duplicateProductWithVariants,
  updateProductWithVariantsInDb,
} from '@findeg/db/queries';
import {
  assertCatalogueWriteRules,
  rethrowCatalogueWriteError,
  ensureBrandExists,
  ensureCategoryExists,
  getExistingProductOrThrow,
  type CatalogueWriteRow,
} from './helpers';

/** The SKU and price fields a write sets on each variant, with shared pricing applied. */
function priceRowsOf(input: {
  pricingMode?: 'shared' | 'per-variant';
  sharedBasePrice?: number;
  sharedStrikePrice?: number | null;
  variants?: ReadonlyArray<{ sku?: string; basePrice?: number; strikePrice?: number | null }>;
}): CatalogueWriteRow[] {
  const shared = input.pricingMode === 'shared';
  return (input.variants ?? []).map((variant) => ({
    sku: variant.sku,
    basePrice: shared ? input.sharedBasePrice : variant.basePrice,
    strikePrice: shared ? input.sharedStrikePrice : variant.strikePrice,
  }));
}

interface AdminProductMutationDependencies {
  auditLogService?: IAuditLogService;
}

/**
 * Admin Product Mutation Service
 *
 * Handles all product write operations (create, update, delete, bulk operations).
 * Uses query primitives from @findeg/db/queries for all data mutations.
 * Tracks all mutations through audit logging.
 */
export class AdminProductMutationService {
  constructor(private dependencies: AdminProductMutationDependencies) {}

  /**
   * Creates a product with variants after validating catalogue domain rules and relations.
   */
  async createProduct(
    input: CreateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<{ productId: number }> {
    assertCatalogueWriteRules(priceRowsOf(input));
    await ensureCategoryExists(input.categoryId);
    await ensureBrandExists(input.brandId);

    const productId = await createProductWithVariantsInDb(input);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(productId),
      action: 'create',
      adminUserId,
      newValues: { ...input } as Record<string, unknown>,
    });

    return { productId };
  }

  /**
   * Updates an existing product and its variants after validating catalogue domain rules.
   */
  async updateProduct(
    id: ID,
    input: UpdateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<void> {
    await getExistingProductOrThrow(id);
    assertCatalogueWriteRules(priceRowsOf(input));
    await ensureCategoryExists(input.categoryId);

    await updateProductWithVariantsInDb(id as number, input).catch(rethrowCatalogueWriteError);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'update',
      adminUserId,
      newValues: input as Record<string, unknown>,
    });
  }

  async duplicateProduct(id: number, adminUserId?: number): Promise<{ newId: number }> {
    const result = await duplicateProductWithVariants(id);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'duplicate',
      adminUserId,
      newValues: { newProductId: result.newId },
    });

    return result;
  }

  async bulkActivate(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;

    await bulkActivateProducts(ids);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_activate',
      adminUserId,
      newValues: { ids },
    });
  }

  async bulkDeactivate(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;

    await bulkDeactivateProducts(ids);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_deactivate',
      adminUserId,
      newValues: { ids },
    });
  }

  async bulkDelete(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;

    await bulkDeleteProducts(ids);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_delete',
      adminUserId,
      newValues: { ids },
    });
  }

  async deleteProduct(id: ID, adminUserId?: number): Promise<void> {
    await getExistingProductOrThrow(id);

    await bulkDeleteProducts([id as number]);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'delete',
      adminUserId,
    });
  }
}
