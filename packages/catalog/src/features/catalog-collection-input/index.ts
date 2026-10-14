import { z } from 'zod';
import {
  IdSchema as idSchema,
  TranslationMapSchema as translationMapSchema,
  SlugSchema as slugSchema,
} from '@findeg/db/types';
import { LocaleSchema as localeSchema } from '../catalog-locale/index';

const collectionInputSchema = z.object({
  slug: slugSchema,
  localizedTitle: translationMapSchema,
  localizedSubtitle: z.partialRecord(localeSchema, z.string()).optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  tagIds: z.array(idSchema).default([]),
});

export type CollectionInput = z.infer<typeof collectionInputSchema>;

export { collectionInputSchema as CollectionInputSchema };
