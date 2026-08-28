import { db } from '../../connection';
import { products } from '../../schema';
import { and, eq, ne } from 'drizzle-orm';

export async function checkProductSlugAvailable(
  slug: string,
  excludeProductId?: number,
): Promise<boolean> {
  const condition = excludeProductId
    ? and(eq(products.slug, slug), ne(products.id, excludeProductId))
    : eq(products.slug, slug);

  const [existing] = await db.select({ id: products.id }).from(products).where(condition).limit(1);

  return !existing;
}