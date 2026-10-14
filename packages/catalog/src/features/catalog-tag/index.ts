/**
 * Domain Entity: Tag
 *
 * Repesents a flexible tag used for categorization beyond the main category tree.
 */

import { z } from 'zod';
import { TAG_SCOPES } from '@findeg/domain';
import { IdSchema as idSchema } from '@findeg/db/types';

/**
 * Valid tag groups.
 * These act as namespaces for tags (e.g., 'audience', 'style').
 * Now allows free-form string groups for admin flexibility.
 */
const tagGroupSchema = z.string();
export type TagGroup = z.infer<typeof tagGroupSchema>;

/**
 * Tag Visibility/Scope.
 * Defines where the tag is applicable.
 */
const tagScopeSchema = z.enum(TAG_SCOPES);
export type TagScope = z.infer<typeof tagScopeSchema>;

const tagSchema = z.object({
  id: idSchema,
  group: tagGroupSchema,
  key: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isActive: z.boolean(),
  scope: tagScopeSchema.default('catalog'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tag = z.infer<typeof tagSchema>;

/**
 * Full tag identifier — used as the stable key for frontend mapping
 */
export function tagIdentifier(tag: Pick<Tag, 'group' | 'key'>): string {
  return `${tag.group}:${tag.key}`;
}

const createTagSchema = tagSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateTag = z.infer<typeof createTagSchema>;

export {
  tagGroupSchema as TagGroupSchema,
  tagScopeSchema as TagScopeSchema,
  tagSchema as TagSchema,
  createTagSchema as CreateTagSchema,
};
