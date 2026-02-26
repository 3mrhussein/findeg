import { z } from "zod";
import { IdSchema, SlugSchema, type ID, type Slug } from "@/features/core/domain/types/common";
import {
  LocalizedStringSchema,
  type Locale,
  type LocalizedString,
} from "@/features/core/domain/value-objects";

/** Localized category text payload */
export const CategoryLocalizedContentSchema = z.object({
  slug: LocalizedStringSchema,
  name: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
});
export type CategoryLocalizedContent = z.infer<typeof CategoryLocalizedContentSchema>;

/**
 * Category Domain Schema
 */
export const CategorySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: IdSchema,
    slug: SlugSchema,
    name: z.string(),
    description: z.string().optional(),
    locale: z.string().optional(), // Locale
    localizedContent: CategoryLocalizedContentSchema.optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    parentId: IdSchema.optional(),
    path: z.string().optional(),
    depth: z.number().optional(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
    children: z.array(CategorySchema).optional(),
  }),
);

export type Category = {
  id: ID;
  slug: Slug;
  name: string;
  description?: string;
  locale?: string;
  localizedContent?: CategoryLocalizedContent;
  image?: string;
  icon?: string;
  parentId?: ID;
  path?: string;
  depth?: number;
  sortOrder?: number;
  isActive?: boolean;
  children?: Category[];
};

/** Create Category Input */
export const CreateCategorySchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  description: z.string().optional(),
  localizedContent: CategoryLocalizedContentSchema.optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  parentId: IdSchema.optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});
export type CreateCategory = z.infer<typeof CreateCategorySchema>;

/** Update Category Input */
export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: IdSchema,
});
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
