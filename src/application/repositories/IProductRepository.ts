/**
 * Product Repository Interface
 */

import { Product } from "@/domain/entities/Product";
import { AdminProductInput } from "@/domain/types/admin";

export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "rating";
}

export interface IProductRepository {
  getById(id: number, language?: string): Promise<Product | null>;
  getAll(language?: string): Promise<Product[]>;
  getFeatured(limit?: number, language?: string): Promise<Product[]>;
  getByCategory(categoryId: number, language?: string): Promise<Product[]>;
  getByBrand(brandId: number, language?: string): Promise<Product[]>;
  search(query: string, language?: string): Promise<Product[]>;
  getFiltered(
    filters: ProductFilters,
    language?: string,
  ): Promise<{ products: Product[]; total: number }>;

  // Stock Management
  getLowStock(threshold?: number, language?: string): Promise<Product[]>;
  updateStock(id: number, quantity: number): Promise<void>;
  updateStockConfiguration(
    id: number,
    config: { quantity: number; lowStockThreshold?: number },
  ): Promise<void>;
  bulkUpdateStock(updates: { id: number; quantity: number }[]): Promise<void>;

  create(input: AdminProductInput): Promise<Product>;
  update(id: number, input: AdminProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
  count(filters?: ProductFilters): Promise<number>;
  getByIdWithTranslations(id: number): Promise<(AdminProductInput & { id: number }) | null>;
}
