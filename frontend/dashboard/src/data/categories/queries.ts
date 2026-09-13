/**
 * Category Queries (Dashboard Data Layer)
 *
 * Uses "use cache" directive to wrap backend service calls.
 */
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { createCatalogServices } from '@findeg/backend/features/catalog';
import type { Locale } from '@findeg/backend/features/core';

/**
 * Get all categories
 *
 * Cache: Long TTL (days) since categories change infrequently
 */
export async function getCategories(locale: Locale) {
  cacheTag('categories', `categories-${locale}`);
  cacheLife('days');

  const { categories } = createCatalogServices();
  return await categories.getAll(locale);
}

/**
 * Get category by ID
 *
 * Cache: Tagged with category ID
 */
export async function getCategoryById(id: number, locale: Locale) {
  cacheTag('categories', `category-${id}`, `category-${id}-${locale}`);
  cacheLife('days');

  const { categories } = createCatalogServices();
  return await categories.getById(id, locale);
}
