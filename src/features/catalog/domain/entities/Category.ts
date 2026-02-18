/**
 * Domain Entity: Category
 *
 * Represents a product category with hierarchical structure.
 */

import { ID, Slug } from "@/features/core/domain/types/common";
import type { Locale, LocalizedString } from "@/features/core/domain/value-objects";

export type TranslatedCategoryName = LocalizedString;
export type TranslatedCategoryDescription = LocalizedString;
export type TranslatedCategorySlug = LocalizedString;

/**
 * Localized category text payload.
 */
export interface CategoryLocalizedContent {
  slug: TranslatedCategorySlug;
  name: TranslatedCategoryName;
  description?: TranslatedCategoryDescription;
}

/**
 * Category Domain Interface
 *
 * @property path - Materialized path for efficient tree queries (e.g., "/1/3/7")
 * @property depth - Nesting level (0 = root)
 * @property sortOrder - Display order among sibling categories
 */
export interface Category {
  id: ID;
  slug: Slug;
  name: string;
  description?: string;
  /**
   * Locale used to resolve the string fields (name/description).
   */
  locale?: Locale;
  /**
   * Full or partial map of localized content.
   */
  localizedContent?: CategoryLocalizedContent;
  image?: string;
  icon?: string;
  parentId?: ID;
  path?: string;
  depth?: number;
  sortOrder?: number;
  isActive?: boolean;
  children?: Category[];
}
