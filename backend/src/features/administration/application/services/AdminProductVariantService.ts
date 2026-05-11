import type { IAuditLogService } from '../interfaces/IAuditLogService';
import type { ImageInput, CreateVariantInput } from '../dtos/VariantInput';
import type { VariantDimension } from '../../../catalog/domain/types/VariantDimension';
import {
  checkProductSlugAvailable,
  checkProductVariantSkuAvailable,
  deactivateProductVariant,
  getProductVariantAttributes,
  insertGeneratedProductVariants,
  updateProductVariantKey,
  upsertProductVariantImages,
} from '@findeg/db/queries';
import { buildGeneratedProductVariants, buildVariantKeyUpdates } from './helpers';

export class AdminProductVariantService {
  constructor(private auditLogService?: IAuditLogService) {}

  async deactivateVariant(variantId: number, adminUserId?: number): Promise<void> {
    await deactivateProductVariant(variantId);

    await this.auditLogService?.logAction({
      entityType: 'product_variant',
      entityId: String(variantId),
      action: 'deactivate',
      adminUserId,
    });
  }

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

  async checkSkuAvailable(sku: string, excludeVariantId?: number): Promise<boolean> {
    const normalizedSku = sku.trim().toUpperCase();
    return checkProductVariantSkuAvailable(normalizedSku, excludeVariantId);
  }

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

  async checkSlugAvailable(slug: string, excludeProductId?: number): Promise<boolean> {
    return checkProductSlugAvailable(slug, excludeProductId);
  }
}