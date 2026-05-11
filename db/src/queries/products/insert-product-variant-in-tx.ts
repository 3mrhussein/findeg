import type { Db } from '../../connection';
import {
  attributes as attributeTable,
  productVariants,
  variantAttributes,
  variantImages,
} from '../../schema';
import { eq } from 'drizzle-orm';

type DbTransaction = Parameters<Parameters<Db['transaction']>[0]>[0];
type ProductVariantInsert = typeof productVariants.$inferInsert;

export interface InsertProductVariantImageInput {
  url: string;
  alt?: string;
  displayOrder: number;
}

export interface InsertProductVariantAttributeInput {
  attributeKey: string;
  value: string;
}

export interface InsertProductVariantInput {
  sku: string;
  localizedLabel: { en: string; ar: string };
  isDefault: boolean;
  isActive: boolean;
  basePrice: number;
  strikePrice?: number | null;
  costPrice?: number | null;
  weightGrams?: number | null;
  barcode?: string | null;
  mediaSet?: ProductVariantInsert['mediaSet'];
  images: InsertProductVariantImageInput[];
  attributes: InsertProductVariantAttributeInput[];
}

export async function insertProductVariantInTx(
  tx: DbTransaction,
  productId: number,
  variant: InsertProductVariantInput,
  displayOrder: number,
): Promise<number> {
  const [row] = await tx
    .insert(productVariants)
    .values({
      productId,
      sku: variant.sku.toUpperCase(),
      variantKey:
        variant.attributes
          ?.sort((a, b) => a.attributeKey.localeCompare(b.attributeKey))
          .map((a) => a.value.toLowerCase())
          .join('-') || 'default',
      localizedLabel: variant.localizedLabel ?? { en: '', ar: '' },
      sortOrder: displayOrder,
      isDefault: variant.isDefault || false,
      mediaSet: variant.mediaSet,
      isActive: variant.isActive ?? true,
      basePrice: String(variant.basePrice),
      strikePrice: variant.strikePrice != null ? String(variant.strikePrice) : null,
      costPrice: variant.costPrice != null ? String(variant.costPrice) : null,
      weightGrams: variant.weightGrams ?? null,
      barcode: variant.barcode ?? null,
    })
    .returning({ id: productVariants.id });

  const variantId = row.id;

  if (variant.images?.length) {
    await tx.insert(variantImages).values(
      variant.images.map((image) => ({
        variantId,
        url: image.url,
        alt: image.alt ?? null,
        displayOrder: image.displayOrder,
      })),
    );
  }

  if (variant.attributes?.length) {
    for (const attribute of variant.attributes) {
      const [attributeDefinition] = await tx
        .select({ id: attributeTable.id })
        .from(attributeTable)
        .where(eq(attributeTable.key, attribute.attributeKey))
        .limit(1);

      if (attributeDefinition) {
        await tx.insert(variantAttributes).values({
          variantId,
          attributeId: attributeDefinition.id,
          valueText: attribute.value,
        });
      }
    }
  }

  return variantId;
}