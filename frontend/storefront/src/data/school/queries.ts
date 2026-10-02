/**
 * School Data Layer (Storefront)
 *
 * The directory reads Partner Schools and their published School Supply Lists.
 * A list itself is opened live by its public code and is never cached here.
 */
'use cache';

import { cacheTag, cacheLife } from 'next/cache';
import { createSchoolDirectory, type SchoolSearchParams } from '@findeg/backend/features/school';

/**
 * Search the Partner School directory.
 */
export async function searchSchools(params: SchoolSearchParams) {
  cacheTag('schools', `school-search-${JSON.stringify(params)}`);
  cacheLife('hours');

  return createSchoolDirectory().searchSchools(params);
}

/**
 * Get filter options for the directory.
 */
export async function getSchoolFilterOptions() {
  cacheTag('school-filters');
  cacheLife('hours');

  return createSchoolDirectory().getFilterOptions();
}

/**
 * Get a Partner School profile by its code, with its published lists.
 */
export async function getSchoolProfile(code: string) {
  cacheTag(`school-${code}`);
  cacheLife('hours');

  return createSchoolDirectory().getByCode(code);
}
