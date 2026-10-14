/**
 * Domain Entity: Collection
 *
 * Collections are curated groupings of products powered by tags.
 * They represent themed "views" like "Back to School" or "Creative & Hobby".
 */

import { z } from 'zod';
import { TagSchema as tagSchema } from '../catalog-tag/index';
import {
  IdSchema as idSchema,
  SlugSchema as slugSchema,
  TranslationMapSchema as translationMapSchema,
} from '@findeg/db/types';

const collectionSchema = z.object({
  id: idSchema,

  /** URL-friendly identifier (e.g., 'back-to-school') */
  slug: slugSchema,

  localizedTitle: translationMapSchema,

  /** Optional localized subtitle or descriptive text for landing heroes */
  localizedSubtitle: translationMapSchema.optional(),

  /** Relative or absolute URL for the collection hero imagery */
  heroImageUrl: z.string().optional(),

  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),

  /**
   * Associated Tags
   * These tags define the membership rules (Rule-based OR).
   */
  tags: z.array(tagSchema).optional(),
});

export type Collection = z.infer<typeof collectionSchema>;

const createCollectionSchema = collectionSchema.omit({ id: true });
export type CreateCollection = z.infer<typeof createCollectionSchema>;

export { collectionSchema as CollectionSchema, createCollectionSchema as CreateCollectionSchema };
