"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ProductInput } from "@/features/administration/domain/types";
import {
  createProductAction,
  updateProductAction,
} from "@/features/catalog/application/actions/product";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/providers/PermissionsProvider";
import { PERMISSION_CODES } from "@/features/core/domain/auth";
import { ProductBasicInfo } from "../_components/ProductBasicInfo";
import { ProductCategoryBrand } from "../_components/ProductCategoryBrand";
import { ProductInventory } from "../_components/ProductInventory";
import { ProductMedia } from "../_components/ProductMedia";
import { ProductVariants, VariantPricingConfig } from "../_components/ProductVariants";
import { SubmitButton } from "@/components/ui/submit-button";
import type {
  ProductFormProps,
  ProductFormValues,
  VariantPricingConfigType,
} from "./ProductForm.interface";
import {
  productFormSchema,
  VariantPricingConfigListSchema,
  DEFAULT_UOM,
} from "./ProductForm.interface";

// Re-export for consumers who import from the old flat file
export {
  VariantPricingConfigSchema,
  VariantPricingConfigListSchema,
} from "./ProductForm.interface";

/**
 * ProductForm — create / edit a product with multi-section layout guarded by permissions.
 */
export function ProductForm({
  initialData,
  categoriesPromise,
  brandsPromise,
  ...props
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const categoriesUrl = categoriesPromise ? use(categoriesPromise) : props.categories || [];
  const brandsUrl = brandsPromise ? use(brandsPromise) : props.brands || [];

  const [loadingVariantConfig, setLoadingVariantConfig] = useState(false);
  const [variantConfigs, setVariantConfigs] = useState<VariantPricingConfig[]>([]);

  const { isSystemAdmin, hasPermission } = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return usePermissions();
    } catch {
      return {
        isSystemAdmin: true,
        /**
         *
         */
        hasPermission: () => true,
      };
    }
  })();

  const canContent = isSystemAdmin || hasPermission(PERMISSION_CODES.ADMIN_PRODUCTS_WRITE);
  const canInventory = isSystemAdmin || hasPermission(PERMISSION_CODES.ADMIN_INVENTORY_WRITE);

  const firstVariant = initialData?.variants?.[0];
  const defaultValues: ProductFormValues = initialData
    ? {
        name_en: initialData.translations.find((t) => t.language === "en")?.name || "",
        description_en:
          initialData.translations.find((t) => t.language === "en")?.description || "",
        name_ar: initialData.translations.find((t) => t.language === "ar")?.name || "",
        description_ar:
          initialData.translations.find((t) => t.language === "ar")?.description || "",
        price: firstVariant?.basePrice ?? 0,
        categoryId: initialData.categoryId?.toString() || "",
        brandId: initialData.brandId?.toString() || "",
        sku: firstVariant?.sku || "",
        stockQuantity: 0,
        lowStockThreshold: firstVariant?.lowStockThreshold ?? 5,
        isActive: initialData.isActive ?? true,
        images: firstVariant?.images?.map((img) => img.url).join(", ") || "",
      }
    : {
        name_en: "",
        description_en: "",
        name_ar: "",
        description_ar: "",
        price: 0,
        categoryId: "",
        brandId: "",
        sku: "",
        stockQuantity: 0,
        lowStockThreshold: 5,
        isActive: true,
        images: "",
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues,
  });

  useEffect(() => {
    /**
     *
     */
    const loadVariantPricingConfig = async () => {
      if (!initialData?.id) return;
      const variantKeys = initialData.variants ? Object.keys(initialData.variants) : [];
      if (variantKeys.length === 0) return;
      setLoadingVariantConfig(true);
      try {
        const config: VariantPricingConfig[] = [];
        for (const variantKey of variantKeys) {
          const [uomsRes, b2cRes, b2bRes] = await Promise.all([
            fetch(
              `/api/v1/admin/products/${initialData.id}/uoms?variantKey=${encodeURIComponent(variantKey)}`,
            ),
            fetch(
              `/api/v1/admin/products/${initialData.id}/pricing?variantKey=${encodeURIComponent(variantKey)}&customerGroup=public_b2c`,
            ),
            fetch(
              `/api/v1/admin/products/${initialData.id}/pricing?variantKey=${encodeURIComponent(variantKey)}&customerGroup=school_b2b`,
            ),
          ]);
          if (!uomsRes.ok) continue;
          const uomsJson = await uomsRes.json();
          const b2cJson = b2cRes.ok ? await b2cRes.json() : null;
          const b2bJson = b2bRes.ok ? await b2bRes.json() : null;
          const uoms = Array.isArray(uomsJson?.data?.uoms) ? uomsJson.data.uoms : [];
          const prices = [
            ...(Array.isArray(b2cJson?.data?.prices) ? b2cJson.data.prices : []),
            ...(Array.isArray(b2bJson?.data?.prices) ? b2bJson.data.prices : []),
          ]
            .filter((p) => p.unitPrice !== undefined && p.unitPrice !== null)
            .map((p) => ({
              customerGroup: p.customerGroup,
              uomCode: p.uomCode,
              unitPrice: Number(p.unitPrice),
              currency: p.currency || "EGP",
              isSellable: p.isSellable ?? true,
            }));
          if (uoms.length === 0 && prices.length === 0) continue;
          config.push({
            variantKey,
            uoms: uoms.map((u: any) => ({
              uomCode: u.uomCode,
              factorToBase: Number(u.factorToBase),
              isEnabled: u.isEnabled ?? true,
            })),
            prices,
          });
        }
        setVariantConfigs(
          config.length > 0
            ? config
            : variantKeys.map((variantKey) => ({ variantKey, uoms: [DEFAULT_UOM], prices: [] })),
        );
      } catch (error) {
        console.error("Failed to preload config", error);
      } finally {
        setLoadingVariantConfig(false);
      }
    };
    loadVariantPricingConfig();
  }, [initialData]);

  /**
   *
   */
  const applyVariantPricingConfig = async (productId: number, config: VariantPricingConfig[]) => {
    if (config.length === 0) return;
    const parsedConfig = VariantPricingConfigListSchema.safeParse(config);
    if (!parsedConfig.success) throw new Error("Invalid Variant Pricing Config.");
    for (const item of parsedConfig.data) {
      const uomsRes = await fetch(`/api/v1/admin/products/${productId}/uoms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantKey: item.variantKey, uoms: item.uoms }),
      });
      if (!uomsRes.ok) throw new Error(`Failed to save UoMs for variant '${item.variantKey}'.`);
      const pricingRes = await fetch(`/api/v1/admin/products/${productId}/pricing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantKey: item.variantKey, prices: item.prices }),
      });
      if (!pricingRes.ok)
        throw new Error(`Failed to save pricing for variant '${item.variantKey}'.`);
    }
  };

  /**
   *
   */
  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const input: ProductInput = {
        categoryId: parseInt(values.categoryId),
        brandId: values.brandId && values.brandId !== "none" ? parseInt(values.brandId) : undefined,
        isActive: values.isActive,
        translations: [
          {
            language: "en",
            name: values.name_en,
            description: values.description_en,
            longDescription: values.description_en,
          },
          {
            language: "ar",
            name: values.name_ar,
            description: values.description_ar,
            longDescription: values.description_ar,
          },
        ],
        isNew: true,
        variants: [
          {
            sku: values.sku || `PROD-${Date.now()}`,
            variantKey: "default",
            displayOrder: 0,
            basePrice: values.price,
            lowStockThreshold: values.lowStockThreshold,
            isActive: values.isActive,
            images: values.images
              ? values.images
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((url) => ({ url, displayOrder: 0 }))
              : [],
          },
        ],
      };
      try {
        const result = initialData
          ? await updateProductAction(initialData.id, input)
          : await createProductAction(input);
        if (result.success) {
          const productId = result.productId ?? initialData?.id;
          if (productId) await applyVariantPricingConfig(productId, variantConfigs);
          toast({
            title: initialData ? "Product updated" : "Product created",
            description: "Successfully saved.",
          });
          router.push("/admin/products");
          router.refresh();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Something went wrong.",
          });
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {canContent && (
          <div className="space-y-6">
            <ProductBasicInfo />
            <ProductCategoryBrand categories={categoriesUrl} brands={brandsUrl} />
          </div>
        )}
        {canInventory && (
          <div className="space-y-6">
            <ProductInventory />
            <ProductMedia />
            <ProductVariants
              configs={variantConfigs}
              setConfigs={setVariantConfigs}
              loading={loadingVariantConfig}
            />
          </div>
        )}
        <div className="flex justify-end gap-4 pb-12">
          <SubmitButton
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
            defaultText="Cancel"
          />
          <SubmitButton
            disabled={isPending}
            loadingText="Saving product..."
            defaultText={initialData ? "Update Product" : "Create Product"}
          />
        </div>
      </form>
    </Form>
  );
}
