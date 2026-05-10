import { ID } from '@findeg/backend/features/core/domain/types/common';
import { type IProductRepository, type ProductFilters } from '../interfaces/IProductRepository';
import { type IProductService } from '../interfaces/IProductService';
import { type Product } from '@findeg/backend/features/catalog/domain/entities/Product';
import { type Locale } from '@findeg/backend/features/core/domain/value-objects';
import type { ProductInput } from '@findeg/backend/features/administration/domain/types';

export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}

  async getAll(language?: Locale): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  async getById(id: ID, language?: Locale): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  async getBySlug(slug: string, language?: Locale): Promise<Product | null> {
    return this.productRepository.getBySlug(slug, language);
  }

  async getFeaturedProducts(limit: number = 8, language?: Locale): Promise<Product[]> {
    return this.productRepository.getFeatured(limit, language);
  }

  async searchProducts(query: string, language?: Locale): Promise<Product[]> {
    return this.productRepository.search(query, language);
  }

  async getByCategory(categoryId: ID, language?: Locale): Promise<Product[]> {
    return this.productRepository.getByCategory(categoryId, language);
  }

  async getRelatedProducts(
    product: Product,
    limit: number = 4,
    language?: Locale,
  ): Promise<Product[]> {
    const { products } = await this.productRepository.getFiltered(
      {
        categoryId: product.categoryId,
        limit: limit + 5, // Fetch extra for deduplication
        isActive: true,
      },
      language,
    );

    // Remove the current product and slice to limit
    return products.filter((p) => p.id !== product.id).slice(0, limit);
  }

  async getTopSellingProducts(limit: number = 4, language?: Locale): Promise<Product[]> {
    const { products } = await this.productRepository.getFiltered(
      {
        limit,
        isActive: true,
        sort: 'rating', // Using rating as proxy for top selling for now
      },
      language,
    );
    return products;
  }

  async getFilteredProducts(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }> {
    return this.productRepository.getFiltered(filters, language);
  }

  async create(input: ProductInput): Promise<Product> {
    return this.productRepository.create(input);
  }

  async update(id: ID, input: ProductInput): Promise<Product> {
    return this.productRepository.update(id, input);
  }

  async delete(id: ID): Promise<void> {
    return this.productRepository.delete(id);
  }
}
