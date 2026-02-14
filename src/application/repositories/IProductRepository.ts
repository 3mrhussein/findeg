/**
 * Product Repository Interface
 */

import { Product } from "@/domain/entities/Product";
import { AdminProductInput } from "@/domain/types/admin";

export interface IProductRepository {
  getById(id: number, language?: string): Promise<Product | null>;
  getAll(language?: string): Promise<Product[]>;
  getFeatured(limit?: number, language?: string): Promise<Product[]>;
  getByCategory(category: string, language?: string): Promise<Product[]>;
  search(query: string, language?: string): Promise<Product[]>;
  create(input: AdminProductInput): Promise<Product>;
  update(id: number, input: AdminProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
  getByIdWithTranslations(id: number): Promise<(AdminProductInput & { id: number }) | null>;
}
