import { z } from 'zod';
import { IdSchema, SlugSchema } from '../../../core/domain/types/common';
import { TranslationMapSchema } from '../../../core/domain/value-objects';

export const BrandSchema = z.object({
  id: IdSchema,
  slug: SlugSchema,
  localizedName: TranslationMapSchema,
  localizedDescription: TranslationMapSchema.optional(),
  isActive: z.boolean().default(true),
  
  // Resolved Content (for specific locale)
  name: z.string().optional(),
  description: z.string().optional(),
  locale: z.string().optional(),
  
  logoUrl: z.string().nullable().optional(),
  productCount: z.number().optional(),
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
