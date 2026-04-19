import { z } from "zod";
import {
  IdSchema,
  PriceSchema,
  QuantitySchema,
  LocalizedStringSchema,
} from "../../../core/domain/types/common";
import { LocaleSchema } from "../../../core/domain/value-objects";

// ─── Product Translation (unchanged) ────────────────────────────────────────

const ProductTranslationSchema = z.object({
  language: LocaleSchema,
  name: z.string().min(2),
  description: z.string(),
  longDescription: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

// ─── Variant Input ───────────────────────────────────────────────────────────

const SellableUomInputSchema = z.object({
  uomCode: z.string(),
  factorToBase: z.number().positive(),
  isEnabled: z.boolean().optional().default(true),
  localizedLabel: LocalizedStringSchema.optional(),
  barcode: z.string().optional(),
});

const PriceListInputSchema = z.object({
  customerGroup: z.string(),
  uomCode: z.string(),
  unitPrice: PriceSchema,
  currency: z.string().optional().default("EGP"),
  isSellable: z.boolean().optional().default(true),
  minQty: z.number().int().positive().optional().default(1),
});

const VariantImageInputSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  displayOrder: z.number().int().optional().default(0),
});

const VariantAttributeInputSchema = z.object({
  attributeId: IdSchema,
  valueText: z.string().optional(),
  valueNum: z.number().optional(),
  valueBool: z.boolean().optional(),
});

export const VariantInputSchema = z.object({
  /** ID is optional: if present, the variant is updated; otherwise, it is created. */
  id: IdSchema.optional(),
  sku: z.string().min(1),
  variantKey: z.string().min(1),
  localizedLabel: LocalizedStringSchema.optional(),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  basePrice: PriceSchema,
  strikePrice: PriceSchema.optional(),
  costPrice: PriceSchema.optional(),
  weight: z.number().optional(),
  weightGrams: z.number().int().optional(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  barcode: z.string().optional(),
  lowStockThreshold: QuantitySchema.optional().default(10),
  images: z.array(VariantImageInputSchema).optional(),
  attributes: z.array(VariantAttributeInputSchema).optional(),
  sellableUoms: z.array(SellableUomInputSchema).optional(),
  priceLists: z.array(PriceListInputSchema).optional(),
});

export type VariantInput = z.infer<typeof VariantInputSchema>;

// ─── Product Input (SPU) ─────────────────────────────────────────────────────

/**
 * Input schema for creating/updating a product (SPU).
 *
 * Removed: sku, price, strikePrice, images, stockQuantity,
 *   lowStockThreshold, variants (JSONB)
 * Added: skuPrefix, variants (normalized array)
 */
export const ProductInputSchema = z.object({
  /** Optional family-level SKU prefix */
  skuPrefix: z.string().optional(),

  /** Primary navigation category */
  categoryId: IdSchema.optional(),
  category: z.string().optional(),

  /** Product brand */
  brandId: IdSchema.optional(),

  /** Active/visible status */
  isActive: z.boolean().optional().default(true),

  /** Localized content — at least one language required */
  translations: z.array(ProductTranslationSchema).min(1, "At least one translation is required"),

  /** SPU-level hero imagery */
  mediaSet: z.any().optional(),

  /** Normalized variant definitions */
  variants: z.array(VariantInputSchema).optional(),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;
