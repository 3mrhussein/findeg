/**
 * Mock Category Repository
 */

import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { Category } from "@/domain/entities/Category";
import { categories } from "@/lib/constants";
import { AdminCategoryInput } from "@/domain/types/admin";

const mockCategories: Category[] = [
  {
    id: 1,
    slug: "electronics",
    name: "Electronics",
    description: "Gadgets and more",
    path: "/1",
    depth: 0,
    sortOrder: 0,
  },
  {
    id: 2,
    slug: "clothing",
    name: "Clothing",
    description: "Fashionable attire",
    path: "/2",
    depth: 0,
    sortOrder: 1,
  },
  {
    id: 3,
    slug: "home-garden",
    name: "Home & Garden",
    description: "Everything for your home",
    path: "/3",
    depth: 0,
    sortOrder: 2,
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
  async getTree(language?: string): Promise<Category[]> {
    return Promise.resolve(mockCategories);
  }

  /**
   *
   */
  async getRoots(language?: string): Promise<Category[]> {
    return Promise.resolve(mockCategories);
  }

  /**
   *
   */
  async getChildren(parentId: number, language?: string): Promise<Category[]> {
    return Promise.resolve([]);
  }

  /**
   *
   */
  async getDescendants(categoryId: number, language?: string): Promise<Category[]> {
    return Promise.resolve([]);
  }

  /**
   *
   */
  async getByPath(path: string, language?: string): Promise<Category | null> {
    return Promise.resolve(null);
  }

  /**
   *
   */
  async create(input: AdminCategoryInput): Promise<Category> {
    throw new Error("Method not implemented.");
  }

  /**
   *
   */
  async update(id: number, input: AdminCategoryInput): Promise<Category> {
    throw new Error("Method not implemented.");
  }

  /**
   *
   */
  async reorder(items: { id: number; sortOrder: number }[]): Promise<void> {
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
    return Promise.resolve(mockCategories.length);
  }
}
