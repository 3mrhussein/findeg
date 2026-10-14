import { z } from 'zod';
import { IdSchema, TranslationMapSchema, SlugSchema } from '@findeg/db/types';
import { LocaleSchema } from '../catalog-locale/index';

export const CollectionInputSchema = z.object({
  slug: SlugSchema,
  localizedTitle: TranslationMapSchema,
  localizedSubtitle: z.partialRecord(LocaleSchema, z.string()).optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  tagIds: z.array(IdSchema).default([]),
});

export type CollectionInput = z.infer<typeof CollectionInputSchema>;
