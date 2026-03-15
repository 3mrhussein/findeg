/**
 * ProductEditForm — Comprehensive product editing form with tabbed interface
 *
 * Features:
 * - Two-column layout (65% content / 35% sidebar)
 * - Sticky sidebar with metadata and actions
 * - Tab navigation (Info, Variants, Media, Pricing, SEO)
 * - URL-synced tabs for deep linking
 * - Status bar with live/draft indicator
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 * Used by: Edit page (products/[id]/edit/page.tsx)
 */

"use client";

import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ProductFormSidebar } from "../../../_components/ProductFormSidebar";
import { ProductStatusBar } from "./ProductStatusBar";
import { ProductFormTabs, type ProductTab } from "./ProductFormTabs";
import { InfoTab } from "./InfoTab";
import { VariantsTab } from "./VariantsTab";
import { MediaTab } from "./MediaTab";
import { PricingTab } from "./PricingTab";
import { SeoTab } from "./SeoTab";
import type { ProductFormValues } from "@/features/administration/presentation/forms/product-form";
import type { Product } from "@/features/catalog/domain/entities/Product";

interface ProductEditFormProps {
  product: Product;
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  allTags: { id: number; name: string; nameAr?: string; color?: string }[];
  onSubmit: (data: ProductFormValues) => Promise<void>;
}

/**
 * ProductEditForm — Complete product editing interface
 *
 * @example
 * <ProductEditForm
 *   product={product}
 *   categories={categories}
 *   brands={brands}
 *   onSubmit={handleUpdate}
 * />
 */
export function ProductEditForm({
  product,
  categories,
  brands,
  allTags,
  onSubmit,
}: ProductEditFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  // Initialize form with product data
  const methods = useForm<ProductFormValues>({
    defaultValues: {
      sku: product.skuPrefix || "",
      localizedName: {
        en: product.localizedContent?.name?.en || product.name || "",
        ar: product.localizedContent?.name?.ar || "",
      },
      localizedDescription: {
        en: product.localizedContent?.description?.en || product.description || "",
        ar: product.localizedContent?.description?.ar || "",
      },
      localizedLongDescription: {
        en: product.localizedContent?.longDescription?.en || product.longDescription || "",
        ar: product.localizedContent?.longDescription?.ar || "",
      },
      categoryId: product.categoryId || null,
      brandId: product.brandId || null,
      tagIds: (product.tags || []).map((t) => Number(t.id)),
      isActive: product.isActive ?? false,
      pricingMode: "per-variant",
      uomSharingMode: "shared",
      sharedBasePrice: 0,
      sharedStrikePrice: null,
      sharedCostPrice: null,
      sharedUoMs: [],
      variants: (product.variants || []).map((v) => ({
        id: v.id,
        sku: v.sku,
        localizedLabel: (v.localizedLabel as any) || { en: "", ar: "" },
        displayOrder: v.displayOrder,
        isActive: v.isActive,
        basePrice: v.basePrice,
        strikePrice: v.strikePrice ?? null,
        costPrice: v.costPrice ?? null,
        weightGrams: v.weightGrams ?? null,
        barcode: v.barcode ?? null,
        lowStockThreshold: v.lowStockThreshold,
        images: (v.images || []).map((img) => ({
          url: img.url,
          alt: img.alt || "",
          displayOrder: img.displayOrder,
        })),
        attributes: (v.attributes || []).map((a) => ({
          attributeKey: a.key,
          value: a.valueText || String(a.valueNum || ""),
          isVariantDefining: false,
        })),
        uoms: (v.sellableUoms || []).map((u) => ({
          uomCode: u.uomCode,
          factorToBase: u.factorToBase,
          localizedLabel: (u.localizedLabel as any) || { en: "", ar: "" },
          barcode: u.barcode || "",
          isEnabled: u.isEnabled,
          priceLists: [],
        })),
      })),
      localizedSlug: {
        en: product.localizedContent?.slug?.en || "",
        ar: product.localizedContent?.slug?.ar || "",
      },
    },
  });

  const handleFormSubmit = async (data: ProductFormValues) => {
    setIsSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Status Bar */}
        <ProductStatusBar
          productId={product.id}
          slug={product.localizedContent?.slug?.en}
          isActive={product.isActive ?? false}
          updatedAt={product.updatedAt}
        />

        {/* Two-Column Layout: Content (65%) + Sidebar (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Content Area */}
          <div className="space-y-6">
            <ProductFormTabs defaultTab="info">
              {{
                info: <InfoTab categories={categories} brands={brands} />,
                variants: <VariantsTab />,
                media: <MediaTab />,
                pricing: <PricingTab />,
                seo: <SeoTab />,
              }}
            </ProductFormTabs>
          </div>

          {/* Sticky Sidebar */}
          <div>
            <ProductFormSidebar
              product={product}
              categories={categories}
              brands={brands}
              allTags={allTags}
              showSummary
              isSaving={isSaving}
              isNew={false}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
