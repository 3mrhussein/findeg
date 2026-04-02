"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import {
  ProductFormSchema,
  type ProductFormValues,
} from "@/features/administration/presentation/forms/product-form";
import { ProductFormHeader } from "./ProductFormHeader";
import { ProductFormTabs } from "./ProductFormTabs";
import { ProductFormSidebar } from "../ProductFormSidebar";
import { InfoTab } from "./tabs/InfoTab";
import { VariantsTab } from "./tabs/VariantsTab";
import { MediaTab } from "./tabs/MediaTab";
import { PricingTab } from "./tabs/PricingTab";
import { SeoTab } from "./tabs/SeoTab";
import type { ProductEditData } from "@/features/administration/application/interfaces/IAdminProductService";
import type { Category, Brand, Tag } from "@/features/catalog/domain/entities";
import {
  createProductAction,
  updateProductAction,
} from "@/features/administration/application/actions/admin-product-actions";

interface ProductFormProps {
  initialData?: ProductEditData | null;
  categories: Category[];
  brands: Brand[];
  tags: Tag[];
  locale: string;
}

/**
 * Unified Product Create/Edit Form
 */
export function ProductForm({ initialData, categories, brands, tags, locale }: ProductFormProps) {
  const t = useTranslations("Administration.Catalog.Products.Form");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("info");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: (initialData
      ? {
          localizedName: initialData.localizedName ||
            (initialData as any).localizedContent?.name || { en: "", ar: "" },
          localizedDescription: initialData.localizedDescription ||
            (initialData as any).localizedContent?.description || { en: "", ar: "" },
          localizedLongDescription: initialData.localizedLongDescription ||
            (initialData as any).localizedContent?.longDescription || { en: "", ar: "" },
          localizedSlug: initialData.localizedSlug ||
            (initialData as any).localizedContent?.slug || { en: "", ar: "" },
          categoryId: initialData.categoryId,
          brandId: initialData.brandId,
          tagIds: initialData.tags.map((t) => t.id),
          isActive: initialData.isActive,
          skuPrefix: initialData.skuPrefix || undefined,
          pricingMode: (initialData as any).pricingMode || "per-variant",
          uomSharingMode: (initialData as any).uomSharingMode || "shared",
          variants: initialData.variants.map((v) => ({
            sku: v.sku,
            basePrice: Number(v.basePrice),
            isActive: v.isActive,
            displayOrder: v.displayOrder,
            images: v.images.map((img) => ({
              url: img.url,
              alt: img.alt || "",
              displayOrder: img.displayOrder,
            })),
            attributes: v.attributes.map((attr) => ({
              attributeKey: attr.attributeKey,
              value: attr.valueText || "",
              isVariantDefining: true,
            })),
            uoms: v.sellableUoms.map((u) => ({
              uomCode: u.uomCode,
              factorToBase: Number(u.factorToBase),
              localizedLabel: u.localizedLabel,
              isEnabled: u.isEnabled,
              priceLists: u.priceLists.map((pl) => ({
                customerGroup: pl.customerGroup as any,
                uomCode: pl.uomCode,
                unitPrice: Number(pl.unitPrice),
                minQty: pl.minQty,
                isSellable: pl.isSellable,
              })),
            })),
          })),
        }
      : {
          isActive: true,
          localizedName: { en: "", ar: "" },
          localizedDescription: { en: "", ar: "" },
          localizedLongDescription: { en: "", ar: "" },
          localizedSlug: { en: "", ar: "" },
          variants: [
            {
              sku: "",
              localizedLabel: { en: "Standard", ar: "قياسي" },
              basePrice: 0,
              costPrice: 0,
              strikePrice: null,
              weightGrams: null,
              barcode: "",
              lowStockThreshold: 10,
              isActive: true,
              displayOrder: 0,
              images: [],
              attributes: [],
              uoms: [
                {
                  uomCode: "pcs",
                  factorToBase: 1,
                  localizedLabel: { en: "Piece", ar: "قطعة" },
                  isEnabled: true,
                  priceLists: [
                    {
                      customerGroup: "public_b2c" as const,
                      uomCode: "pcs",
                      unitPrice: 0,
                      minQty: 1,
                      isSellable: true,
                    },
                  ],
                },
              ],
            },
          ],
          pricingMode: "per-variant",
          uomSharingMode: "shared",
          tagIds: [],
        }) as any,
    mode: "onChange",
  });

  const onSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      const result = initialData
        ? await updateProductAction(initialData.id, values)
        : await createProductAction(values);

      if (result.success) {
        toast.success(initialData ? t("updated") : t("created"));
        if (!initialData && (result as any).productId) {
          router.push(`/admin/products/${(result as any).productId}/edit`);
        }
      } else {
        toast.error(result.error || "Save failed");
      }
    });
  };

  // Auto-save logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (form.formState.isDirty) {
        // Implement auto-save to temporary storage or draft endpoint
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [form.formState.isDirty]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative flex flex-col h-screen max-h-screen bg-background"
      >
        {/* Sticky header — always visible */}
        <ProductFormHeader
          isEdit={!!initialData}
          isPending={isPending}
          onSaveDraft={() => form.handleSubmit(onSubmit)()}
          productName={
            initialData?.localizedName?.en || (initialData as any)?.localizedContent?.name?.en
          }
        />

        {/* Sticky tab bar — below header */}
        <ProductFormTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Scrollable content + sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto minimal-scrollbar bg-muted/10 p-8 pb-24">
            <div className="max-w-5xl mx-auto w-full">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="info" className="mt-0 focus-visible:outline-none">
                  <InfoTab />
                </TabsContent>
                <TabsContent value="variants" className="mt-0 focus-visible:outline-none">
                  <VariantsTab />
                </TabsContent>
                <TabsContent value="media" className="mt-0 focus-visible:outline-none">
                  <MediaTab />
                </TabsContent>
                <TabsContent value="pricing" className="mt-0 focus-visible:outline-none">
                  <PricingTab />
                </TabsContent>
                <TabsContent value="seo" className="mt-0 focus-visible:outline-none">
                  <SeoTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <aside className="w-80 border-l bg-background overflow-y-auto minimal-scrollbar p-6 hidden xl:block">
            <ProductFormSidebar categories={categories} brands={brands} tags={tags} />
          </aside>
        </div>
      </form>
    </Form>
  );
}
