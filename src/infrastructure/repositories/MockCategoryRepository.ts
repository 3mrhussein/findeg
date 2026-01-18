/**
 * Mock Category Repository
 */

import {
  ICategoryRepository,
  CategoryEntity,
} from "@/application/repositories/ICategoryRepository";

const mockCategories: CategoryEntity[] = [
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

export class MockCategoryRepository implements ICategoryRepository {
  async getAll(language?: string): Promise<CategoryEntity[]> {
    return Promise.resolve(mockCategories);
  }

  async getById(id: number, language?: string): Promise<CategoryEntity | null> {
    const category = mockCategories.find((c) => c.id === id);
    return Promise.resolve(category || null);
  }

  async getBySlug(
    slug: string,
    language?: string,
  ): Promise<CategoryEntity | null> {
    const category = mockCategories.find((c) => c.slug === slug);
    return Promise.resolve(category || null);
  }
}
