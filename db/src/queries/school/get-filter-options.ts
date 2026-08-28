import { asc, sql } from 'drizzle-orm';

import { db } from '../../connection';
import { schoolLists } from '../../schema';

export interface SchoolFilterOptionsRaw {
  governorates: Array<{ value: string | null }>;
  schoolTypes: Array<{ value: string | null }>;
  academicSystems: Array<{ value: string | null }>;
}

export async function getSchoolFilterOptionsRaw(): Promise<SchoolFilterOptionsRaw> {
  const [governorates, schoolTypes, academicSystems] = await Promise.all([
    db
      .selectDistinct({ value: schoolLists.governorate })
      .from(schoolLists)
      .orderBy(asc(schoolLists.governorate)),
    db
      .selectDistinct({ value: schoolLists.schoolType })
      .from(schoolLists)
      .where(sql`${schoolLists.schoolType} IS NOT NULL`)
      .orderBy(asc(schoolLists.schoolType)),
    db
      .selectDistinct({ value: schoolLists.academicSystem })
      .from(schoolLists)
      .where(sql`${schoolLists.academicSystem} IS NOT NULL`)
      .orderBy(asc(schoolLists.academicSystem)),
  ]);

  return {
    governorates,
    schoolTypes,
    academicSystems,
  };
}