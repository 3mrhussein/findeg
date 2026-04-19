import type { UoMCode, CustomerGroup } from "../../../catalog/domain/types/UoMTypes";

export type PricingMode = "shared" | "per-variant";
export type UoMSharingMode = "shared" | "per-variant";

export interface ImageInput {
  url: string;
  alt?: string;
  displayOrder: number;
}

export interface PriceListRowInput {
  customerGroup: CustomerGroup;
  uomCode: UoMCode;
  unitPrice: number;
  minQty: number;
  isSellable: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

export interface UoMInput {
  uomCode: UoMCode;
  factorToBase: number;
  localizedLabel: { en: string; ar: string };
  barcode?: string;
  isEnabled: boolean;
  priceLists: PriceListRowInput[];
}

export interface VariantAttributeInput {
  attributeKey: string;
  value: string;
  isVariantDefining: boolean;
}

export interface CreateVariantInput {
  sku: string;
  localizedLabel: { en: string; ar: string };
  displayOrder: number;
  isActive: boolean;
  basePrice: number;
  strikePrice?: number | null;
  costPrice?: number | null;
  weightGrams?: number | null;
  barcode?: string | null;
  lowStockThreshold?: number | null;
  images: ImageInput[];
  attributes: VariantAttributeInput[];
  uoms: UoMInput[];
}

export interface UpdateVariantInput extends Partial<CreateVariantInput> {
  id: number;
}

export interface CreateProductWithVariantsInput {
  // Product shell
  localizedName: { en: string; ar: string };
  localizedDescription?: { en: string; ar: string };
  localizedLongDescription?: { en: string; ar: string };
  localizedSlug?: { en: string; ar: string };
  categoryId?: number | null;
  brandId?: number | null;
  tagIds: number[];
  isActive: boolean;
  sku?: string;

  // Pricing mode
  pricingMode: PricingMode;
  uomSharingMode: UoMSharingMode;

  // Shared pricing (used when pricingMode = "shared")
  sharedBasePrice?: number;
  sharedStrikePrice?: number | null;
  sharedCostPrice?: number | null;

  // Shared UoMs (used when uomSharingMode = "shared")
  sharedUoMs?: UoMInput[];

  // Variants
  variants: CreateVariantInput[];
}

export interface UpdateProductWithVariantsInput extends Partial<
  Omit<CreateProductWithVariantsInput, "variants">
> {
  variants?: (UpdateVariantInput | CreateVariantInput)[];
  variantsToDelete?: number[];
  variantsToDeactivate?: number[];
}
