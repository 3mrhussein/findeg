import { eq } from 'drizzle-orm';
import { db } from '../../connection';
import { products, productVariants, variantImages } from '../../schema';

export async function duplicateProductWithVariants(id: number): Promise<{ newId: number }> {
  const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = existing[0];

  if (!product) {
    throw new Error(`Product ${id} not found`);
  }

  const allVariants = await db.select().from(productVariants).where(eq(productVariants.productId, id));

  return db.transaction(async (tx) => {
    const localizedName = product.localizedName as Record<'en' | 'ar', string>;

    const [newSpu] = await tx
      .insert(products)
      .values({
        localizedName: {
          en: `${localizedName.en} (Copy)`,
          ar: `${localizedName.ar} (نسخة)`,
        },
        localizedDescription: product.localizedDescription,
        localizedLongDescription: product.localizedLongDescription,
        slug: `${product.slug}-copy`,
        categoryId: product.categoryId,
        brandId: product.brandId,
        isActive: false,
      })
      .returning({ id: products.id });

    for (const variant of allVariants) {
      const [newVariant] = await tx
        .insert(productVariants)
        .values({
          productId: newSpu.id,
          sku: `${variant.sku}-copy`,
          variantKey: variant.variantKey,
          localizedLabel: variant.localizedLabel as Record<string, string>,
          isDefault: variant.isDefault,
          mediaSet: variant.mediaSet,
          isActive: variant.isActive,
          basePrice: variant.basePrice,
          strikePrice: variant.strikePrice,
          costPrice: variant.costPrice,
          weightGrams: variant.weightGrams,
          barcode: variant.barcode,
          sortOrder: variant.sortOrder,
        })
        .returning({ id: productVariants.id });

      const images = await tx.select().from(variantImages).where(eq(variantImages.variantId, variant.id));
      if (images.length) {
        await tx.insert(variantImages).values(
          images.map((image) => ({
            variantId: newVariant.id,
            url: image.url,
            alt: image.alt,
            displayOrder: image.displayOrder,
          })),
        );
      }
    }

    return { newId: newSpu.id };
  });
}