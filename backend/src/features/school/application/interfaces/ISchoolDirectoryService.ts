

import { SchoolList } from '@findeg/db/schema';

export interface SchoolFilterOptions {
  governorates: string[];
  schoolTypes: string[];
  academicSystems: string[];
}

export interface SchoolProfile {
  id: number;
  name: string;
  governorate: string | null;
  area: string | null;
  schoolType: string | null;
  academicSystem: string | null;
  lists: SchoolList[];
}

export interface SchoolSearchResult {
  schoolName: string;
  governorate: string;
  area: string;
  schoolType?: string;
  academicSystem?: string;
  logoUrl?: string;
  gradeCount: number;
  activeListCount: number;
  hasCurrentLists: boolean;
  hasLastYearLists: boolean;
}

export interface SchoolSearchParams {
  query?: string;
  governorate?: string;
  schoolType?: string;
  academicSystem?: string;
  activeOnly?: boolean;
  page: number;
  pageSize: number;
}

export interface ISchoolDirectoryService {
  searchSchools(
    params: SchoolSearchParams,
  ): Promise<{ items: SchoolSearchResult[]; totalCount: number }>;
  getBySlug(slug: string): Promise<SchoolProfile | null>; // Returns school profile with lists
  suggestSchool(input: { schoolName: string; area: string; email: string }): Promise<void>;
  getFilterOptions(): Promise<SchoolFilterOptions>;
}
