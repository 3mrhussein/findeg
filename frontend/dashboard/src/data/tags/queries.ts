/**
 * Tag Queries (Dashboard Data Layer)
 */
'use cache';

import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createTagService } from '@findeg/catalog';

/**
 * Get all tags
 */
export async function getAllTags() {
  cacheTag('tags');
  cacheLife('hours');

  const tags = createTagService();
  return await tags.getAllTags();
}

/**
 * Get all tags grouped by group
 */
export async function getAllTagsGrouped() {
  cacheTag('tags');
  cacheLife('hours');

  const tags = createTagService();
  return await tags.getGroupedTags();
}
