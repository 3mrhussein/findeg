/**
 * Infrastructure Layer: Mock Product Repository
 *
 * This is a concrete implementation of IProductRepository using mock data.
 */

import type {
  IProductRepository,
  ProductFilters,
} from "@/application/repositories/IProductRepository";
import type { Product } from "@/domain/entities/Product";
import { products } from "@/lib/constants";
import { AdminProductInput } from "@/domain/types/admin";

/**
 *
 */
export class MockProductRepository implements IProductRepository {
  /**
   *
   */
  async getByIdWithTranslations(id: number): Promise<(AdminProductInput & { id: number }) | null> {
    const product = products.find((p) => p.id === id);
    if (!product) return null;

    return {
      id: product.id,
      price: product.price,
      // map other fields
      category: product.categoryName,
      images: product.images,
      isNew: product.isNew,
      translations: [
        {
          language: "en",
          name: product.name,
          description: product.description,
          longDescription: product.longDescription,
        },
      ],
    };
  }

  /**
   *
   */
  async getAll(language?: string): Promise<Product[]> {
    return Promise.resolve([...products]);
  }

  /**
   *
   */
  async getById(id: number, language?: string): Promise<Product | null> {
    const product = products.find((p) => p.id === id);
    return Promise.resolve(product || null);
  }

  /**
   *
   */
  async search(query: string, language?: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Promise.resolve(
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery) ||
          (product.categoryName && product.categoryName.toLowerCase().includes(lowerQuery)),
      ),
    );
  }

  /**
   *
   */
  async getByCategory(categoryId: number, language?: string): Promise<Product[]> {
    // Mock doesn't strictly support numeric category ID mapping, return empty or all
    return Promise.resolve([]);
  }

  // Legacy string-based method if interface requires it (it doesn't anymore, I changed it to number)
  // But wait, existing code might call it with string? I updated the interface to `categoryId: number`.
  // So I should implement `getByCategory(categoryId: number)`.

  /**
   *
   */
  async getFeatured(limit: number = 8, language?: string): Promise<Product[]> {
    return Promise.resolve(products.slice(0, limit));
  }

  /**
   *
   */
  async getByBrand(brandId: number, language?: string): Promise<Product[]> {
    return Promise.resolve([]);
  }

  /**
   *
   */
  async getFiltered(
    filters: ProductFilters,
    language?: string,
  ): Promise<{ products: Product[]; total: number }> {
    return Promise.resolve({ products: [...products], total: products.length });
  }

  /**
   *
   */
  async getLowStock(threshold?: number, language?: string): Promise<Product[]> {
    return Promise.resolve([]);
  }

  /**
   *
   */
  async updateStock(id: number, quantity: number): Promise<void> {
    // no-op
    return Promise.resolve();
  }

  /**
   * Updates both stock quantity and low stock threshold for a product
   *
   * @param id - Product ID
   * @param config - New quantity and optional low stock threshold
   */
  async updateStockConfiguration(
    id: number,
    config: { quantity: number; lowStockThreshold?: number },
  ): Promise<void> {
    // no-op
    return Promise.resolve();
  }

  /**
   *
   */
  async bulkUpdateStock(updates: { id: number; quantity: number }[]): Promise<void> {
    // no-op
    return Promise.resolve();
  }

  /**
   *
   */
  async create(input: any): Promise<Product> {
    throw new Error("Method not implemented.");
  }

  /**
   *
   */
  async update(id: number, input: any): Promise<Product> {
    throw new Error("Method not implemented.");
  }

  /**
   *
   */
  async delete(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /**
   *
   */
  async count(): Promise<number> {
    return Promise.resolve(products.length);
  }
}
