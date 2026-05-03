import { z } from 'zod';
import { SlugSchema } from '../../../core/domain/types/common';

export const BrandInputSchema = z.object({
  slug: SlugSchema,
  nameEn: z.string().min(1, 'Name (English) is required').max(60),
  nameAr: z.string().min(1, 'Name (Arabic) is required').max(60),
  logoUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  descriptionEn: z.string().max(300).optional(),
  descriptionAr: z.string().max(300).optional(),
  isActive: z.boolean().default(true),
  // Keep base name for backward compatibility or simple use
  name: z.string().optional(),
});

export type BrandInput = z.infer<typeof BrandInputSchema>;
