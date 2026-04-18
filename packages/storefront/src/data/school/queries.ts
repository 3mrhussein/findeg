/**
 * School Data Layer (Storefront)
 */
"use cache";

import { cacheTag, cacheLife } from "next/cache";
import {
  getSchoolListViewModel,
  searchSchools as searchBackendSchools,
  getSchoolFilterOptions as getBackendFilterOptions,
  getSchoolProfile as getBackendSchoolProfile,
  getSchoolListPageData as getBackendSchoolListPageData,
  type SchoolSearchParams,
} from "@backend/features/school";

/**
 * Retrieves a school list by code.
 */
export async function getSchoolListData(locale: string, code: string) {
  cacheTag(`school-list-${code}`);
  cacheLife("hours");

  return await getSchoolListViewModel(locale, code);
}

/**
 * Search schools in the directory.
 */
export async function searchSchools(params: SchoolSearchParams) {
  cacheTag("schools", `school-search-${JSON.stringify(params)}`);
  cacheLife("hours");

  return await searchBackendSchools(params);
}

/**
 * Get filter options for schools.
 */
export async function getSchoolFilterOptions() {
  cacheTag("school-filters");
  cacheLife("days");

  return await getBackendFilterOptions();
}

/**
 * Get school profile by slug.
 */
export async function getSchoolProfile(slug: string, userId: number | null = null) {
  cacheTag(`school-${slug}`);
  cacheLife("hours");

  return await getBackendSchoolProfile(slug, userId);
}

/**
 * Get school list page data.
 */
export async function getSchoolListPageData(slug: string, userId: number | null) {
  // Caching strategy: dynamic per user session, but some parts could be shared.
  // For now, we use high-level tags.
  cacheTag(`school-list-${slug}`);
  cacheLife("hours");

  return await getBackendSchoolListPageData(slug, userId);
}
