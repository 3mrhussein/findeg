/**
 * Categories Data Layer (Storefront)
 *
 * Provides cached data for the storefront category features.
 * Adheres to Next.js 16 "use cache" standards.
 */
"use cache";

import { cacheTag, cacheLife } from "next/cache";
import {
  createCatalogServices,
  getCategoryPageViewModel as getBackendCategoryViewModel,
  getCategoriesPageData as getBackendCategoriesPageData,
  type CategoryPageViewModel,
} from "@backend/features/catalog";
import { resolveLocale } from "@backend/features/core";

/**
 * Category Page Data
 */
export async function getCategoryPageViewModel(
  slug: string,
  locale: string,
  query: any,
): Promise<CategoryPageViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  cacheTag("categories", `category-${resolvedLocale}-${slug}`);
  cacheLife("hours");

  return await getBackendCategoryViewModel(slug, locale, query);
}

/**
 * Categories List Data (with counts)
 */
export async function getCategoriesPageData(language: string): Promise<any[]> {
  const resolvedLocale = resolveLocale(language);
  cacheTag("categories", `categories-${resolvedLocale}`);
  cacheLife("days");

  return await getBackendCategoriesPageData(language);
}

/**
 * Get all active categories for navigation
 */
export async function getNavCategories(language: string) {
  const locale = resolveLocale(language);
  const { categories } = createCatalogServices();

  cacheTag("categories", `nav-categories-${locale}`);
  cacheLife("days");

  const all = await categories.getAll(locale);
  return all.filter((c) => c.isActive !== false);
}
