/**
 * Local Dashboard Input Types
 *
 * These types were originally in backend but had to be moved here because:
 * 1. Backend input schemas use @ imports (e.g., TagScopeSchema from catalog domain)
 * 2. Turbopack cannot resolve @ imports when bundling workspace packages
 * 3. Apps must define their own input types to avoid bundling issues
 *
 * NOTE: Keep these in sync with backend domain entities when possible.
 */

import { z } from "zod";

/**
 * Tag Input Schema
 *
 * Used for creating/updating tags in the dashboard.
 */
export const TagInputSchema = z.object({
  group: z.string().min(1, "Group is required"),
  key: z.string().min(1, "Key is required"),
  slug: z.string().min(1, "Slug is required"),
  icon: z.string().default(""),
  color: z.string().default(""),
  isActive: z.boolean().default(true),
  scope: z
    .enum(["catalog", "search", "editorial", "system", "school", "campaign"])
    .default("catalog"),
});

export type TagInput = z.infer<typeof TagInputSchema>;

/**
 * Brand Input Schema
 *
 * Used for creating/updating brands in the dashboard.
 */
export const BrandInputSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().default(""),
  descriptionEn: z.string().default(""),
  descriptionAr: z.string().default(""),
  logoUrl: z.string().default(""),
  isActive: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof BrandInputSchema>;

/**
 * Collection Input Schema
 *
 * Used for creating/updating collections in the dashboard.
 */
export const CollectionInputSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  localizedTitle: z.object({
    en: z.string().min(1, "English title is required"),
    ar: z.string().default(""),
  }),
  localizedSubtitle: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  heroImageUrl: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  tagIds: z.array(z.number()).default([]),
});

export type CollectionInput = z.infer<typeof CollectionInputSchema>;

/**
 * Category Input Schema
 *
 * Used for creating/updating categories in the dashboard.
 */
export const CategoryInputSchema = z.object({
  name: z
    .object({
      en: z.string().min(1, "English name is required"),
      ar: z.string().min(1, "Arabic name is required"),
    })
    .optional(),
  slug: z.string().min(1, "Slug is required"),
  description: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  parentId: z.number().nullable().default(null),
  image: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().default(true),
  translations: z
    .array(
      z.object({
        language: z.string(),
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;
