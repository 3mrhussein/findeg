import { z } from 'zod';
import { IdSchema as idSchema, SlugSchema as slugSchema } from '@findeg/db/types';
import { TranslationMapSchema as translationMapSchema } from '../../helpers/index';

const brandSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  localizedName: translationMapSchema,
  localizedDescription: translationMapSchema.optional(),
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

export type Brand = z.infer<typeof brandSchema>;

const createBrandSchema = brandSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateBrand = z.infer<typeof createBrandSchema>;

const updateBrandSchema = createBrandSchema.partial().extend({
  id: idSchema,
});
export type UpdateBrand = z.infer<typeof updateBrandSchema>;

export {
  brandSchema as BrandSchema,
  createBrandSchema as CreateBrandSchema,
  updateBrandSchema as UpdateBrandSchema,
};
