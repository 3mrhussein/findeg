import { z } from 'zod';
import {
  IdSchema,
  PriceSchema,
  QuantitySchema,
  TranslationMapSchema,
} from '../../../core/domain/types/common';
import { LocaleSchema } from '../../../core/domain/value-objects';

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


const VariantImageInputSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  displayOrder: z.number().int().optional().default(0),
});

const VariantAttributeInputSchema = z.object({
  attributeId: IdSchema,
  valueText: z.string().optional(),
});

export const VariantInputSchema = z.object({
  /** ID is optional: if present, the variant is updated; otherwise, it is created. */
  id: IdSchema.optional(),
  sku: z.string().min(1),
  variantKey: z.string().min(1),
  localizedLabel: TranslationMapSchema.optional(),
  sortOrder: z.number().int().optional().default(0),
  isDefault: z.boolean().optional().default(false),
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
  mediaSet: z.any().optional(), // ResponsiveMediaSetSchema
  images: z.array(VariantImageInputSchema).optional(),
  attributes: z.array(VariantAttributeInputSchema).optional(),
});

export type VariantInput = z.infer<typeof VariantInputSchema>;

// ─── Product Input (SPU) ─────────────────────────────────────────────────────

/**
 * Input schema for creating/updating a product (SPU).
 *
 * Removed: sku, skuPrefix, price, strikePrice, images, stockQuantity,
 *   lowStockThreshold, variants (JSONB)
 * Added: variants (normalized array)
 */
export const ProductInputSchema = z.object({

  /** Primary navigation category */
  categoryId: IdSchema.optional(),
  category: z.string().optional(),

  /** Product brand */
  brandId: IdSchema.optional(),

  /** Active/visible status */
  isActive: z.boolean().optional().default(true),

  /** Localized content — at least one language required */
  translations: z.array(ProductTranslationSchema).min(1, 'At least one translation is required'),

  /** SPU-level hero imagery (Removed in favor of variant-level media) */
  // mediaSet: z.any().optional(),

  /** Normalized variant definitions */
  variants: z.array(VariantInputSchema).min(1, 'Product must have at least one variant'),
}).superRefine((data, ctx) => {
  if (!data.variants || data.variants.length === 0) return;

  const defaultVariants = data.variants.filter((v) => v.isDefault);
  
  if (defaultVariants.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Product must have exactly one default variant',
      path: ['variants'],
    });
  } else if (defaultVariants.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Product can only have one default variant',
      path: ['variants'],
    });
  }

  // Ensure unique sequential sortOrder (0, 1, 2...)
  const sortedByOrder = [...data.variants].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  for (let i = 0; i < sortedByOrder.length; i++) {
    if ((sortedByOrder[i].sortOrder ?? 0) !== i) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Variants must have sequential sort orders starting from 0. Expected ${i} at index ${i}, but found ${sortedByOrder[i].sortOrder}.`,
        path: ['variants', i, 'sortOrder'],
      });
    }
  }
});

export type ProductInput = z.infer<typeof ProductInputSchema>;
