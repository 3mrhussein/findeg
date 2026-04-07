/**
 * Domain Entity: Tag
 *
 * Repesents a flexible tag used for categorization beyond the main category tree.
 */

import { z } from "zod";
import { IdSchema, LocalizedStringSchema } from "@features/core/domain/types/common";

/**
 * Valid tag groups.
 * These act as namespaces for tags (e.g., 'audience', 'style').
 * Now allows free-form string groups for admin flexibility.
 */
export const TagGroupSchema = z.string();
export type TagGroup = z.infer<typeof TagGroupSchema>;

/**
 * Tag Visibility/Scope.
 * Defines where the tag is applicable.
 */
export const TagScopeSchema = z.enum(["catalog", "school", "campaign", "system"]);
export type TagScope = z.infer<typeof TagScopeSchema>;

export const TagSchema = z.object({
  id: IdSchema,
  group: TagGroupSchema,
  key: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isActive: z.boolean(),
  scope: TagScopeSchema.default("catalog"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tag = z.infer<typeof TagSchema>;

/**
 * Full tag identifier — used as the stable key for frontend mapping
 */
export function tagIdentifier(tag: Pick<Tag, "group" | "key">): string {
  return `${tag.group}:${tag.key}`;
}

export const CreateTagSchema = TagSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateTag = z.infer<typeof CreateTagSchema>;
