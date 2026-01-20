/**
 * Product Repository Interface
 */

import { Product } from "@/domain/entities/Product";

export interface IProductRepository {
  getById(id: number, language?: string): Promise<Product | null>;
  getAll(language?: string): Promise<Product[]>;
  getFeatured(limit?: number, language?: string): Promise<Product[]>;
  getByCategory(category: string, language?: string): Promise<Product[]>;
  search(query: string, language?: string): Promise<Product[]>;
}
