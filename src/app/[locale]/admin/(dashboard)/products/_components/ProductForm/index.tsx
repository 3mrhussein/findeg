"use client";

import * as React from "react";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import {
  ProductFormSchema,
  type ProductFormValues,
} from "@/features/administration/presentation/forms/product-form";
import { ProductInfoZone } from "./zones/ProductInfoZone";
import { PricingZone } from "./zones/PricingZone";
import { ProductStockSection } from "./zones/ProductStockSection";
import { UoMSection } from "./uom/UoMSection";
import { VariantsZone } from "./zones/VariantsZone";
import {
  createProductAction,
  updateProductAction,
} from "@/features/administration/application/actions/admin-product-actions";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: number;
  initialData?: Partial<ProductFormValues>;
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
}

/**
 * ProductForm — Main Orchestrator
 *
 * Progressive disclosure layout:
 * - Zone 1: Product Info (always visible)
 * - Zone 2: Variants (collapsible)
 * - Zone 3: Pricing (visible, collapses per-variant into VariantCard)
 * - UoM section (visible at SPU level for shared UoMs)
 *
 * Handles both create and edit modes with the same component tree.
 */
export function ProductForm({
  mode,
  productId,
  initialData,
  categories,
  brands,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const defaultValues: ProductFormValues = {
    localizedName: { en: "", ar: "" },
    localizedDescription: { en: "", ar: "" },
    localizedLongDescription: { en: "", ar: "" },
    localizedSlug: { en: "", ar: "" },
    categoryId: null,
    brandId: null,
    tagIds: [],
    isActive: true,
    sku: undefined,
    pricingMode: "per-variant",
    uomSharingMode: "shared",
    sharedBasePrice: undefined,
    sharedStrikePrice: null,
    sharedCostPrice: null,
    sharedUoMs: [],
    variants: [
      {
        sku: "",
        localizedLabel: { en: "", ar: "" },
        displayOrder: 0,
        isActive: true,
        basePrice: 0,
        strikePrice: null,
        costPrice: null,
        weightGrams: null,
        barcode: null,
        lowStockThreshold: 10,
        images: [],
        attributes: [],
        uoms: [],
      },
    ],
    ...initialData,
  };

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;
  const hasVariants = (methods.watch("variants") ?? []).length > 1;

  /**
   *
   */
  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    startTransition(async () => {
      try {
        let result;

        if (mode === "create") {
          result = await createProductAction(data);
          if (result.success) {
            toast({
              title: "Success",
              description: "Product created successfully",
            });
            router.push(`/admin/products/${result.productId}/edit`);
          }
        } else if (mode === "edit" && productId) {
          result = await updateProductAction(productId, data);
          if (result.success) {
            toast({
              title: "Success",
              description: "Product updated successfully",
            });
          }
        }

        if (result && !result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error ?? "An error occurred",
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unexpected error. Please try again.",
        });
        console.error("[ProductForm.onSubmit]", err);
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
        {/* Zone 1: Product Info */}
        <ProductInfoZone categories={categories} brands={brands} />

        {/* Zone 2: Variants */}
        <VariantsZone />

        {/* Zone 3: Pricing (at SPU level for simple or shared-price products) */}
        <PricingZone hasVariants={hasVariants} />

        {/* Shared UoMs (visible when uomSharingMode = "shared") */}
        <UoMSection fieldArrayName="sharedUoMs" title="Units of Measure (Shared)" />

        {/* Stock info for simple product (no variants) */}
        {!hasVariants && <ProductStockSection />}

        {/* ─── Sticky Footer ─────────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-6 py-3 backdrop-blur-sm">
          <div className="ml-auto flex max-w-7xl items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {mode === "create" ? "Creating new product" : `Editing product #${productId}`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => router.push("/admin/products")}
                disabled={isPending}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                )}
                {mode === "create" ? "Create Product" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
