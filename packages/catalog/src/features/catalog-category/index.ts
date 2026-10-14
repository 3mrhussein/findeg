import { z } from 'zod';
import {
  IdSchema as idSchema,
  SlugSchema as slugSchema,
  type ID,
  type Slug,
} from '@findeg/db/types';
import type { Locale } from '@findeg/domain';
import { TranslationMapSchema as translationMapSchema, pick } from '../../helpers/index';

const categoryLocalizedContentSchema = z.object({
  name: translationMapSchema,
  description: translationMapSchema.optional(),
});
export type CategoryLocalizedContent = z.infer<typeof categoryLocalizedContentSchema>;

const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: idSchema,
    slug: slugSchema,
    name: z.string(),
    description: z.string().optional(),
    locale: z.string().optional(), // Locale
    localizedContent: categoryLocalizedContentSchema.optional(),
    image: z.string().optional(),
    imageUrl: z.string().optional(),
    icon: z.string().optional(),
    parentId: idSchema.optional(),
    path: z.string().optional(),
    depth: z.number().optional(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
    children: z.array(categorySchema).optional(),
    productCount: z.number().optional(),
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
  productCount?: number;
};

const createCategorySchema = z.object({
  slug: slugSchema,
  name: z.string(),
  description: z.string().optional(),
  localizedContent: categoryLocalizedContentSchema.optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  parentId: idSchema.optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});
export type CreateCategory = z.infer<typeof createCategorySchema>;

const updateCategorySchema = createCategorySchema.partial().extend({
  id: idSchema,
});
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export class CategoryEntity {
  constructor(private category: Category) {}

  getName(locale: Locale): string {
    return pick(this.category.localizedContent?.name, locale) || this.category.name;
  }

  getSlug(): string {
    return this.category.slug;
  }

  getDescription(locale: Locale): string {
    return (
      pick(this.category.localizedContent?.description, locale) || this.category.description || ''
    );
  }
}

export {
  categoryLocalizedContentSchema as CategoryLocalizedContentSchema,
  categorySchema as CategorySchema,
  createCategorySchema as CreateCategorySchema,
  updateCategorySchema as UpdateCategorySchema,
};
