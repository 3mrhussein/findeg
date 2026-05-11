import { z } from 'zod';
import { TagScopeSchema } from '../../../catalog/domain/entities/Tag';

export const TagInputSchema = z.object({
  group: z.string().min(1, 'Group is required'),
  key: z.string().min(1, 'Key is required'),
  slug: z.string().min(1, 'Slug is required'),
  icon: z.string().default(''),
  color: z.string().default(''),
  isActive: z.boolean().default(true),
  scope: TagScopeSchema.default('catalog'),
});

export type TagInput = z.infer<typeof TagInputSchema>;