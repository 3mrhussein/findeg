import { z } from 'zod';
import { IdSchema, SlugSchema } from '../../../core/domain/types/common';
import { TranslationMapSchema } from '../../../core/domain/value-objects';

export const BrandLocalizedContentSchema = z.object({
  name: TranslationMapSchema,
  description: TranslationMapSchema.optional(),
});
export type BrandLocalizedContent = z.infer<typeof BrandLocalizedContentSchema>;

export const BrandSchema = z.object({
  id: IdSchema,
  slug: SlugSchema,
  name: z.string(),
  locale: z.string().optional(), // Locale
  localizedContent: BrandLocalizedContentSchema.optional(),
  logoUrl: z.string().nullable().optional(),
  productCount: z.number().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Brand = z.infer<typeof BrandSchema>;

export const CreateBrandSchema = BrandSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateBrand = z.infer<typeof CreateBrandSchema>;

export const UpdateBrandSchema = CreateBrandSchema.partial().extend({
  id: IdSchema,
});
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>;
