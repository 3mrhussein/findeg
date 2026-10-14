/**
 * Collection Queries (Dashboard Data Layer)
 *
 * Uses "use cache" directive to wrap backend service calls.
 */
'use cache';

import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createAdministrationServices } from '@/lib/administration';

/**
 * Get all collections
 *
 * Cache: Tagged with 'collections', revalidated on collection mutations
 */
export async function getCollections(includeInactive: boolean = true) {
  cacheTag('collections');
  cacheLife('hours');

  const { collections } = createAdministrationServices();
  return await collections.getAll(includeInactive);
}

/**
 * Get collection by ID with tags
 *
 * Cache: Tagged with 'collections'
 */
export async function getCollectionById(id: number) {
  cacheTag('collections');
  cacheLife('hours');

  const { collections } = createAdministrationServices();
  return await collections.getById(id);
}
