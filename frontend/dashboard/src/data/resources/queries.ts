/**
 * Resource Management Queries (Dashboard Data Layer)
 *
 * Admin queries for tags, brands, categories used in forms and management
 * Uses "use cache" directive to wrap backend service calls with Next.js caching.
 */
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { createCatalogServices } from '@findeg/backend/features/catalog';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import type { Locale } from '@findeg/backend/features/core';

/**
 * Get all categories with hierarchy
 *
 * Cache: Tagged with 'categories-admin', revalidated on category mutations
 */
export async function getAllCategories(locale: Locale = 'en') {
  cacheTag('categories-admin', `categories-admin-${locale}`);
  cacheLife('hours');

  const { categories } = createCatalogServices();
  return await categories.getAll(locale);
}

/**
 * Get all brands
 *
 * Cache: Tagged with 'brands-admin', revalidated on brand mutations
 */
export async function getAllBrands(activeOnly: boolean = false, locale: Locale = 'en') {
  cacheTag('brands-admin', `brands-admin-${locale}`);
  cacheLife('hours');

  const { brands } = createAdministrationServices();
  const allBrands = await brands.getAll?.();

  if (activeOnly && allBrands) {
    return allBrands.filter((b: any) => b.isActive);
  }

  return allBrands || [];
}

/**
 * Get all tags
 *
 * Cache: Tagged with 'tags-admin', revalidated on tag mutations
 */
export async function getAllTags(locale: Locale = 'en') {
  cacheTag('tags-admin', `tags-admin-${locale}`);
  cacheLife('hours');

  const { tags } = createCatalogServices();
  return await tags.getAllTags();
}

/**
 * Get all tags grouped by group
 *
 * Cache: Tagged with 'tags-admin', revalidated on tag mutations
 */
export async function getAllTagsGrouped(locale: Locale = 'en'): Promise<Record<string, any[]>> {
  cacheTag('tags-admin', `tags-admin-${locale}`);
  cacheLife('hours');

  const { tags } = createCatalogServices();
  return await tags.getGroupedTags();
}
