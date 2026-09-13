/**
 * CategoryForm — shared types & interfaces
 */
import * as z from 'zod';

export const categoryFormSchema = z.object({
  name_en: z.string().min(2, 'Name (EN) must be at least 2 characters'),
  description_en: z.string().optional(),
  name_ar: z.string().min(2, 'Name (AR) must be at least 2 characters'),
  description_ar: z.string().optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export interface CategoryFormProps {
  initialData?: any;
  categories: { id: number; slug: string; name: string }[];
}
