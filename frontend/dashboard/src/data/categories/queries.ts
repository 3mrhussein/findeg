/**
 * Category Queries (Dashboard Data Layer)
 *
 * Uses "use cache" directive to wrap backend service calls.
 */
'use cache';

import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createCategoryService } from '@findeg/backend/features/catalog';
import type { Locale } from '@findeg/domain';

/**
 * Get all categories
 *
 * Cache: Long TTL (days) since categories change infrequently
 */
export async function getCategories(locale: Locale) {
  cacheTag('categories');
  cacheLife('days');

  const categories = createCategoryService();
  return await categories.getAll(locale);
}

/**
 * Get category by ID
 *
 * Cache: Tagged with category ID
 */
export async function getCategoryById(id: number, locale: Locale) {
  cacheTag('categories');
  cacheLife('days');

  const categories = createCategoryService();
  return await categories.getById(id, locale);
}
