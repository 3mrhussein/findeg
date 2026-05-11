import { and, count, eq, ne } from 'drizzle-orm';

import { db } from '../../connection';
import { productTags, tags } from '../../schema';

export async function checkTagSlugAvailableRaw(
  slug: string,
  excludeId?: number,
): Promise<boolean> {
  const where = excludeId
    ? and(eq(tags.slug, slug), ne(tags.id, excludeId))
    : eq(tags.slug, slug);

  const [result] = await db.select({ value: count() }).from(tags).where(where);

  return Number(result?.value ?? 0) === 0;
}

export async function getTagProductCountRaw(tagId: number): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(productTags)
    .where(eq(productTags.tagId, tagId));

  return Number(result?.value ?? 0);
}
