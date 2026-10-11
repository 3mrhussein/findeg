/**
 * School Data Layer (Storefront)
 *
 * The directory reads Partner Schools and their published School Supply Lists.
 * A list itself is opened live by its public code and is never cached here.
 * Filter options are cached; search and the profile are not, because they embed
 * list status (publish/archive/replace) that must show immediately.
 */
import 'server-only';
import { cacheTag, cacheLife } from 'next/cache';
import { createSchoolDirectory, type SchoolSearchParams } from '@findeg/backend/features/school';

/**
 * Search the Partner School directory. Uncached: rows carry published-list counts.
 */
export async function searchSchools(params: SchoolSearchParams) {
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
