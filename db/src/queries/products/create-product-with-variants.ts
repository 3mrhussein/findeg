import { db } from '../../connection';
import { products, productTags } from '../../schema';
import type { InsertProductVariantInput } from './insert-product-variant-in-tx';
import { insertProductVariantInTx } from './insert-product-variant-in-tx';

type ProductInsert = typeof products.$inferInsert;

interface CreateVariantMutationInput extends InsertProductVariantInput {
  sortOrder?: number;
}

export interface CreateProductWithVariantsDbInput {
  localizedName: NonNullable<ProductInsert['localizedName']>;
  localizedDescription?: ProductInsert['localizedDescription'];
  localizedLongDescription?: ProductInsert['localizedLongDescription'];
  slug?: string | null;
  categoryId?: number | null;
  brandId?: number | null;
  tagIds: number[];
  isActive: boolean;
  pricingMode: 'shared' | 'per-variant';
  sharedBasePrice?: number;
  sharedStrikePrice?: number | null;
  sharedCostPrice?: number | null;
  variants: CreateVariantMutationInput[];
}

export async function createProductWithVariantsInDb(
  input: CreateProductWithVariantsDbInput,
): Promise<number> {
  return db.transaction(async (tx) => {
    const [newProduct] = await tx
      .insert(products)
      .values({
        localizedName: input.localizedName,
        localizedDescription: input.localizedDescription ?? { en: '' },
        localizedLongDescription: input.localizedLongDescription ?? { en: '' },
        slug: input.slug ?? null,
        categoryId: input.categoryId ?? null,
        brandId: input.brandId ?? null,
        isActive: input.isActive,
      })
      .returning({ id: products.id });

    const productId = newProduct.id;

    if (input.tagIds.length) {
      await tx.insert(productTags).values(input.tagIds.map((tagId) => ({ productId, tagId })));
    }

    const variants =
      input.pricingMode === 'shared'
        ? input.variants.map((variant) => ({
            ...variant,
            basePrice: input.sharedBasePrice ?? variant.basePrice,
            strikePrice: input.sharedStrikePrice ?? variant.strikePrice ?? null,
            costPrice: input.sharedCostPrice ?? variant.costPrice ?? null,
          }))
        : input.variants;

    for (let index = 0; index < variants.length; index++) {
      await insertProductVariantInTx(tx, productId, variants[index], index);
    }

    return productId;
  });
}