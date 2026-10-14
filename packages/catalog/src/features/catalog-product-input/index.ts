import { z } from 'zod';
import {
  IdSchema as idSchema,
  TranslationMapSchema as translationMapSchema,
} from '@findeg/db/types';
import { LocaleSchema as localeSchema } from '../../helpers/index';

const productTranslationSchema = z.object({
  language: localeSchema,
  name: z.string().min(2),
  description: z.string(),
  longDescription: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

const variantImageInputSchema = z.object({
  url: z.url(),
  alt: z.string().optional(),
  displayOrder: z.number().int().optional().default(0),
});

const variantAttributeInputSchema = z.object({
  attributeId: idSchema,
  valueText: z.string().optional(),
});

const variantInputSchema = z.object({
  id: idSchema.optional(),
  sku: z.string().min(1),
  variantKey: z.string().min(1),
  localizedLabel: translationMapSchema.optional(),
  sortOrder: z.number().int().optional().default(0),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  basePrice: z.number().nonnegative(),
  strikePrice: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
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
  images: z.array(variantImageInputSchema).optional(),
  attributes: z.array(variantAttributeInputSchema).optional(),
});

export type VariantInput = z.infer<typeof variantInputSchema>;

const productInputSchema = z
  .object({
    categoryId: idSchema.optional(),
    category: z.string().optional(),
    brandId: idSchema.optional(),
    isActive: z.boolean().optional().default(true),
    translations: z.array(productTranslationSchema).min(1, 'At least one translation is required'),
    variants: z.array(variantInputSchema).min(1, 'Product must have at least one variant'),
  })
  .superRefine((data, ctx) => {
    if (data.variants.length === 0) return;

    const defaultVariants = data.variants.filter((variant) => variant.isDefault);

    if (defaultVariants.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Product must have exactly one default variant',
        path: ['variants'],
      });
    } else if (defaultVariants.length > 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Product can only have one default variant',
        path: ['variants'],
      });
    }

    const sortedByOrder = [...data.variants].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );

    for (let index = 0; index < sortedByOrder.length; index++) {
      if (sortedByOrder[index].sortOrder !== index) {
        ctx.addIssue({
          code: 'custom',
          message: `Variants must have sequential sort orders starting from 0. Expected ${String(index)} at index ${String(index)}, but found ${String(sortedByOrder[index].sortOrder)}.`,
          path: ['variants', index, 'sortOrder'],
        });
      }
    }
  });

export type ProductInput = Omit<z.infer<typeof productInputSchema>, 'isActive'> & {
  isActive?: boolean;
};

export { variantInputSchema as VariantInputSchema, productInputSchema as ProductInputSchema };
