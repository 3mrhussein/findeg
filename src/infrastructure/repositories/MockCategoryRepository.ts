/**
 * Mock Category Repository
 */

import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { Category } from "@/domain/entities/Category";
import { categories } from "@/lib/constants";

const mockCategories: Category[] = [
  {
    id: 1,
    slug: "electronics",
    name: "Electronics",
    description: "Gadgets and more",
  },
  {
    id: 2,
    slug: "clothing",
    name: "Clothing",
    description: "Fashionable attire",
  },
  {
    id: 3,
    slug: "home-garden",
    name: "Home & Garden",
    description: "Everything for your home",
  },
];

/**
 *
 */
export class MockCategoryRepository implements ICategoryRepository {
  /**
   *
   */
  async getAll(language?: string): Promise<Category[]> {
    return Promise.resolve(mockCategories);
  }

  /**
   *
   */
  async getById(id: number, language?: string): Promise<Category | null> {
    const category = mockCategories.find((c) => c.id === id);
    return Promise.resolve(category || null);
  }

  /**
   *
   */
  async getBySlug(slug: string, language?: string): Promise<Category | null> {
    const category = mockCategories.find((c) => c.slug === slug);
    return Promise.resolve(category || null);
  }

  /**
   *
   */
  async create(input: any): Promise<Category> {
    throw new Error("Method not implemented.");
  }

  /**
   *
   */
  async update(id: number, input: any): Promise<Category> {
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
    // We don't have direct access to mockCategories array here if it's outside class
    // actually it is in the same file
    return Promise.resolve(3); // Hardcoded based on mockCategories in file
  }
}
