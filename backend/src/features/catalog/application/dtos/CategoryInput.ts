import { z } from 'zod';
import { IdSchema, SlugSchema } from '../../../core/domain/types/common';
import { LocaleSchema } from '../../../core/domain/value-objects';

const CategoryTranslationSchema = z.object({
  language: LocaleSchema,
  name: z.string().min(2),
  description: z.string().optional(),
});

export const CategoryInputSchema = z.object({
  slug: SlugSchema,
  parentId: IdSchema.optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  translations: z.array(CategoryTranslationSchema).min(1, 'At least one translation is required'),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;