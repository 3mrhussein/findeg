/**
 * School List Repository Interface
 *
 * Defines the contract for school list data access,
 * including the attribute-based variant matching engine.
 */

import { type ID } from '@findeg/backend/features/core/domain/types/common';
import type { Variant } from '../../domain/entities/Variant';
import { type MatchRulesDraft } from '@findeg/db';
import { Locale, PartialTranslationMap } from '@findeg/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SchoolListResult {
  id: ID;
  slug: string;
  schoolName: string;
  grade: string;
  academicYear: string;
  governorate: string | null;
  area: string | null;
  schoolType: string | null;
  academicSystem: string | null;
  localizedTitle: PartialTranslationMap;
  localizedDescription: PartialTranslationMap | null;
  heroImageUrl: string | null;
  isActive: boolean;
  publishedAt: Date | null;
  items?: SchoolListItemResult[];
}

export interface SchoolListItemResult {
  id: ID;
  displayOrder: number;
  localizedLabel: Record<Locale, string>;
  categoryId?: ID;
  quantityRequired: number;
  isLocked: boolean;
  matchRules?: MatchRulesDraft;
  alternatives?: SchoolListAlternativeResult[];
}

export interface SchoolListAlternativeResult {
  id: ID;
  variantId: ID;
  isDefault: boolean;
  displayOrder: number;
  /** Hydrated variant data */
  variant?: Variant;
}

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface SchoolListInput {
  slug: string;
  schoolName: string;
  grade: string;
  academicYear: string;
  localizedTitle: Record<Locale, string>;
  localizedDescription?: Record<Locale, string>;
  heroImageUrl?: string;
  isActive?: boolean;
}

export interface SchoolListItemInput {
  displayOrder?: number;
  localizedLabel: Record< Locale, string>;
  categoryId?: ID;
  quantityRequired?: number;
  isLocked?: boolean;
  matchRules?: MatchRulesDraft;
}

// ─── Interface ───────────────────────────────────────────────────────────────

export interface ISchoolListRepository {
  /** Gets a school list by its deep-link slug */
  getBySlug(slug: string): Promise<SchoolListResult | null>;

  /** Gets all school lists */
  getAll(): Promise<SchoolListResult[]>;

  /** Gets only active/published school lists */
  getActive(): Promise<SchoolListResult[]>;

  /** Creates a new school list */
  create(input: SchoolListInput): Promise<SchoolListResult>;

  /** Updates an existing school list */
  update(id: ID, input: Partial<SchoolListInput>): Promise<SchoolListResult>;

  /** Deletes a school list and cascading items */
  delete(id: ID): Promise<void>;

  /**
   * Gets a school list by its ID.
   */
  getById(id: ID): Promise<SchoolListResult | null>;

  /**
   * Gets a single list item by ID.
   */
  getItem(id: ID): Promise<SchoolListItemResult | null>;

  /** Gets all items for a school list, with hydrated alternatives */
  getItemsWithAlternatives(listId: ID): Promise<SchoolListItemResult[]>;

  /** Adds an item to a school list */
  addItem(listId: ID, input: SchoolListItemInput): Promise<SchoolListItemResult>;

  /** Sets the pre-curated alternative variants for a list item */
  setAlternatives(itemId: ID, alternatives: { variantId: ID; isDefault: boolean }[]): Promise<void>;

  /** Auto-matches variants using attribute-based match rules */
  matchVariants(matchRules: MatchRulesDraft): Promise<Variant[]>;
}
