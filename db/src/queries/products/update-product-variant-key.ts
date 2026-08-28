import { eq } from 'drizzle-orm';
import { db } from '../../connection';
import { productVariants } from '../../schema';

export async function updateProductVariantKey(variantId: number, variantKey: string): Promise<void> {
  await db.update(productVariants).set({ variantKey }).where(eq(productVariants.id, variantId));
}