/**
 * FilterSidebar — shared types & interfaces
 */

import type {
  CategoryFilterOption,
  FilterOption,
} from "@findeg/backend/features/catalog/application/queries/listing";

export interface FilterSidebarProps {
  categories: CategoryFilterOption[];
  brands: FilterOption[];
  minPrice: number;
  maxPrice: number;
}

export { type CategoryFilterOption, type FilterOption };

/**
 * Returns all descendant slugs of a category (including itself).
 */
export function getAllSlugs(category: CategoryFilterOption): string[] {
  const slugs = [category.id];
  for (const child of category.children ?? []) {
    slugs.push(...getAllSlugs(child));
  }
  return slugs;
}

/**
 * Toggle categories in the URL params.
 */
export function applyCategories(current: string[], toAdd: string[], toRemove: string[]): string[] {
  const set = new Set(current);
  toRemove.forEach((s) => set.delete(s));
  toAdd.forEach((s) => set.add(s));
  return Array.from(set);
}
