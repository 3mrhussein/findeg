/**
 * Product Service Interface
 *
 * Defines read-only operations for the shop-facing product catalog.
 * Separate from IAdminProductService which includes CRUD operations.
 */

import { Product } from "@/domain/entities/Product";

export interface IProductService {
  getAll(language?: string): Promise<Product[]>;
  getById(id: number, language?: string): Promise<Product | null>;
  getFeaturedProducts(limit?: number, language?: string): Promise<Product[]>;
  searchProducts(query: string, language?: string): Promise<Product[]>;
  getByCategory(category: string, language?: string): Promise<Product[]>;
}
