import type { SchoolSupplyListRow } from '@findeg/db/schema';

export interface SchoolFilterOptions {
  governorates: string[];
  schoolTypes: string[];
  academicSystems: string[];
}

export interface SchoolSearchParams {
  query?: string;
  governorate?: string;
  schoolType?: string;
  academicSystem?: string;
  /** Only schools with at least one published list. */
  withPublishedLists?: boolean;
  page: number;
  pageSize: number;
}

/** A Partner School in the directory. `code` is its Business Partner code, used in its URL. */
export interface SchoolSearchResult {
  code: string;
  nameEn: string;
  nameAr: string;
  governorate: string | null;
  area: string | null;
  schoolType: string | null;
  academicSystem: string | null;
  logoUrl: string | null;
  publishedListCount: number;
}

/** A published School Supply List, opened at `/lists/<publicCode>`. */
export interface SchoolProfileList {
  grade: string;
  academicYear: string;
  localizedTitle: SchoolSupplyListRow['localizedTitle'];
  localizedDescription: SchoolSupplyListRow['localizedDescription'];
  heroImageUrl: string | null;
  publicCode: string;
}

export interface SchoolProfile extends Omit<SchoolSearchResult, 'publishedListCount'> {
  /** Published lists only: drafts and archived lists never appear. */
  lists: SchoolProfileList[];
}

export interface ISchoolDirectory {
  searchSchools(
    params: SchoolSearchParams,
  ): Promise<{ items: SchoolSearchResult[]; totalCount: number }>;
  getByCode(code: string): Promise<SchoolProfile | null>;
  getFilterOptions(): Promise<SchoolFilterOptions>;
}
