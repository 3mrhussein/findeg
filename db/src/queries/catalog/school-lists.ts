/**
 * Query Primitives for School Lists
 *
 * Pure database queries for school listing and variant matching.
 * No ORM abstraction - direct Drizzle SQL operations.
 * 
 * Note: Returns raw database rows. Domain mapping and variant hydration handled by SchoolListService.
 */

import { db } from '../../connection';
import {
  schoolLists,
  schoolListItems,
  schoolListItemAlternatives,
  productVariants,
} from '../../schema';
import { type MatchRulesDraft, type TranslationMap, type ID } from '@findeg/db';
import { eq, and, sql, inArray } from 'drizzle-orm';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SchoolListRow = typeof schoolLists.$inferSelect;
export type SchoolListItemRow = typeof schoolListItems.$inferSelect;
export type SchoolListItemAlternativeRow = typeof schoolListItemAlternatives.$inferSelect;

export interface SchoolListInput {
  slug: string;
  schoolName: string;
  grade: string;
  academicYear: string;
  localizedTitle: TranslationMap;
  localizedDescription?: TranslationMap;
  heroImageUrl?: string;
  isActive?: boolean;
}

export interface SchoolListItemInput {
  displayOrder?: number;
  localizedLabel: TranslationMap;
  categoryId?: ID;
  quantityRequired?: number;
  isLocked?: boolean;
  matchRules?: MatchRulesDraft;
}

// ─── Query Functions ─────────────────────────────────────────────────────────

export async function getBySlug(slug: string): Promise<SchoolListRow | null> {
  const [result] = await db.select().from(schoolLists).where(eq(schoolLists.slug, slug)).limit(1);
  return result || null;
}

export async function getById(id: number): Promise<SchoolListRow | null> {
  const [result] = await db.select().from(schoolLists).where(eq(schoolLists.id, id)).limit(1);
  return result || null;
}

export async function getAll(): Promise<SchoolListRow[]> {
  return db.select().from(schoolLists);
}

export async function getActive(): Promise<SchoolListRow[]> {
  return db.select().from(schoolLists).where(eq(schoolLists.isActive, true));
}

export async function create(input: SchoolListInput): Promise<SchoolListRow> {
  const [result] = await db.insert(schoolLists).values(input).returning();
  return result;
}

export async function update(id: number, input: Partial<SchoolListInput>): Promise<SchoolListRow> {
  const [result] = await db
    .update(schoolLists)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schoolLists.id, id))
    .returning();
  return result;
}

export async function deleteById(id: number): Promise<void> {
  await db.delete(schoolLists).where(eq(schoolLists.id, id));
}

// ─── Item Operations ─────────────────────────────────────────────────────────

export async function getItem(id: number): Promise<SchoolListItemRow | null> {
  const [result] = await db
    .select()
    .from(schoolListItems)
    .where(eq(schoolListItems.id, id))
    .limit(1);
  return result || null;
}

/**
 * Gets all items for a school list with their alternatives
 */
export async function getItemsWithAlternatives(
  listId: number,
): Promise<(SchoolListItemRow & { alternatives: SchoolListItemAlternativeRow[] })[]> {
  const items = await db
    .select()
    .from(schoolListItems)
    .where(eq(schoolListItems.schoolListId, listId))
    .orderBy(schoolListItems.displayOrder);

  if (items.length === 0) return [];

  const itemIds = items.map((i) => i.id);

  const alts = await db
    .select()
    .from(schoolListItemAlternatives)
    .where(inArray(schoolListItemAlternatives.listItemId, itemIds))
    .orderBy(schoolListItemAlternatives.displayOrder);

  return items.map((item) => {
    const itemAlts = alts.filter((a) => a.listItemId === item.id);
    return {
      ...item,
      alternatives: itemAlts,
    };
  });
}

export async function addItem(
  listId: number,
  input: SchoolListItemInput,
): Promise<SchoolListItemRow> {
  const [result] = await db
    .insert(schoolListItems)
    .values({
      ...input,
      schoolListId: listId,
    })
    .returning();
  return result;
}

/**
 * Sets the pre-curated alternative variants for a list item
 */
export async function setAlternatives(
  itemId: number,
  alternatives: { variantId: number; isDefault: boolean }[],
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .delete(schoolListItemAlternatives)
      .where(eq(schoolListItemAlternatives.listItemId, itemId));

    if (alternatives.length > 0) {
      await tx.insert(schoolListItemAlternatives).values(
        alternatives.map((a, idx) => ({
          listItemId: itemId,
          variantId: a.variantId,
          isDefault: a.isDefault,
          displayOrder: idx,
        })),
      );
    }
  });
}

// ─── Variant Matching ────────────────────────────────────────────────────────

/**
 * Auto-matches variant IDs using attribute-based match rules.
 * Returns only variant IDs; service hydrates the full variant data.
 */
export async function matchVariantIds(matchRules: MatchRulesDraft): Promise<number[]> {
  const conditions = [];

  // Category filter
  if (matchRules.categoryId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM products WHERE products.id = ${productVariants.productId} AND products.category_id = ${matchRules.categoryId})`,
    );
  }

  // Brand filter
  if (matchRules.brandIds && matchRules.brandIds.length > 0) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM products WHERE products.id = ${productVariants.productId} AND products.brand_id IN ${matchRules.brandIds})`,
    );
  }

  // Tag filter
  if (matchRules.tags && matchRules.tags.length > 0) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM product_tags JOIN tags ON tags.id = product_tags.tag_id WHERE product_tags.product_id = ${productVariants.productId} AND tags.key IN ${matchRules.tags})`,
    );
  }

  // Attribute filters (Dynamic intersection)
  if (matchRules.attributes) {
    for (const [key, value] of Object.entries(matchRules.attributes)) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM variant_attributes 
          JOIN attributes ON attributes.id = variant_attributes.attribute_id 
          WHERE variant_attributes.variant_id = ${productVariants.id} 
            AND attributes.key = ${key} 
            AND variant_attributes.value_text = ${String(value)}
        )`,
      );
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(whereClause)
    .limit(50);

  return results.map((r) => r.id);
}
