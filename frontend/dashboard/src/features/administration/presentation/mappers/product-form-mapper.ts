import type { Product } from "@backend/features/catalog";
import type { ProductFormValues } from "../forms/product-form";
import { ProductEntity } from "@backend/features/catalog";

/**
 * Transforms a Product domain object into the shape expected
 * by the admin ProductForm component.
 *
 * This is the SINGLE SOURCE OF TRUTH for this transformation.
 */
export function toProductFormValues(product: Product): Partial<ProductFormValues> {
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1;
  const firstVariant = product.variants?.[0];

  const entity = new ProductEntity(product);

  const initialData: Partial<ProductFormValues> = {
    isActive: product.isActive ?? true,
    categoryId: product.categoryId ?? null,
    brandId: product.brandId ?? null,
    sku: product.skuPrefix ?? undefined,
    pricingMode: hasMultipleVariants ? "per-variant" : "shared",
    uomSharingMode: "shared",
    // If only one variant, lift its pricing to the SPU level for shared pricing fallback
    sharedBasePrice:
      !hasMultipleVariants && firstVariant
        ? typeof firstVariant.basePrice === "string"
          ? parseFloat(firstVariant.basePrice)
          : (firstVariant.basePrice ?? 0)
        : undefined,
    sharedStrikePrice:
      !hasMultipleVariants && firstVariant?.strikePrice != null
        ? parseFloat(String(firstVariant.strikePrice))
        : null,
    sharedCostPrice:
      !hasMultipleVariants && firstVariant?.costPrice != null
        ? parseFloat(String(firstVariant.costPrice))
        : null,
    variants: product.variants?.length
      ? product.variants.map((v, idx) => ({
          id: v.id,
          sku: v.sku,
          localizedLabel: v.localizedLabel ?? { en: "", ar: "" },
          displayOrder: idx,
          isActive: v.isActive ?? true,
          basePrice: typeof v.basePrice === "string" ? parseFloat(v.basePrice) : (v.basePrice ?? 0),
          strikePrice: v.strikePrice != null ? parseFloat(String(v.strikePrice)) : null,
          costPrice: v.costPrice != null ? parseFloat(String(v.costPrice)) : null,
          weightGrams: v.weightGrams != null ? Math.round(v.weightGrams * 1000) : null,
          barcode: v.barcode ?? null,
          lowStockThreshold: v.lowStockThreshold ?? 10,
          images: (v.images ?? []).map((img, i) => ({
            url: img.url,
            alt: img.alt ?? "",
            displayOrder: img.displayOrder ?? i,
          })),
          attributes: (v.attributes ?? []).map((a) => ({
            attributeKey: String(a.attributeId),
            value: a.valueText ?? "",
            isVariantDefining: false,
          })),
          uoms: (v.sellableUoms ?? []).map((u: any) => ({
            uomCode: u.uomCode,
            factorToBase: u.factorToBase,
            localizedLabel: u.localizedLabel ?? { en: "", ar: "" },
            barcode: u.barcode ?? "",
            isEnabled: u.isEnabled ?? true,
            priceLists: (u.priceLists ?? []).map((pl: any) => ({
              customerGroup: pl.customerGroup as "public_b2c" | "school_b2b",
              uomCode: u.uomCode,
              unitPrice:
                typeof pl.unitPrice === "string" ? parseFloat(pl.unitPrice) : (pl.unitPrice ?? 0),
              minQty: pl.minQty ?? 1,
              isSellable: pl.isSellable ?? true,
            })),
          })),
        }))
      : undefined,
  };

  // Map localized fields directly from JSONB via the entity methods
  const fallbackName = product.skuPrefix || "";

  initialData.localizedName = {
    en: entity.getName("en") || fallbackName,
    ar: entity.getName("ar") || fallbackName,
  };
  initialData.localizedDescription = {
    en: entity.getDescription("en") ?? "",
    ar: entity.getDescription("ar") ?? "",
  };
  initialData.localizedLongDescription = {
    en: entity.getLongDescription("en") ?? "",
    ar: entity.getLongDescription("ar") ?? "",
  };
  initialData.localizedSlug = {
    en: entity.getSlug("en") ?? "",
    ar: entity.getSlug("ar") ?? "",
  };

  return initialData;
}
