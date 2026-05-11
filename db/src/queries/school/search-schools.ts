import { and, asc, count, eq, ilike, sql } from 'drizzle-orm';

import { db } from '../../connection';
import { schoolLists } from '../../schema';

export interface SearchSchoolsRawParams {
  query?: string;
  governorate?: string;
  schoolType?: string;
  academicSystem?: string;
  activeOnly?: boolean;
}

export interface SchoolSearchRowRaw {
  schoolName: string;
  governorate: string | null;
  area: string | null;
  schoolType: string | null;
  academicSystem: string | null;
  gradeCount: number;
  activeListCount: number;
  hasCurrentLists: boolean;
  hasLastYearLists: boolean;
}

export async function searchSchoolsRaw(
  params: SearchSchoolsRawParams,
): Promise<SchoolSearchRowRaw[]> {
  const conditions = [];

  if (params.query) {
    conditions.push(ilike(schoolLists.schoolName, `%${params.query}%`));
  }
  if (params.governorate) {
    conditions.push(eq(schoolLists.governorate, params.governorate));
  }
  if (params.schoolType) {
    conditions.push(eq(schoolLists.schoolType, params.schoolType));
  }
  if (params.academicSystem) {
    conditions.push(eq(schoolLists.academicSystem, params.academicSystem));
  }
  if (params.activeOnly) {
    conditions.push(eq(schoolLists.isActive, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      schoolName: schoolLists.schoolName,
      governorate: schoolLists.governorate,
      area: schoolLists.area,
      schoolType: schoolLists.schoolType,
      academicSystem: schoolLists.academicSystem,
      gradeCount: count(schoolLists.id),
      activeListCount: sql<number>`count(CASE WHEN ${schoolLists.isActive} THEN 1 END)`,
      hasCurrentLists: sql<boolean>`bool_or(${schoolLists.isActive})`,
      hasLastYearLists: sql<boolean>`bool_or(NOT ${schoolLists.isActive})`,
    })
    .from(schoolLists)
    .where(whereClause)
    .groupBy(
      schoolLists.schoolName,
      schoolLists.governorate,
      schoolLists.area,
      schoolLists.schoolType,
      schoolLists.academicSystem,
    )
    .orderBy(asc(schoolLists.schoolName));

  return rows.map((row) => ({
    schoolName: row.schoolName,
    governorate: row.governorate,
    area: row.area,
    schoolType: row.schoolType,
    academicSystem: row.academicSystem,
    gradeCount: Number(row.gradeCount),
    activeListCount: Number(row.activeListCount),
    hasCurrentLists: row.hasCurrentLists,
    hasLastYearLists: row.hasLastYearLists,
  }));
}