import { checkCompareAtPrice } from '@findeg/domain/catalog';
import { moneyFromDecimal } from '@findeg/domain/common';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../../connection';
import { products, productTags, productVariants, variantImages } from '../../schema';
import type { InsertProductVariantInput } from './insert-product-variant-in-tx';
import { insertProductVariantInTx } from './insert-product-variant-in-tx';

type LocalizedRecord = Record<string, string>;

type ProductVariantMediaSet = (typeof productVariants.$inferInsert)['mediaSet'];

/** Keep `undefined` (leave column untouched) and `null` (clear it) distinct from a real price. */
function nullablePrice(value: number | null | undefined): string | null | undefined {
  return value == null ? value : String(value);
}

interface UpdateVariantMutationInput {
  id: number;
  sku?: string;
  localizedLabel?: LocalizedRecord;
  sortOrder?: number;
  isDefault?: boolean;
  isActive?: boolean;
  basePrice?: number;
  strikePrice?: number | null;
  costPrice?: number | null;
  weightGrams?: number | null;
  barcode?: string | null;
  mediaSet?: ProductVariantMediaSet;
  images?: Array<{
    url: string;
    alt?: string;
    displayOrder: number;
  }>;
  attributes?: Array<{
    attributeKey: string;
    value: string;
  }>;
}

interface CreateVariantMutationInput extends InsertProductVariantInput {
  sortOrder?: number;
}

export interface UpdateProductWithVariantsDbInput {
  localizedName?: LocalizedRecord;
  localizedDescription?: LocalizedRecord;
  localizedLongDescription?: LocalizedRecord;
  slug?: string | null;
  categoryId?: number | null;
  brandId?: number | null;
  tagIds?: number[];
  isActive?: boolean;
  variants?: Array<UpdateVariantMutationInput | CreateVariantMutationInput>;
  variantsToDelete?: number[];
  variantsToDeactivate?: number[];
}

export async function updateProductWithVariantsInDb(
  productId: number,
  input: UpdateProductWithVariantsDbInput,
): Promise<void> {
  await db.transaction(async (tx) => {
    const spuUpdate: Record<string, unknown> = {};
    if (input.localizedName !== undefined) spuUpdate.localizedName = input.localizedName;
    if (input.localizedDescription !== undefined)
      spuUpdate.localizedDescription = input.localizedDescription;
    if (input.localizedLongDescription !== undefined) {
      spuUpdate.localizedLongDescription = input.localizedLongDescription;
    }
    if (input.slug !== undefined) spuUpdate.slug = input.slug;
    if (input.categoryId !== undefined) spuUpdate.categoryId = input.categoryId;
    if (input.brandId !== undefined) spuUpdate.brandId = input.brandId;
    if (input.isActive !== undefined) spuUpdate.isActive = input.isActive;

    if (Object.keys(spuUpdate).length > 0) {
      await tx.update(products).set(spuUpdate).where(eq(products.id, productId));
    }

    if (input.tagIds !== undefined) {
      await tx.delete(productTags).where(eq(productTags.productId, productId));
      if (input.tagIds.length) {
        await tx.insert(productTags).values(input.tagIds.map((tagId) => ({ productId, tagId })));
      }
    }

    if (input.variantsToDeactivate?.length) {
      await tx
        .update(productVariants)
        .set({ isActive: false })
        .where(inArray(productVariants.id, input.variantsToDeactivate));
    }

    if (input.variantsToDelete?.length) {
      await tx.delete(productVariants).where(inArray(productVariants.id, input.variantsToDelete));
    }

    // Acquire price locks in a stable order before checking or writing any variant.
    const priceUpdateIds = (input.variants ?? []).flatMap((variant) =>
      'id' in variant && (variant.basePrice !== undefined || variant.strikePrice !== undefined)
        ? [variant.id]
        : [],
    );
    const priceRows = priceUpdateIds.length
      ? await tx
          .select()
          .from(productVariants)
          .where(inArray(productVariants.id, priceUpdateIds))
          .orderBy(productVariants.id)
          .for('update')
      : [];
    const persistedPrices = new Map(priceRows.map((row) => [row.id, row]));

    for (const variant of input.variants ?? []) {
      if ('id' in variant) {
        const current = persistedPrices.get(variant.id);
        if (current) {
          const basePrice =
            variant.basePrice === undefined ? current.basePrice : variant.basePrice.toFixed(2);
          const strikePrice =
            variant.strikePrice === undefined
              ? current.strikePrice
              : variant.strikePrice === null
                ? null
                : variant.strikePrice.toFixed(2);
          checkCompareAtPrice(
            moneyFromDecimal(basePrice),
            strikePrice === null ? null : moneyFromDecimal(strikePrice),
          );
        }
        if (current) {
          persistedPrices.set(variant.id, {
            ...current,
            basePrice:
              variant.basePrice === undefined ? current.basePrice : variant.basePrice.toFixed(2),
            strikePrice:
              variant.strikePrice === undefined
                ? current.strikePrice
                : nullablePrice(variant.strikePrice)!,
          });
        }
        await tx
          .update(productVariants)
          .set({
            sku: variant.sku,
            localizedLabel: variant.localizedLabel,
            isActive: variant.isActive,
            isDefault: variant.isDefault,
            mediaSet: variant.mediaSet,
            basePrice: variant.basePrice !== undefined ? String(variant.basePrice) : undefined,
            strikePrice: nullablePrice(variant.strikePrice),
            costPrice: nullablePrice(variant.costPrice),
            weightGrams: variant.weightGrams ?? null,
            barcode: variant.barcode ?? null,
            sortOrder: variant.sortOrder,
          })
          .where(eq(productVariants.id, variant.id));

        if (variant.images !== undefined) {
          await tx.delete(variantImages).where(eq(variantImages.variantId, variant.id));
          if (variant.images.length) {
            await tx.insert(variantImages).values(
              variant.images.map((image) => ({
                variantId: variant.id as number,
                url: image.url,
                alt: image.alt ?? null,
                displayOrder: image.displayOrder,
              })),
            );
          }
        }
      } else {
        await insertProductVariantInTx(tx, productId, variant, variant.sortOrder ?? 0);
      }
    }
  });
}
