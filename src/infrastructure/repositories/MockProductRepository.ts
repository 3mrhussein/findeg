/**
 * Infrastructure Layer: Mock Product Repository
 *
 * This is a concrete implementation of IProductRepository using mock data.
 * In a real app, you'd have implementations like:
 * - ApiProductRepository (fetches from API)
 * - DatabaseProductRepository (fetches from database)
 *
 * The Application layer doesn't know which implementation is used.
 */

import type { IProductRepository } from "@/application/repositories/IProductRepository";
import type { Product } from "@/domain/entities/Product";
import { products } from "@/lib/constants";

/**
 *
 */
export class MockProductRepository implements IProductRepository {
  /**
   *
   */
  async getAll(language?: string): Promise<Product[]> {
    // Simulate async operation
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
          product.category.toLowerCase().includes(lowerQuery),
      ),
    );
  }

  /**
   *
   */
  async getByCategory(category: string, language?: string): Promise<Product[]> {
    return Promise.resolve(products.filter((p) => p.category === category));
  }

  /**
   *
   */
  async getFeatured(limit: number = 8, language?: string): Promise<Product[]> {
    // For now, just return first N products
    return Promise.resolve(products.slice(0, limit));
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
