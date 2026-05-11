import { z } from 'zod';
import {
  IdSchema,
  PriceSchema,
  TranslationMapSchema,
} from '../../../core/domain/types/common';
import { LocaleSchema } from '../../../core/domain/value-objects';

const ProductTranslationSchema = z.object({
  language: LocaleSchema,
  name: z.string().min(2),
  description: z.string(),
  longDescription: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

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
  mediaSet: z.any().optional(),
  images: z.array(VariantImageInputSchema).optional(),
  attributes: z.array(VariantAttributeInputSchema).optional(),
});

export type VariantInput = z.infer<typeof VariantInputSchema>;

export const ProductInputSchema = z
  .object({
    categoryId: IdSchema.optional(),
    category: z.string().optional(),
    brandId: IdSchema.optional(),
    isActive: z.boolean().optional().default(true),
    translations: z.array(ProductTranslationSchema).min(1, 'At least one translation is required'),
    variants: z.array(VariantInputSchema).min(1, 'Product must have at least one variant'),
  })
  .superRefine((data, ctx) => {
    if (!data.variants || data.variants.length === 0) return;

    const defaultVariants = data.variants.filter((variant) => variant.isDefault);

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

    const sortedByOrder = [...data.variants].sort(
      (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0),
    );

    for (let index = 0; index < sortedByOrder.length; index++) {
      if ((sortedByOrder[index].sortOrder ?? 0) !== index) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Variants must have sequential sort orders starting from 0. Expected ${index} at index ${index}, but found ${sortedByOrder[index].sortOrder}.`,
          path: ['variants', index, 'sortOrder'],
        });
      }
    }
  });

export type ProductInput = z.infer<typeof ProductInputSchema>;