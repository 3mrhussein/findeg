import { and, asc, desc, eq, exists, ilike, or, sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { businessPartners, partnerSchoolProfiles, schoolSupplyLists } from '../../schema';
import type { SchoolSupplyListExecutor } from '../school-supply-lists';

/**
 * Partner School directory: active Business Partners that have a school profile,
 * with their published School Supply Lists. Like the other partner queries these
 * never import `connection.ts`: callers pass the executor.
 */

export interface SearchPartnerSchoolsParams {
  /** Case-insensitive match on either the English or the Arabic name. */
  query?: string;
  governorate?: string;
  schoolType?: string;
  academicSystem?: string;
  /** Only schools with at least one published list. */
  withPublishedLists?: boolean;
  limit: number;
  offset: number;
}

export interface PartnerSchoolRow {
  code: string;
  nameEn: string;
  nameAr: string;
  governorate: string | null;
  area: string | null;
  schoolType: string | null;
  academicSystem: string | null;
  logoUrl: string | null;
}

export interface PartnerSchoolSearchRow extends PartnerSchoolRow {
  publishedListCount: number;
}

export interface PartnerSchoolFilterOptionsRow {
  governorates: string[];
  schoolTypes: string[];
  academicSystems: string[];
}

export interface PublishedListRow {
  grade: string;
  academicYear: string;
  localizedTitle: typeof schoolSupplyLists.$inferSelect.localizedTitle;
  localizedDescription: typeof schoolSupplyLists.$inferSelect.localizedDescription;
  heroImageUrl: string | null;
  publicCode: string;
}

const isActivePartnerSchool = eq(businessPartners.status, 'active');

const publishedListCount = sql<number>`(
  select count(*) from ${schoolSupplyLists}
  where ${schoolSupplyLists.businessPartnerId} = ${businessPartners.id}
    and ${schoolSupplyLists.status} = 'published'
)`.mapWith(Number);

const schoolColumns = {
  code: businessPartners.code,
  nameEn: businessPartners.nameEn,
  nameAr: businessPartners.nameAr,
  governorate: partnerSchoolProfiles.governorate,
  area: partnerSchoolProfiles.area,
  schoolType: partnerSchoolProfiles.schoolType,
  academicSystem: partnerSchoolProfiles.academicSystem,
  logoUrl: partnerSchoolProfiles.logoUrl,
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function directoryFilter(params: Omit<SearchPartnerSchoolsParams, 'limit' | 'offset'>) {
  const conditions: (SQL | undefined)[] = [isActivePartnerSchool];
  if (params.query) {
    const pattern = `%${escapeLike(params.query)}%`;
    conditions.push(
      or(ilike(businessPartners.nameEn, pattern), ilike(businessPartners.nameAr, pattern)),
    );
  }
  if (params.governorate) {
    conditions.push(eq(partnerSchoolProfiles.governorate, params.governorate));
  }
  if (params.schoolType) conditions.push(eq(partnerSchoolProfiles.schoolType, params.schoolType));
  if (params.academicSystem) {
    conditions.push(eq(partnerSchoolProfiles.academicSystem, params.academicSystem));
  }
  if (params.withPublishedLists) {
    conditions.push(
      exists(
        sql`(select 1 from ${schoolSupplyLists}
          where ${schoolSupplyLists.businessPartnerId} = ${businessPartners.id}
            and ${schoolSupplyLists.status} = 'published')`,
      ),
    );
  }
  return and(...conditions);
}

/** One page of active Partner Schools sorted by English name, and the total match count. */
export async function searchPartnerSchools(
  executor: SchoolSupplyListExecutor,
  { limit, offset, ...filter }: SearchPartnerSchoolsParams,
): Promise<{ items: PartnerSchoolSearchRow[]; totalCount: number }> {
  const where = directoryFilter(filter);
  const items = await executor
    .select({ ...schoolColumns, publishedListCount })
    .from(businessPartners)
    .innerJoin(
      partnerSchoolProfiles,
      eq(partnerSchoolProfiles.businessPartnerId, businessPartners.id),
    )
    .where(where)
    .orderBy(asc(businessPartners.nameEn), asc(businessPartners.id))
    .limit(limit)
    .offset(offset);
  const [{ total }] = await executor
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(businessPartners)
    .innerJoin(
      partnerSchoolProfiles,
      eq(partnerSchoolProfiles.businessPartnerId, businessPartners.id),
    )
    .where(where);
  return { items, totalCount: total };
}

/** Distinct, sorted filter values of active Partner School profiles. */
export async function getPartnerSchoolFilterOptions(
  executor: SchoolSupplyListExecutor,
): Promise<PartnerSchoolFilterOptionsRow> {
  const distinct = async (column: AnyPgColumn) => {
    const rows = await executor
      .selectDistinct({ value: column })
      .from(partnerSchoolProfiles)
      .innerJoin(businessPartners, eq(businessPartners.id, partnerSchoolProfiles.businessPartnerId))
      .where(and(isActivePartnerSchool, sql`${column} is not null`))
      .orderBy(asc(column));
    return rows.flatMap((row) => (row.value === null ? [] : [row.value]));
  };
  const [governorates, schoolTypes, academicSystems] = await Promise.all([
    distinct(partnerSchoolProfiles.governorate),
    distinct(partnerSchoolProfiles.schoolType),
    distinct(partnerSchoolProfiles.academicSystem),
  ]);
  return { governorates, schoolTypes, academicSystems };
}

/** An active Partner School by its Business Partner code, with its published lists only. */
export async function getPartnerSchoolByCode(
  executor: SchoolSupplyListExecutor,
  code: string,
): Promise<(PartnerSchoolRow & { lists: PublishedListRow[] }) | null> {
  const [school] = await executor
    .select({ id: businessPartners.id, ...schoolColumns })
    .from(businessPartners)
    .innerJoin(
      partnerSchoolProfiles,
      eq(partnerSchoolProfiles.businessPartnerId, businessPartners.id),
    )
    .where(and(isActivePartnerSchool, eq(businessPartners.code, code)))
    .limit(1);
  if (!school) return null;

  const rows = await executor
    .select({
      grade: schoolSupplyLists.grade,
      academicYear: schoolSupplyLists.academicYear,
      localizedTitle: schoolSupplyLists.localizedTitle,
      localizedDescription: schoolSupplyLists.localizedDescription,
      heroImageUrl: schoolSupplyLists.heroImageUrl,
      publicCode: schoolSupplyLists.publicCode,
    })
    .from(schoolSupplyLists)
    .where(
      and(
        eq(schoolSupplyLists.businessPartnerId, school.id),
        eq(schoolSupplyLists.status, 'published'),
      ),
    )
    .orderBy(
      desc(schoolSupplyLists.academicYear),
      asc(schoolSupplyLists.grade),
      asc(schoolSupplyLists.id),
    );

  const profile: PartnerSchoolRow = {
    code: school.code,
    nameEn: school.nameEn,
    nameAr: school.nameAr,
    governorate: school.governorate,
    area: school.area,
    schoolType: school.schoolType,
    academicSystem: school.academicSystem,
    logoUrl: school.logoUrl,
  };
  const lists = rows.flatMap((row) =>
    // The publication check constraint guarantees a published list has a code.
    row.publicCode === null ? [] : [{ ...row, publicCode: row.publicCode }],
  );
  return { ...profile, lists };
}
