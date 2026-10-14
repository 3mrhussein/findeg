import { z } from 'zod';
import { SlugSchema as slugSchema } from '@findeg/db/types';

const brandInputSchema = z.object({
  slug: slugSchema,
  nameEn: z.string().min(1, 'Name (English) is required').max(60),
  nameAr: z.string().min(1, 'Name (Arabic) is required').max(60),
  logoUrl: z.url('Invalid image URL').optional().or(z.literal('')),
  descriptionEn: z.string().max(300).optional(),
  descriptionAr: z.string().max(300).optional(),
  isActive: z.boolean().default(true),
  name: z.string().optional(),
});

export type BrandInput = z.infer<typeof brandInputSchema>;

export { brandInputSchema as BrandInputSchema };
