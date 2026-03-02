/**
 * Domain Entity: SchoolList
 *
 * Represents a school supply list. Schools or parents create these lists
 * to group together the items students need for a specific grade/year.
 */

import { z } from "zod";
import { IdSchema, LocalizedStringSchema, type ID } from "@/features/core/domain/types/common";
import { VariantSchema, type Variant } from "./Variant";

// ─── School List Item Alternative ───────────────────────────────────────────

export const SchoolListAlternativeSchema = z.object({
  id: IdSchema,
  variantId: IdSchema,
  isDefault: z.boolean().default(false),
  displayOrder: z.number().default(0),
  /** Hydrated variant data */
  variant: VariantSchema.optional(),
});
export type SchoolListAlternative = z.infer<typeof SchoolListAlternativeSchema>;

// ─── School List Item ────────────────────────────────────────────────────────

export const SchoolListItemSchema = z.object({
  id: IdSchema,
  displayOrder: z.number().default(0),
  localizedLabel: LocalizedStringSchema,
  categoryId: IdSchema.optional(),
  quantityRequired: z.number().int().positive().default(1),
  isLocked: z.boolean().default(false),
  /** JSON match rules for auto-matching variants */
  matchRules: z.record(z.string(), z.unknown()).optional(),
  /** Pre-curated alternatives */
  alternatives: z.array(SchoolListAlternativeSchema).optional(),
});
export type SchoolListItem = z.infer<typeof SchoolListItemSchema>;

// ─── School List ─────────────────────────────────────────────────────────────

export const SchoolListSchema = z.object({
  id: IdSchema,
  slug: z.string().min(1),
  schoolName: z.string().min(1),
  grade: z.string().min(1),
  academicYear: z.string().min(1),
  localizedTitle: LocalizedStringSchema,
  localizedDescription: LocalizedStringSchema.optional(),
  heroImageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  publishedAt: z.date().optional(),
  items: z.array(SchoolListItemSchema).optional(),
});
export type SchoolList = z.infer<typeof SchoolListSchema>;

/**
 * Domain methods for SchoolList entity
 */
export class SchoolListEntity {
  /**
   *
   */
  constructor(private schoolList: SchoolList) {}

  /** Returns the total number of items in the list */
  getItemCount(): number {
    return this.schoolList.items?.length ?? 0;
  }

  /** Gets all items in display order */
  getSortedItems(): SchoolListItem[] {
    return [...(this.schoolList.items ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /** Returns the raw data */
  getData(): SchoolList {
    return this.schoolList;
  }
}
