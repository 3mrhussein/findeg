import type { ID } from '../../../core/domain/types/common';
import type { IProductRepository } from '../../../catalog/application/interfaces/IProductRepository';
import type { Locale } from '../../../core/domain/value-objects';
import type { Product } from '../../../catalog/domain/entities/Product';
import { getAdminProductForEditRaw, getAdminProductsListRaw } from '@findeg/db/queries';
import { mapAdminProductEditData, mapAdminProductListResult } from './helpers';
import type {
  ProductEditData,
  ProductListFilters,
  ProductListResult,
} from '../interfaces/IAdminProductService';

export class AdminProductReadService {
  constructor(private productRepository: IProductRepository) {}

  async getProductsList(filters: ProductListFilters): Promise<ProductListResult> {
    const result = await getAdminProductsListRaw(filters);
    return mapAdminProductListResult(result);
  }

  async getAll(language?: Locale): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  async getById(id: ID, language?: Locale): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  async count(): Promise<number> {
    return this.productRepository.count();
  }

  async getProductForEdit(id: number): Promise<ProductEditData | null> {
    const data = await getAdminProductForEditRaw(id);

    if (!data) return null;

    return mapAdminProductEditData(data);
  }
}