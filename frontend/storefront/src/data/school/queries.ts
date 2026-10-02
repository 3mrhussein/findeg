/**
 * School Data Layer (Storefront)
 *
 * The directory reads Partner Schools and their published School Supply Lists.
 * A list itself is opened live by its public code and is never cached here.
 * Search and filter reads are cached; the profile is not, because it embeds
 * list status (publish/archive/replace) that must show immediately.
 */
import { cacheTag, cacheLife } from 'next/cache';
import { createSchoolDirectory, type SchoolSearchParams } from '@findeg/backend/features/school';

/**
 * Search the Partner School directory.
 */
export async function searchSchools(params: SchoolSearchParams) {
  'use cache';
  cacheTag('schools', `school-search-${JSON.stringify(params)}`);
  cacheLife('hours');

  return createSchoolDirectory().searchSchools(params);
}

/**
 * Get filter options for the directory.
 */
export async function getSchoolFilterOptions() {
  'use cache';
  cacheTag('school-filters');
  cacheLife('hours');

  return createSchoolDirectory().getFilterOptions();
}

/**
 * Get a Partner School profile by its code, with its published lists. Uncached.
 */
export async function getSchoolProfile(code: string) {
  return createSchoolDirectory().getByCode(code);
}
