import { z } from 'zod';
import { IdSchema as idSchema, SlugSchema as slugSchema } from '@findeg/db/types';
import { LocaleSchema as localeSchema } from '../../helpers/index';

const categoryTranslationSchema = z.object({
  language: localeSchema,
  name: z.string().min(2),
  description: z.string().optional(),
});

const categoryInputSchema = z.object({
  slug: slugSchema,
  parentId: idSchema.optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  translations: z.array(categoryTranslationSchema).min(1, 'At least one translation is required'),
});

export type CategoryInput = Omit<z.infer<typeof categoryInputSchema>, 'isActive'> & {
  isActive?: boolean;
};

export { categoryInputSchema as CategoryInputSchema };
