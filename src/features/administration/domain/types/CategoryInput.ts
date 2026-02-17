import { z } from "zod";
import { IdSchema, SlugSchema } from "@/features/core/domain/types/common";

const CategoryTranslationSchema = z.object({
  language: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
});

export const CategoryInputSchema = z.object({
  slug: SlugSchema,
  parentId: IdSchema.optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  translations: z.array(CategoryTranslationSchema).min(1, "At least one translation is required"),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;
