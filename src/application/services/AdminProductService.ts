/**
 * Admin Product Service Implementation
 *
 * Handles product CRUD operations for the admin dashboard.
 * Depends only on IProductRepository interface.
 */

import { IAdminProductService } from "./interfaces/IAdminProductService";
import { IProductRepository } from "../repositories/IProductRepository";
import { Product } from "@/domain/entities/Product";
import { AdminProductInput } from "@/domain/types/admin";

/**
 *
 */
export class AdminProductService implements IAdminProductService {
  /**
   *
   */
  constructor(private productRepository: IProductRepository) {}

  /**
   *
   */
  async getAll(language?: string): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  /**
   *
   */
  async getById(id: number, language?: string): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  /**
   *
   */
  async getByIdWithTranslations(id: number): Promise<(AdminProductInput & { id: number }) | null> {
    return this.productRepository.getByIdWithTranslations(id);
  }

  /**
   *
   */
  async create(input: AdminProductInput): Promise<Product> {
    return this.productRepository.create(input);
  }

  /**
   *
   */
  async update(id: number, input: AdminProductInput): Promise<Product> {
    return this.productRepository.update(id, input);
  }

  /**
   *
   */
  async delete(id: number): Promise<void> {
    return this.productRepository.delete(id);
  }

  /**
   *
   */
  async count(): Promise<number> {
    return this.productRepository.count();
  }
}
