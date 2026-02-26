import { z } from "zod";
import { IdSchema, SlugSchema, type ID, type Slug } from "@/features/core/domain/types/common";
import {
  LocalizedStringSchema,
  type Locale,
  type LocalizedString,
} from "@/features/core/domain/value-objects";

/** Localized brand text payload */
export const BrandLocalizedContentSchema = z.object({
  slug: LocalizedStringSchema,
  name: LocalizedStringSchema,
});
export type BrandLocalizedContent = z.infer<typeof BrandLocalizedContentSchema>;

/**
 * Brand Domain Schema
 */
export const BrandSchema = z.object({
  id: IdSchema,
  slug: SlugSchema,
  name: z.string(),
  locale: z.string().optional(), // Locale
  localizedContent: BrandLocalizedContentSchema.optional(),
  logoUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Brand = z.infer<typeof BrandSchema>;

/** Create Brand Input */
export const CreateBrandSchema = BrandSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateBrand = z.infer<typeof CreateBrandSchema>;

/** Update Brand Input */
export const UpdateBrandSchema = CreateBrandSchema.partial().extend({
  id: IdSchema,
});
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>;
