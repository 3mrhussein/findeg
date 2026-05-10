import type { TranslationMap } from '../../../core/domain/value-objects';

export type PricingMode = 'shared' | 'per-variant';

export interface ImageInput {
  url: string;
  alt?: string;
  displayOrder: number;
}


export interface VariantAttributeInput {
  attributeKey: string;
  value: string;
}

export interface CreateVariantInput {
  sku: string;
  localizedLabel: { en: string; ar: string };
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  basePrice: number;
  strikePrice?: number | null;
  costPrice?: number | null;
  weightGrams?: number | null;
  barcode?: string | null;
  mediaSet?: any;
  images: ImageInput[];
  attributes: VariantAttributeInput[];
}

export interface UpdateVariantInput extends Partial<CreateVariantInput> {
  id: number;
}

export interface CreateProductWithVariantsInput {
  // Product shell
  localizedName: TranslationMap;
  localizedDescription?: TranslationMap;
  localizedLongDescription?: TranslationMap;
  slug?: string;
  categoryId?: number | null;
  brandId?: number | null;
  tagIds: number[];
  isActive: boolean;

  // Pricing mode
  pricingMode: PricingMode;

  // Shared pricing (used when pricingMode = "shared")
  sharedBasePrice?: number;
  sharedStrikePrice?: number | null;
  sharedCostPrice?: number | null;


  // Variants
  variants: CreateVariantInput[];
}

export interface UpdateProductWithVariantsInput extends Partial<
  Omit<CreateProductWithVariantsInput, 'variants'>
> {
  variants?: (UpdateVariantInput | CreateVariantInput)[];
  variantsToDelete?: number[];
  variantsToDeactivate?: number[];
}
