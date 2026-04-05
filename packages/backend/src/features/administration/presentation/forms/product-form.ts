import { z } from "zod";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const LocalizedStringSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

const PriceListRowSchema = z.object({
  customerGroup: z.enum(["public_b2c", "school_b2b"]),
  uomCode: z.string(),
  unitPrice: z.number().nonnegative(),
  minQty: z.number().int().positive().default(1),
  isSellable: z.boolean().default(true),
});

const UoMRowSchema = z.object({
  uomCode: z.string().min(1),
  factorToBase: z.number().int().positive(),
  localizedLabel: LocalizedStringSchema,
  barcode: z.string().optional(),
  isEnabled: z.boolean().default(true),
  priceLists: z.array(PriceListRowSchema).default([]),
});

const VariantAttributeSchema = z.object({
  attributeKey: z.string(),
  value: z.string(),
  isVariantDefining: z.boolean().default(false),
});

export const VariantFormSchema = z.object({
  id: z.number().int().positive().optional(),
  sku: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[A-Z0-9-]+$/, "SKU must be uppercase, digits, or hyphens"),
  localizedLabel: LocalizedStringSchema.default({ en: "", ar: "" }),
  displayOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  basePrice: z.number().nonnegative(),
  strikePrice: z.number().nonnegative().nullable().optional(),
  costPrice: z.number().nonnegative().nullable().optional(),
  weightGrams: z.number().int().nonnegative().nullable().optional(),
  barcode: z.string().nullable().optional(),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  images: z
    .array(
      z.object({ url: z.string().url(), alt: z.string().optional(), displayOrder: z.number() }),
    )
    .default([]),
  attributes: z.array(VariantAttributeSchema).default([]),
  uoms: z.array(UoMRowSchema).default([]),
});

export const ProductFormSchema = z.object({
  localizedName: LocalizedStringSchema,
  localizedDescription: LocalizedStringSchema.optional().default({ en: "", ar: "" }),
  localizedLongDescription: LocalizedStringSchema.optional().default({ en: "", ar: "" }),
  localizedSlug: LocalizedStringSchema.optional().default({ en: "", ar: "" }),
  categoryId: z.number().nullable().optional(),
  brandId: z.number().nullable().optional(),
  tagIds: z.array(z.number()).default([]),
  isActive: z.boolean().default(true),
  sku: z.string().optional(),
  skuPrefix: z.string().optional(),

  pricingMode: z.enum(["shared", "per-variant"]).default("per-variant"),
  uomSharingMode: z.enum(["shared", "per-variant"]).default("shared"),

  sharedBasePrice: z.number().nonnegative().optional(),
  sharedStrikePrice: z.number().nonnegative().nullable().optional(),
  sharedCostPrice: z.number().nonnegative().nullable().optional(),
  sharedUoMs: z.array(UoMRowSchema).default([]),

  variants: z.array(VariantFormSchema).min(1, "At least one variant is required"),
  localizedMetaTitle: LocalizedStringSchema.optional().default({ en: "", ar: "" }),
  localizedMetaDescription: LocalizedStringSchema.optional().default({ en: "", ar: "" }),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;
export type VariantFormValues = z.infer<typeof VariantFormSchema>;
