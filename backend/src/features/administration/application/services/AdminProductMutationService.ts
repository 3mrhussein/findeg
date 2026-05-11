import type { ID } from '../../../core/domain/types/common';
import type { IProductRepository } from '../../../catalog/application/interfaces/IProductRepository';
import type { ICategoryRepository } from '../../../catalog/application/interfaces/ICategoryRepository';
import type { IBrandRepository } from '../../../catalog/application/interfaces/IBrandRepository';
import type { IAuditLogService } from '../interfaces/IAuditLogService';
import type { CreateProductWithVariantsInput, UpdateProductWithVariantsInput } from '../dtos/VariantInput';
import {
  bulkActivateProducts,
  bulkDeactivateProducts,
  bulkDeleteProducts,
  createProductWithVariantsInDb,
  duplicateProductWithVariants,
  updateProductWithVariantsInDb,
} from '@findeg/db/queries';
import {
  ensureBrandExists,
  ensureCategoryExists,
  getExistingProductOrThrow,
} from './helpers';

interface AdminProductMutationDependencies {
  productRepository: IProductRepository;
  categoryRepository: ICategoryRepository;
  brandRepository?: IBrandRepository;
  auditLogService?: IAuditLogService;
}

export class AdminProductMutationService {
  constructor(private dependencies: AdminProductMutationDependencies) {}

  async createProduct(
    input: CreateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<{ productId: number }> {
    await ensureCategoryExists(this.dependencies.categoryRepository, input.categoryId);
    await ensureBrandExists(this.dependencies.brandRepository, input.brandId);

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

  async updateProduct(
    id: ID,
    input: UpdateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<void> {
    await getExistingProductOrThrow(this.dependencies.productRepository, id);
    await ensureCategoryExists(this.dependencies.categoryRepository, input.categoryId);

    await updateProductWithVariantsInDb(id as number, input);

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
    const existing = await getExistingProductOrThrow(this.dependencies.productRepository, id);

    await this.dependencies.productRepository.delete(id);

    await this.dependencies.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'delete',
      adminUserId,
      oldValues: existing as unknown as Record<string, unknown>,
    });
  }
}