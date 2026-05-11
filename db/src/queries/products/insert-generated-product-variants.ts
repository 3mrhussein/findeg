import { eq } from 'drizzle-orm';
import { db } from '../../connection';
import { attributes as attributeTable, productVariants, variantAttributes } from '../../schema';

export interface GeneratedVariantAttributeInput {
  attributeKey: string;
  value: string;
}

export interface GeneratedProductVariantInput {
  sku: string;
  variantKey: string;
  localizedLabel: { en: string; ar: string };
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  basePrice: number;
  strikePrice?: number | null;
  costPrice?: number | null;
  weightGrams?: number | null;
  barcode?: string | null;
  attributes: GeneratedVariantAttributeInput[];
}

export async function insertGeneratedProductVariants(
  productId: number,
  variants: GeneratedProductVariantInput[],
): Promise<number[]> {
  const newIds: number[] = [];

  await db.transaction(async (tx) => {
    for (const variant of variants) {
      const [row] = await tx
        .insert(productVariants)
        .values({
          productId,
          sku: variant.sku,
          variantKey: variant.variantKey,
          localizedLabel: variant.localizedLabel,
          sortOrder: variant.sortOrder,
          isDefault: variant.isDefault,
          isActive: variant.isActive,
          basePrice: String(variant.basePrice),
          strikePrice: variant.strikePrice ? String(variant.strikePrice) : null,
          costPrice: variant.costPrice ? String(variant.costPrice) : null,
          weightGrams: variant.weightGrams ?? null,
          barcode: variant.barcode ?? null,
        })
        .returning({ id: productVariants.id });

      newIds.push(row.id);

      for (const attribute of variant.attributes) {
        const [attributeDefinition] = await tx
          .select({ id: attributeTable.id })
          .from(attributeTable)
          .where(eq(attributeTable.key, attribute.attributeKey))
          .limit(1);

        if (attributeDefinition) {
          await tx.insert(variantAttributes).values({
            variantId: row.id,
            attributeId: attributeDefinition.id,
            valueText: attribute.value,
          });
        }
      }
    }
  });

  return newIds;
}