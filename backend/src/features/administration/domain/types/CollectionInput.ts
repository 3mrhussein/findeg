import { z } from "zod";
import { IdSchema, TranslationMapSchema, SlugSchema } from "../../../core/domain/types/common";

export const CollectionInputSchema = z.object({
  slug: SlugSchema,
  localizedTitle: TranslationMapSchema,
  localizedSubtitle: TranslationMapSchema.optional(),
  heroImageUrl: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  tagIds: z.array(IdSchema).default([]),
});

export type CollectionInput = z.infer<typeof CollectionInputSchema>;
