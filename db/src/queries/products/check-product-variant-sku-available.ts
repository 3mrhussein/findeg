import { db } from '../../connection';
import { productVariants } from '../../schema';
import { and, eq, ne } from 'drizzle-orm';

export async function checkProductVariantSkuAvailable(
  sku: string,
  excludeVariantId?: number,
): Promise<boolean> {
  const rows = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(
      excludeVariantId
        ? and(eq(productVariants.sku, sku), ne(productVariants.id, excludeVariantId))
        : eq(productVariants.sku, sku),
    )
    .limit(1);

  return rows.length === 0;
}