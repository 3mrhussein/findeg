/**
 * Admin Product Service Interface
 *
 * Defines CRUD operations for product management in the admin dashboard.
 * Separate from the read-only ProductService used by the shop frontend.
 */

import { Product } from "@/domain/entities/Product";
import { AdminProductInput } from "@/domain/types/admin";

export interface IAdminProductService {
  getAll(language?: string): Promise<Product[]>;
  getById(id: number, language?: string): Promise<Product | null>;
  create(input: AdminProductInput): Promise<Product>;
  update(id: number, input: AdminProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}
