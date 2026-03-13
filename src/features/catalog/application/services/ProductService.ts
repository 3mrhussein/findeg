import { ID } from "@/features/core/domain/types/common";
import { type IProductRepository, type ProductFilters } from "../interfaces/IProductRepository";
import { type IProductService } from "../interfaces/IProductService";
import { type Product } from "@/features/catalog/domain/entities/Product";
import { type Locale } from "@/features/core/domain/value-objects";

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

  async getFilteredProducts(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }> {
    return this.productRepository.getFiltered(filters, language);
  }
}
