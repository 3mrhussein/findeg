import { asc, desc, ilike } from 'drizzle-orm';

import { db } from '../../connection';
import { schoolLists } from '../../schema';

export async function getSchoolBySlugRaw(slug: string) {
  return db
    .select()
    .from(schoolLists)
    .where(ilike(schoolLists.schoolName, slug.replace(/-/g, ' ')))
    .orderBy(desc(schoolLists.isActive), asc(schoolLists.grade));
}