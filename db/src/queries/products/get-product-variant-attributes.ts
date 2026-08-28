import { eq } from 'drizzle-orm';
import { db } from '../../connection';
import { attributes as attributeTable, productVariants, variantAttributes } from '../../schema';

export interface ProductVariantAttributeRow {
  variantId: number;
  key: string;
  valueText: string | null;
}

export async function getProductVariantAttributes(
  productId: number,
): Promise<ProductVariantAttributeRow[]> {
  return db
    .select({
      variantId: productVariants.id,
      key: attributeTable.key,
      valueText: variantAttributes.valueText,
    })
    .from(productVariants)
    .innerJoin(variantAttributes, eq(variantAttributes.variantId, productVariants.id))
    .innerJoin(attributeTable, eq(variantAttributes.attributeId, attributeTable.id))
    .where(eq(productVariants.productId, productId));
}