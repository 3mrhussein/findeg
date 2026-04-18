import { createSchoolServices } from "../services/factory";
import type {
  SchoolSearchParams,
  SchoolSearchResult,
  SchoolFilterOptions,
} from "../interfaces/ISchoolDirectoryService";
import { ID } from "@features/core/domain/types/common";

/**
 * Search schools for the directory page.
 */
export async function searchSchools(params: SchoolSearchParams): Promise<{
  items: SchoolSearchResult[];
  totalCount: number;
}> {
  const { schoolDirectory } = createSchoolServices();
  return await schoolDirectory.searchSchools(params);
}

/**
 * Get filter options for the school directory.
 */
export async function getSchoolFilterOptions(): Promise<SchoolFilterOptions> {
  const { schoolDirectory } = createSchoolServices();
  return await schoolDirectory.getFilterOptions();
}

/**
 * Get school by slug for profile page.
 */
export async function getSchoolBySlug(slug: string): Promise<any> {
  const { schoolDirectory } = createSchoolServices();
  return await schoolDirectory.getBySlug(slug);
}

/**
 * Get hydrated school profile for the storefront.
 */
export async function getSchoolProfile(slug: string, userId: number | null): Promise<any> {
  const { schoolDirectory, schoolAccess } = createSchoolServices();
  const school = await schoolDirectory.getBySlug(slug);

  if (!school) return null;

  // Hydrate lists with access states for the current user
  const hydratedLists = await Promise.all(
    school.lists.map(async (list: any) => {
      const accessState = await schoolAccess.getAccessState(list.id, userId as any);
      return {
        ...list,
        accessState,
      };
    }),
  );

  return {
    ...school,
    lists: hydratedLists,
  };
}
