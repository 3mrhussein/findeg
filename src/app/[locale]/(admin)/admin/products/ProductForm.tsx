"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductInput } from "@/features/administration/domain/types";
import {
  createProductAction,
  updateProductAction,
} from "@/features/catalog/application/actions/product";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomerGroup, UomCode } from "@/features/core/domain/types/common";

const UOM_VALUES = ["pcs", "pack", "carton"] as const;
const CUSTOMER_GROUP_VALUES = ["public_b2c", "school_b2b"] as const;

const VariantPricingConfigSchema = z.object({
  variantKey: z.string().min(1, "variantKey is required"),
  uoms: z.array(
    z.object({
      uomCode: z.enum(UOM_VALUES),
      factorToBase: z.number().positive("factorToBase must be greater than 0"),
      isEnabled: z.boolean().optional(),
    }),
  ),
  prices: z.array(
    z.object({
      customerGroup: z.enum(CUSTOMER_GROUP_VALUES),
      uomCode: z.enum(UOM_VALUES),
      unitPrice: z.number().nonnegative("unitPrice must be non-negative"),
      currency: z.string().length(3).optional(),
      isSellable: z.boolean().optional(),
    }),
  ),
});

const VariantPricingConfigListSchema = z.array(VariantPricingConfigSchema);

type VariantPricingConfig = z.infer<typeof VariantPricingConfigSchema>;

const DEFAULT_UOM: VariantPricingConfig["uoms"][number] = {
  uomCode: "pcs",
  factorToBase: 1,
  isEnabled: true,
};

const DEFAULT_PRICE: VariantPricingConfig["prices"][number] = {
  customerGroup: "public_b2c",
  uomCode: "pcs",
  unitPrice: 0,
  currency: "EGP",
  isSellable: true,
};

// Schema validation
const formSchema = z.object({
  name_en: z.string().min(2, "Name (EN) must be at least 2 characters"),
  description_en: z.string().min(10, "Description (EN) must be at least 10 characters"),
  name_ar: z.string().min(2, "Name (AR) must be at least 2 characters"),
  description_ar: z.string().min(10, "Description (AR) must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Please select a category"),
  brandId: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.coerce.number().min(0).default(0),
  lowStockThreshold: z.coerce.number().min(0).default(5),
  isActive: z.boolean().default(true),
  images: z.string().optional(),
});

interface ProductToEdit extends ProductInput {
  id: number;
}

interface ProductFormProps {
  initialData?: ProductToEdit;
  categories: { id: number; slug: string; name: string }[];
  brands: { id: number; name: string }[];
}

/**
 *
 */
export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingVariantConfig, setLoadingVariantConfig] = useState(false);
  const [variantConfigs, setVariantConfigs] = useState<VariantPricingConfig[]>([]);

  // Map initial data to form values if editing
  const defaultValues = initialData
    ? {
        name_en: initialData.translations.find((t) => t.language === "en")?.name || "",
        description_en:
          initialData.translations.find((t) => t.language === "en")?.description || "",
        name_ar: initialData.translations.find((t) => t.language === "ar")?.name || "",
        description_ar:
          initialData.translations.find((t) => t.language === "ar")?.description || "",
        price: initialData.price,
        categoryId: initialData.categoryId?.toString() || "",
        brandId: initialData.brandId?.toString() || "",
        sku: initialData.sku || "",
        stockQuantity: initialData.stockQuantity || 0,
        lowStockThreshold: initialData.lowStockThreshold || 5,
        isActive: initialData.isActive ?? true,
        images: initialData.images?.join(", ") || "",
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  /**
   * Updates one variant config item immutably.
   */
  const updateVariantConfig = (
    index: number,
    updater: (config: VariantPricingConfig) => VariantPricingConfig,
  ) => {
    setVariantConfigs((prev) => prev.map((item, i) => (i === index ? updater(item) : item)));
  };

  /**
   * Adds a variant pricing block.
   */
  const addVariantConfig = () => {
    setVariantConfigs((prev) => [
      ...prev,
      {
        variantKey: "default",
        uoms: [DEFAULT_UOM],
        prices: [DEFAULT_PRICE],
      },
    ]);
  };

  /**
   * Loads existing variant UoM/pricing config for edit mode.
   */
  useEffect(() => {
    /**
     * Fetches variant UoM + price list rows from admin APIs and prepares editor state.
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
          const b2cPrices = Array.isArray(b2cJson?.data?.prices) ? b2cJson.data.prices : [];
          const b2bPrices = Array.isArray(b2bJson?.data?.prices) ? b2bJson.data.prices : [];

          const prices = [...b2cPrices, ...b2bPrices]
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
            uoms: uoms.map((u: { uomCode: string; factorToBase: number; isEnabled?: boolean }) => ({
              uomCode: u.uomCode as UomCode,
              factorToBase: Number(u.factorToBase),
              isEnabled: u.isEnabled ?? true,
            })),
            prices: prices.map((price) => ({
              customerGroup: price.customerGroup as CustomerGroup,
              uomCode: price.uomCode as UomCode,
              unitPrice: Number(price.unitPrice),
              currency: price.currency || "EGP",
              isSellable: price.isSellable ?? true,
            })),
          });
        }

        if (config.length > 0) {
          setVariantConfigs(config);
          return;
        }

        // Build default rows for existing variants that do not have pricing config yet.
        setVariantConfigs(
          variantKeys.map((variantKey) => ({
            variantKey,
            uoms: [DEFAULT_UOM],
            prices: [],
          })),
        );
      } catch (error) {
        console.error("Failed to preload variant pricing config", error);
      } finally {
        setLoadingVariantConfig(false);
      }
    };

    loadVariantPricingConfig();
  }, [initialData]);

  /**
   * Applies optional per-variant UoM and price-list configuration via admin APIs.
   */
  const applyVariantPricingConfig = async (
    productId: number,
    config: VariantPricingConfig[],
  ): Promise<void> => {
    if (config.length === 0) return;

    const parsedConfig = VariantPricingConfigListSchema.safeParse(config);
    if (!parsedConfig.success) {
      throw new Error(parsedConfig.error.issues[0]?.message || "Invalid Variant Pricing Config.");
    }

    for (const item of parsedConfig.data) {
      const uomsRes = await fetch(`/api/v1/admin/products/${productId}/uoms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantKey: item.variantKey,
          uoms: item.uoms.map((uom) => ({
            uomCode: uom.uomCode as UomCode,
            factorToBase: uom.factorToBase,
            isEnabled: uom.isEnabled ?? true,
          })),
        }),
      });

      if (!uomsRes.ok) {
        throw new Error(`Failed to save UoMs for variant '${item.variantKey}'.`);
      }

      const pricingRes = await fetch(`/api/v1/admin/products/${productId}/pricing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantKey: item.variantKey,
          prices: item.prices.map((price) => ({
            customerGroup: price.customerGroup as CustomerGroup,
            uomCode: price.uomCode as UomCode,
            unitPrice: price.unitPrice,
            currency: price.currency || "EGP",
            isSellable: price.isSellable ?? true,
          })),
        }),
      });

      if (!pricingRes.ok) {
        throw new Error(`Failed to save pricing for variant '${item.variantKey}'.`);
      }
    }
  };

  /**
   *
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    // Transform form values to ProductInput
    const input: ProductInput = {
      price: values.price,
      categoryId: parseInt(values.categoryId),
      brandId: values.brandId ? parseInt(values.brandId) : undefined,
      sku: values.sku,
      stockQuantity: values.stockQuantity,
      lowStockThreshold: values.lowStockThreshold,
      isActive: values.isActive,
      images: values.images
        ? values.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
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
    };

    try {
      let result;
      if (initialData) {
        result = await updateProductAction(initialData.id, input);
      } else {
        result = await createProductAction(input);
      }

      if (result.success) {
        const productId = result.productId ?? initialData?.id;
        if (!productId) {
          throw new Error("Product saved but no product ID was returned.");
        }

        await applyVariantPricingConfig(productId, variantConfigs);

        toast({
          title: initialData ? "Product updated" : "Product created",
          description: "The product has been successfully saved.",
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
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* SKU & Price */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="PROD-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* English Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Product Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Arabic)</FormLabel>
                <FormControl>
                  <Input placeholder="اسم المنتج" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="description_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Product description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Arabic)</FormLabel>
                <FormControl>
                  <Textarea placeholder="وصف المنتج..." {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Relations & Stock */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Alert restriction level</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>Visible in store</FormDescription>
                </div>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images (Comma separated URLs)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                For MVP/Demo purposes, enter image URLs separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Variant Pricing & Sellable UoMs</h3>
              <p className="text-xs text-muted-foreground">
                Configure sellable units and per-customer-group prices without writing JSON.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addVariantConfig}>
              <Plus className="mr-2 h-4 w-4" />
              Add Variant Config
            </Button>
          </div>

          {loadingVariantConfig && (
            <div className="text-sm text-muted-foreground">Loading variant pricing config...</div>
          )}

          {!loadingVariantConfig && variantConfigs.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No variant pricing config yet. You can add one or keep default product pricing only.
            </div>
          )}

          {variantConfigs.map((config, configIndex) => (
            <div
              key={`${config.variantKey}-${configIndex}`}
              className="space-y-4 rounded-md border p-4"
            >
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <FormLabel>Variant Key</FormLabel>
                  <Input
                    value={config.variantKey}
                    onChange={(e) =>
                      updateVariantConfig(configIndex, (item) => ({
                        ...item,
                        variantKey: e.target.value,
                      }))
                    }
                    placeholder="default"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    setVariantConfigs((prev) => prev.filter((_, i) => i !== configIndex))
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Variant
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Sellable UoMs</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateVariantConfig(configIndex, (item) => ({
                        ...item,
                        uoms: [...item.uoms, DEFAULT_UOM],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add UoM
                  </Button>
                </div>

                {config.uoms.map((uom, uomIndex) => (
                  <div key={`${configIndex}-uom-${uomIndex}`} className="grid gap-3 md:grid-cols-4">
                    <Select
                      value={uom.uomCode}
                      onValueChange={(value) =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          uoms: item.uoms.map((u, i) =>
                            i === uomIndex ? { ...u, uomCode: value as UomCode } : u,
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UoM" />
                      </SelectTrigger>
                      <SelectContent>
                        {UOM_VALUES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={uom.factorToBase}
                      onChange={(e) =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          uoms: item.uoms.map((u, i) =>
                            i === uomIndex
                              ? { ...u, factorToBase: Number(e.target.value || 0) }
                              : u,
                          ),
                        }))
                      }
                      placeholder="Factor to base"
                    />

                    <div className="flex items-center rounded-md border px-3">
                      <Checkbox
                        checked={uom.isEnabled ?? true}
                        onCheckedChange={(checked) =>
                          updateVariantConfig(configIndex, (item) => ({
                            ...item,
                            uoms: item.uoms.map((u, i) =>
                              i === uomIndex ? { ...u, isEnabled: checked === true } : u,
                            ),
                          }))
                        }
                      />
                      <span className="ml-2 text-sm">Enabled</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          uoms: item.uoms.filter((_, i) => i !== uomIndex),
                        }))
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Price Lists</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateVariantConfig(configIndex, (item) => ({
                        ...item,
                        prices: [...item.prices, DEFAULT_PRICE],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Price Row
                  </Button>
                </div>

                {config.prices.map((price, priceIndex) => (
                  <div
                    key={`${configIndex}-price-${priceIndex}`}
                    className="grid gap-3 md:grid-cols-6"
                  >
                    <Select
                      value={price.customerGroup}
                      onValueChange={(value) =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          prices: item.prices.map((p, i) =>
                            i === priceIndex ? { ...p, customerGroup: value as CustomerGroup } : p,
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Customer group" />
                      </SelectTrigger>
                      <SelectContent>
                        {CUSTOMER_GROUP_VALUES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={price.uomCode}
                      onValueChange={(value) =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          prices: item.prices.map((p, i) =>
                            i === priceIndex ? { ...p, uomCode: value as UomCode } : p,
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UoM" />
                      </SelectTrigger>
                      <SelectContent>
                        {UOM_VALUES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price.unitPrice}
                      onChange={(e) =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          prices: item.prices.map((p, i) =>
                            i === priceIndex ? { ...p, unitPrice: Number(e.target.value || 0) } : p,
                          ),
                        }))
                      }
                      placeholder="Unit price"
                    />

                    <Input
                      value={price.currency || "EGP"}
                      maxLength={3}
                      onChange={(e) =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          prices: item.prices.map((p, i) =>
                            i === priceIndex ? { ...p, currency: e.target.value.toUpperCase() } : p,
                          ),
                        }))
                      }
                      placeholder="EGP"
                    />

                    <div className="flex items-center rounded-md border px-3">
                      <Checkbox
                        checked={price.isSellable ?? true}
                        onCheckedChange={(checked) =>
                          updateVariantConfig(configIndex, (item) => ({
                            ...item,
                            prices: item.prices.map((p, i) =>
                              i === priceIndex ? { ...p, isSellable: checked === true } : p,
                            ),
                          }))
                        }
                      />
                      <span className="ml-2 text-sm">Sellable</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        updateVariantConfig(configIndex, (item) => ({
                          ...item,
                          prices: item.prices.filter((_, i) => i !== priceIndex),
                        }))
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
