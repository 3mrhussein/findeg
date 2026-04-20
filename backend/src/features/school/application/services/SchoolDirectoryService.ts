import { db } from "@findeg/db";
import { schoolLists } from "@findeg/db/schema";
import { eq, and, ilike, sql, desc, count, asc } from "drizzle-orm";
import {
  ISchoolDirectoryService,
  SchoolSearchParams,
  SchoolSearchResult,
  SchoolFilterOptions,
} from "../interfaces/ISchoolDirectoryService";

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
    const { query, governorate, schoolType, academicSystem, activeOnly, page, pageSize } = params;

    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (query) {
      conditions.push(ilike(schoolLists.schoolName, `%${query}%`));
    }
    if (governorate) {
      conditions.push(eq(schoolLists.governorate, governorate));
    }
    if (schoolType) {
      conditions.push(eq(schoolLists.schoolType, schoolType));
    }
    if (academicSystem) {
      conditions.push(eq(schoolLists.academicSystem, academicSystem));
    }
    if (activeOnly) {
      conditions.push(eq(schoolLists.isActive, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Grouping by schoolName as per user's preference
    const schoolsQuery = db
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

    const allResults = await schoolsQuery;
    const totalCount = allResults.length;
    const items = allResults.slice(offset, offset + pageSize) as SchoolSearchResult[];

    return { items, totalCount };
  }

  /**
   *
   */
  async getBySlug(slug: string): Promise<any> {
    // A "school slug" in this grouped model is effectively the school name URL-encoded or a canonical slug.
    // For now, we'll fetch all lists for a specific school name.
    const results = await db
      .select()
      .from(schoolLists)
      .where(ilike(schoolLists.schoolName, slug.replace(/-/g, " "))) // Simple slug to name conversion
      .orderBy(desc(schoolLists.isActive), asc(schoolLists.grade));

    if (results.length === 0) return null;

    const schoolInfo = results[0];

    return {
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
    console.log("School suggestion received:", input);
  }

  /**
   *
   */
  async getFilterOptions(): Promise<SchoolFilterOptions> {
    const governorates = await db
      .selectDistinct({ value: schoolLists.governorate })
      .from(schoolLists)
      .orderBy(asc(schoolLists.governorate));

    const schoolTypes = await db
      .selectDistinct({ value: schoolLists.schoolType })
      .from(schoolLists)
      .where(sql`${schoolLists.schoolType} IS NOT NULL`)
      .orderBy(asc(schoolLists.schoolType));

    const academicSystems = await db
      .selectDistinct({ value: schoolLists.academicSystem })
      .from(schoolLists)
      .where(sql`${schoolLists.academicSystem} IS NOT NULL`)
      .orderBy(asc(schoolLists.academicSystem));

    return {
      governorates: governorates.map((g: any) => g.value).filter(Boolean) as string[],
      schoolTypes: schoolTypes.map((t: any) => t.value).filter(Boolean) as string[],
      academicSystems: academicSystems.map((s: any) => s.value).filter(Boolean) as string[],
    };
  }
}
