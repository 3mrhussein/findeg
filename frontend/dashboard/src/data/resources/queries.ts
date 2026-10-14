/**
 * Resource Management Queries (Dashboard Data Layer)
 *
 * Admin queries for tags, brands, categories used in forms and management
 * Uses "use cache" directive to wrap backend service calls with Next.js caching.
 */
'use cache';

import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createCategoryService, createTagService } from '@findeg/catalog';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import type { Locale } from '@findeg/domain';

/**
 * Get all categories with hierarchy
 *
 * Cache: Tagged with 'categories-admin', revalidated on category mutations
 */
export async function getAllCategories(locale: Locale = 'en') {
  cacheTag('categories');
  cacheLife('hours');

  const categories = createCategoryService();
  return await categories.getAll(locale);
}

/**
 * Get all brands
 *
 * Cache: Tagged with 'brands-admin', revalidated on brand mutations
 */
export async function getAllBrands(activeOnly: boolean = false, locale: Locale = 'en') {
  cacheTag('brands');
  cacheLife('hours');

  const { brands } = createAdministrationServices();
  const allBrands = await brands.getAll?.(activeOnly, locale);

  if (activeOnly && allBrands) {
    return allBrands.filter((b) => b.isActive);
  }

  return allBrands || [];
}

/**
 * Get all tags
 *
 * Cache: Tagged with 'tags-admin', revalidated on tag mutations
 */
export async function getAllTags(_locale: Locale = 'en') {
  cacheTag('tags');
  cacheLife('hours');

  const tags = createTagService();
  return await tags.getAllTags();
}

/**
 * Get all tags grouped by group
 *
 * Cache: Tagged with 'tags-admin', revalidated on tag mutations
 */
export async function getAllTagsGrouped(
  _locale: Locale = 'en',
): Promise<Record<string, import('@findeg/catalog').Tag[]>> {
  cacheTag('tags');
  cacheLife('hours');

  const tags = createTagService();
  return await tags.getGroupedTags();
}
