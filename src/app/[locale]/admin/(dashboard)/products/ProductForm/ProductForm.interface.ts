/**
 * ProductForm — shared types & interfaces
 */
import * as z from "zod";
import { ProductInput } from "@/features/administration/domain/types";

export const UOM_VALUES = ["pcs", "pack", "carton"] as const;
export const CUSTOMER_GROUP_VALUES = ["public_b2c", "school_b2b", "wholesale"] as const;

export const VariantPricingConfigSchema = z.object({
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

export const VariantPricingConfigListSchema = z.array(VariantPricingConfigSchema);

export type VariantPricingConfigType = z.infer<typeof VariantPricingConfigSchema>;

export const DEFAULT_UOM: VariantPricingConfigType["uoms"][number] = {
  uomCode: "pcs",
  factorToBase: 1,
  isEnabled: true,
};

export const productFormSchema = z.object({
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

export type ProductFormValues = z.infer<typeof productFormSchema>;

export interface ProductToEdit extends ProductInput {
  id: number;
}

export interface ProductFormProps {
  initialData?: ProductToEdit;
  categoriesPromise?: Promise<{ id: number; slug: string; name: string }[]>;
  brandsPromise?: Promise<{ id: number; name: string }[]>;
  categories?: { id: number; slug: string; name: string }[];
  brands?: { id: number; name: string }[];
}
