/**
 * Domain Entity: Tag
 *
 * Repesents a flexible tag used for categorization beyond the main category tree.
 */

import { z } from "zod";
import { IdSchema, LocalizedStringSchema } from "@/features/core/domain/types/common";

/**
 * Valid tag groups.
 * These act as namespaces for tags.
 */
export const TagGroupSchema = z.enum([
  "usecase",
  "audience",
  "style",
  "season",
  "school_program",
  "collection",
]);

export type TagGroup = z.infer<typeof TagGroupSchema>;

/**
 * Tag Domain Schema
 */
export const TagSchema = z.object({
  id: IdSchema,
  group: TagGroupSchema,
  key: z.string(),
  localizedLabel: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean(),
});

export type Tag = z.infer<typeof TagSchema>;

/**
 * Input for creating a new tag
 */
export const CreateTagSchema = TagSchema.omit({ id: true });
export type CreateTag = z.infer<typeof CreateTagSchema>;
