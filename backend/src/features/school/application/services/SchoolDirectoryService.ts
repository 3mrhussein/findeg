import {
  getSchoolBySlugRaw,
  getSchoolFilterOptionsRaw,
  searchSchoolsRaw,
} from '@findeg/db/queries';
import {
  ISchoolDirectoryService,
  SchoolSearchParams,
  SchoolSearchResult,
  SchoolFilterOptions,
  SchoolProfile,
} from '../interfaces/ISchoolDirectoryService';

/**
 *
 */
export class SchoolDirectoryService implements ISchoolDirectoryService {
  /**
   *
   */
  async searchSchools(
    params: SchoolSearchParams,
  ): Promise<{ items: SchoolSearchResult[]; totalCount: number }> {
    const { page, pageSize } = params;

    const offset = (page - 1) * pageSize;
    const allResults = await searchSchoolsRaw(params);
    const totalCount = allResults.length;
    const items = allResults.slice(offset, offset + pageSize) as SchoolSearchResult[];

    return { items, totalCount };
  }

  /**
   *
   */
  async getBySlug(slug: string): Promise<SchoolProfile | null> {
    const results = await getSchoolBySlugRaw(slug);

    if (results.length === 0) return null;

    const schoolInfo = results[0];

    return {
      id: schoolInfo.id,
      name: schoolInfo.schoolName,
      governorate: schoolInfo.governorate,
      area: schoolInfo.area,
      schoolType: schoolInfo.schoolType,
      academicSystem: schoolInfo.academicSystem,
      lists: results,
    };
  }

  /**
   *
   */
  async suggestSchool(input: { schoolName: string; area: string; email: string }): Promise<void> {
    // In a real scenario, this would send an email or log a request.
    console.log('School suggestion received:', input);
  }

  /**
   *
   */
  async getFilterOptions(): Promise<SchoolFilterOptions> {
    const { governorates, schoolTypes, academicSystems } = await getSchoolFilterOptionsRaw();

    return {
      governorates: governorates
        .map((g: { value: string | null }) => g.value)
        .filter((v): v is string => Boolean(v)),
      schoolTypes: schoolTypes
        .map((t: { value: string | null }) => t.value)
        .filter((v): v is string => Boolean(v)),
      academicSystems: academicSystems
        .map((s: { value: string | null }) => s.value)
        .filter((v): v is string => Boolean(v)),
    };
  }
}
