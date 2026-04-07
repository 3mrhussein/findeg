import { z } from "zod";
import { IdSchema, SlugSchema, type ID, type Slug } from "../../../core/domain/types/common";
import { LocalizedStringSchema, type LocalizedString } from "../../../core/domain/value-objects";
import { type SupportedLocale } from "../../../core/domain/types/locale";

export const CategoryLocalizedContentSchema = z.object({
  name: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
});
export type CategoryLocalizedContent = z.infer<typeof CategoryLocalizedContentSchema>;

export const CategorySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: IdSchema,
    slug: SlugSchema,
    name: z.string(),
    description: z.string().optional(),
    locale: z.string().optional(), // Locale
    localizedContent: CategoryLocalizedContentSchema.optional(),
    image: z.string().optional(),
    imageUrl: z.string().optional(),
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
  imageUrl?: string;
  icon?: string;
  parentId?: ID;
  path?: string;
  depth?: number;
  sortOrder?: number;
  isActive?: boolean;
  children?: Category[];
};

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

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: IdSchema,
});
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;

export class CategoryEntity {
  constructor(private category: Category) {}

  getName(locale: SupportedLocale): string {
    return (
      this.category.localizedContent?.name?.[locale] ??
      this.category.localizedContent?.name?.en ??
      this.category.name
    );
  }

  getSlug(locale: SupportedLocale): string {
    return this.category.slug;
  }

  getDescription(locale: SupportedLocale): string {
    return (
      this.category.localizedContent?.description?.[locale] ??
      this.category.localizedContent?.description?.en ??
      this.category.description ??
      ""
    );
  }
}
