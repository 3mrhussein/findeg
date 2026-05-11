import { db } from '../../connection';
import { productVariants } from '../../schema';
import { eq } from 'drizzle-orm';

export async function deactivateProductVariant(variantId: number): Promise<void> {
  await db.update(productVariants).set({ isActive: false }).where(eq(productVariants.id, variantId));
}