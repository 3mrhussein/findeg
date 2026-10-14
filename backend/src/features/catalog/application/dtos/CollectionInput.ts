import type { Locale } from '@findeg/domain';
import { z } from 'zod';
import { IdSchema, TranslationMapSchema, SlugSchema } from '../../../core/domain/types/common';

export const CollectionInputSchema = z.object({
  slug: SlugSchema,
  localizedTitle: TranslationMapSchema,
  localizedSubtitle: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    } satisfies Record<Locale, z.ZodType>)
    .optional()
    .nullable(),
  heroImageUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  tagIds: z.array(IdSchema).default([]),
});

export type CollectionInput = z.infer<typeof CollectionInputSchema>;
