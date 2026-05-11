import type { IProductRepository } from '../../../../catalog/application/interfaces/IProductRepository';
import type { ICategoryRepository } from '../../../../catalog/application/interfaces/ICategoryRepository';
import type { IBrandRepository } from '../../../../catalog/application/interfaces/IBrandRepository';
import type { Product } from '../../../../catalog/domain/entities/Product';
import type { ID } from '../../../../core/domain/types/common';

export async function ensureCategoryExists(
  categoryRepository: ICategoryRepository,
  categoryId?: number | null,
): Promise<void> {
  if (!categoryId) return;

  const category = await categoryRepository.getById(categoryId);
  if (!category) throw new Error(`Category ${categoryId} not found`);
}

export async function ensureBrandExists(
  brandRepository?: IBrandRepository,
  brandId?: number | null,
): Promise<void> {
  if (!brandId || !brandRepository) return;

  const brand = await brandRepository.getById(brandId);
  if (!brand) throw new Error(`Brand ${brandId} not found`);
}

export async function getExistingProductOrThrow(
  productRepository: IProductRepository,
  id: ID,
): Promise<Product> {
  const existing = await productRepository.getById(id);
  if (!existing) throw new Error(`Product ${id} not found`);

  return existing;
}