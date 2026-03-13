import { getServices } from "@/server/getServices";
import { ProductForm } from "@/features/administration/presentation/components/catalog/ProductForm";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/features/core/domain/value-objects";
import type { ProductFormValues } from "@/features/administration/presentation/components/catalog/ProductForm/types";

/**
 * /admin/products/[id]/edit
 * Edit an existing product with the redesigned ProductForm.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const resolvedLocale = resolveLocale(locale);
  const { adminProduct, categories, adminBrand } = getServices();
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const [categoriesRaw, brandsRaw, product] = await Promise.all([
    categories.getAll(resolvedLocale),
    adminBrand.getAll(),
    adminProduct.getByIdWithTranslations(productId),
  ]);

  if (!product) notFound();

  const mappedCategories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));
  const mappedBrands = brandsRaw.map((b) => ({ id: b.id, name: b.name }));

  // Map ProductInput → ProductFormValues for pre-population
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1;
  const firstVariant = product.variants?.[0];

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
          id: (v as unknown as Record<string, number>).id,
          sku: v.sku,
          localizedLabel: v.localizedLabel ?? { en: "", ar: "" },
          displayOrder: idx,
          isActive: v.isActive ?? true,
          basePrice: typeof v.basePrice === "string" ? parseFloat(v.basePrice) : (v.basePrice ?? 0),
          strikePrice: v.strikePrice != null ? parseFloat(String(v.strikePrice)) : null,
          costPrice: v.costPrice != null ? parseFloat(String(v.costPrice)) : null,
          weightGrams: v.weightGrams != null ? Math.round(v.weightGrams * 1000) : null, // Assuming weightGrams is coming from some source
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
          uoms: ((v as any).sellableUoms ?? []).map((u: any) => ({
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

  // Map localized fields from translations
  const translations = product.translations ?? [];
  const enTrans = translations.find((t) => t.language === "en");
  const arTrans = translations.find((t) => t.language === "ar");

  // Use SKU prefix as fallback for names if translations are missing or names are empty
  const fallbackName = product.skuPrefix || "";

  initialData.localizedName = {
    en: enTrans?.name || fallbackName,
    ar: arTrans?.name || fallbackName,
  };
  initialData.localizedDescription = {
    en: enTrans?.description ?? "",
    ar: arTrans?.description ?? "",
  };
  initialData.localizedLongDescription = {
    en: enTrans?.longDescription ?? "",
    ar: arTrans?.longDescription ?? "",
  };

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Edit Product #{productId}</h1>
          <p className="text-sm text-muted-foreground">
            Modify product details, variants, pricing, and units of measure.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ProductForm
          mode="edit"
          productId={productId}
          initialData={initialData}
          categories={mappedCategories}
          brands={mappedBrands}
        />
      </div>
    </div>
  );
}
