/**
 * Product Service
 *
 * This service handles business logic for products.
 * it uses the IProductRepository to interact with data.
 */

import { IProductRepository } from "../repositories/IProductRepository";
import { Product } from "@/domain/entities/Product";

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async getAll(language?: string): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  async getById(id: number, language?: string): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  async getFeaturedProducts(
    limit: number = 8,
    language?: string,
  ): Promise<Product[]> {
    return this.productRepository.getFeatured(limit, language);
  }

  async searchProducts(query: string, language?: string): Promise<Product[]> {
    return this.productRepository.search(query, language);
  }

  async getByCategory(category: string, language?: string): Promise<Product[]> {
    return this.productRepository.getByCategory(category, language);
  }
}
