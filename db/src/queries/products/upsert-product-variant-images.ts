import { db } from '../../connection';
import { variantImages } from '../../schema';
import { eq } from 'drizzle-orm';
import type { InsertProductVariantImageInput } from './insert-product-variant-in-tx';

export async function upsertProductVariantImages(
  variantId: number,
  images: InsertProductVariantImageInput[],
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(variantImages).where(eq(variantImages.variantId, variantId));
    if (images.length) {
      await tx.insert(variantImages).values(
        images.map((image) => ({
          variantId,
          url: image.url,
          alt: image.alt ?? null,
          displayOrder: image.displayOrder,
        })),
      );
    }
  });
}