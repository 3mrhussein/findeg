import {
  PortalRole,
  TranslationMapSchema,
} from '@findeg/backend/features/core';
import { z } from 'zod';

export interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon: string;
  permission?: string;
  portalRoles?: PortalRole[];
  children?: NavItem[];
  persistent?: boolean;
}

export interface NavGroup {
  label?: string;
  labelAr?: string;
  items: NavItem[];
}


const VariantAttributeSchema = z.object({
  attributeKey: z.string(),
  value: z.string(),
});

export const VariantFormSchema = z.object({
  id: z.number().int().positive().optional(),
  sku: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[A-Z0-9-]+$/, 'SKU must be uppercase, digits, or hyphens'),
  localizedLabel: TranslationMapSchema.default({ en: '', ar: '' }),
  sortOrder: z.number().int().nonnegative().default(0),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  basePrice: z.number().nonnegative(),
  strikePrice: z.number().nonnegative().nullable().optional(),
  costPrice: z.number().nonnegative().nullable().optional(),
  weightGrams: z.number().int().nonnegative().nullable().optional(),
  barcode: z.string().nullable().optional(),
  mediaSet: z.any().optional(),
  images: z
    .array(
      z.object({ url: z.string().url(), alt: z.string().optional(), displayOrder: z.number() }),
    )
    .default([]),
  attributes: z.array(VariantAttributeSchema).default([]),
});

export const ProductFormSchema = z.object({
  localizedName: TranslationMapSchema,
  localizedDescription: TranslationMapSchema.optional().default({ en: '', ar: '' }),
  localizedLongDescription: TranslationMapSchema.optional().default({ en: '', ar: '' }),
  localizedSlug: TranslationMapSchema.optional().default({ en: '', ar: '' }),
  categoryId: z.number().nullable().optional(),
  brandId: z.number().nullable().optional(),
  tagIds: z.array(z.number()).default([]),
  isActive: z.boolean().default(true),

  variants: z.array(VariantFormSchema).min(1, 'At least one variant is required'),
  localizedMetaTitle: TranslationMapSchema.optional().default({ en: '', ar: '' }),
  localizedMetaDescription: TranslationMapSchema.optional().default({ en: '', ar: '' }),
}).superRefine((data, ctx) => {
  const defaultCount = data.variants.filter((v) => v.isDefault).length;
  if (defaultCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Exactly one variant must be marked as default',
      path: ['variants'],
    });
  } else if (defaultCount > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Only one variant can be marked as default',
      path: ['variants'],
    });
  }
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;
export type VariantFormValues = z.infer<typeof VariantFormSchema>;
