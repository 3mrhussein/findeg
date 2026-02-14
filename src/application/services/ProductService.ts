/**
 * Product Service
 *
 * This service handles business logic for products.
 * it uses the IProductRepository to interact with data.
 */

import { IProductRepository } from "../repositories/IProductRepository";
import { IProductService } from "./interfaces/IProductService";
import { Product } from "@/domain/entities/Product";

/**
 * Product Service
 *
 * Handles product retrieval and search for the public shop.
 * Provides access to product catalog with filtering and search capabilities.
 */
export class ProductService implements IProductService {
  /**
   * Creates an instance of ProductService
   *
   * @param productRepository - Product data access layer
   */
  constructor(private productRepository: IProductRepository) {}

  /**
   * Retrieves all products
   *
   * @param language - Optional language code (default: "en")
   * @returns Array of all products
   */
  async getAll(language?: string): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  /**
   * Retrieves a product by ID
   *
   * @param id - Product ID
   * @param language - Optional language code (default: "en")
   * @returns Product entity or null if not found
   */
  async getById(id: number, language?: string): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  /**
   * Retrieves featured products for homepage display
   *
   * @param limit - Maximum number of products to return (default: 8)
   * @param language - Optional language code (default: "en")
   * @returns Array of featured products
   */
  async getFeaturedProducts(limit: number = 8, language?: string): Promise<Product[]> {
    return this.productRepository.getFeatured(limit, language);
  }

  /**
   * Searches products by query string
   *
   * @param query - Search query
   * @param language - Optional language code (default: "en")
   * @returns Array of matching products
   */
  async searchProducts(query: string, language?: string): Promise<Product[]> {
    return this.productRepository.search(query, language);
  }

  /**
   * Retrieves products by category
   *
   * @param categoryId - Category ID
   * @param language - Optional language code (default: "en")
   * @returns Array of products in the category
   */
  async getByCategory(categoryId: number, language?: string): Promise<Product[]> {
    return this.productRepository.getByCategory(categoryId, language);
  }
}
