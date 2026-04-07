/**
 * Domain Entity: Collection
 *
 * Collections are curated groupings of products powered by tags.
 * They represent themed "views" like "Back to School" or "Creative & Hobby".
 */

import { z } from "zod";
import { IdSchema, LocalizedStringSchema, SlugSchema } from "@features/core/domain/types/common";
import { TagSchema } from "./Tag";

export const CollectionSchema = z.object({
  id: IdSchema,

  /** URL-friendly identifier (e.g., 'back-to-school') */
  slug: SlugSchema,

  localizedTitle: LocalizedStringSchema,

  /** Optional localized subtitle or descriptive text for landing heroes */
  localizedSubtitle: LocalizedStringSchema.optional(),

  /** Relative or absolute URL for the collection hero imagery */
  heroImageUrl: z.string().optional(),

  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),

  /**
   * Associated Tags
   * These tags define the membership rules (Rule-based OR).
   */
  tags: z.array(TagSchema).optional(),
});

export type Collection = z.infer<typeof CollectionSchema>;

export const CreateCollectionSchema = CollectionSchema.omit({ id: true });
export type CreateCollection = z.infer<typeof CreateCollectionSchema>;
