import { db } from "@findeg/db";
import {
  schoolLists,
  schoolListItems,
  schoolListItemAlternatives,
  productVariants,
  variantAttributes,
  attributeDefinitions,
  productTags,
} from "@findeg/db/schema";
import {
  ISchoolListRepository,
  SchoolListResult,
  SchoolListItemResult,
  SchoolListInput,
  SchoolListItemInput,
} from "../../application/interfaces/ISchoolListRepository";
import { DrizzleVariantRepository } from "./DrizzleVariantRepository";
import { eq, and, sql, inArray, or } from "drizzle-orm";
import { ID } from "@findeg/backend/features/core/domain/types/common";
import { Variant } from "../../domain/entities/Variant";

/**
 * Drizzle School List Repository
 *
 * Implements the school listing engine and the attribute-based matching logic.
 */
export class DrizzleSchoolListRepository implements ISchoolListRepository {
  private variantRepo = new DrizzleVariantRepository();

  async getBySlug(slug: string): Promise<SchoolListResult | null> {
    const [result] = await db.select().from(schoolLists).where(eq(schoolLists.slug, slug)).limit(1);

    if (!result) return null;
    return result as SchoolListResult;
  }

  async getById(id: ID): Promise<SchoolListResult | null> {
    const [result] = await db.select().from(schoolLists).where(eq(schoolLists.id, id)).limit(1);

    if (!result) return null;
    return result as SchoolListResult;
  }

  async getAll(): Promise<SchoolListResult[]> {
    const results = await db.select().from(schoolLists);
    return results as SchoolListResult[];
  }

  async getActive(): Promise<SchoolListResult[]> {
    const results = await db.select().from(schoolLists).where(eq(schoolLists.isActive, true));
    return results as SchoolListResult[];
  }

  async create(input: SchoolListInput): Promise<SchoolListResult> {
    const [result] = await db.insert(schoolLists).values(input).returning();
    return result as SchoolListResult;
  }

  async update(id: ID, input: Partial<SchoolListInput>): Promise<SchoolListResult> {
    const [result] = await db
      .update(schoolLists)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(schoolLists.id, id))
      .returning();
    return result as SchoolListResult;
  }

  /**
   * Deletes a school list and cascading items.
   */
  async delete(id: ID): Promise<void> {
    await db.delete(schoolLists).where(eq(schoolLists.id, id));
  }

  async getItem(id: ID): Promise<SchoolListItemResult | null> {
    const [result] = await db
      .select()
      .from(schoolListItems)
      .where(eq(schoolListItems.id, id))
      .limit(1);

    if (!result) return null;
    return {
      ...result,
      localizedLabel: result.localizedLabel as Record<string, string>,
      matchRules: result.matchRules as Record<string, unknown>,
    } as SchoolListItemResult;
  }

  /**
   * Gets all items for a school list, with hydrated alternatives.
   */
  async getItemsWithAlternatives(listId: ID): Promise<SchoolListItemResult[]> {
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

    const variantIds = Array.from(new Set(alts.map((a) => a.variantId)));
    const variants = await Promise.all(variantIds.map((id) => this.variantRepo.getById(id)));
    const variantMap = Object.fromEntries(
      variants.filter((v) => v !== null).map((v) => [v!.id, v]),
    );

    return items.map((item) => {
      const itemAlts = alts.filter((a) => a.listItemId === item.id);
      return {
        ...item,
        localizedLabel: item.localizedLabel as Record<string, string>,
        matchRules: item.matchRules as Record<string, unknown>,
        alternatives: itemAlts.map((a) => ({
          ...a,
          variant: variantMap[a.variantId],
        })),
      };
    }) as SchoolListItemResult[];
  }

  async addItem(listId: ID, input: SchoolListItemInput): Promise<SchoolListItemResult> {
    const [result] = await db
      .insert(schoolListItems)
      .values({
        ...input,
        schoolListId: listId,
      })
      .returning();
    return {
      ...result,
      localizedLabel: result.localizedLabel as Record<string, string>,
      matchRules: result.matchRules as Record<string, unknown>,
    } as SchoolListItemResult;
  }

  /**
   * Sets the pre-curated alternative variants for a list item.
   */
  async setAlternatives(
    itemId: ID,
    alternatives: { variantId: ID; isDefault: boolean }[],
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

  /**
   * Auto-matches variants using attribute-based match rules.
   * This is a complex dynamic query engine.
   */
  async matchVariants(matchRules: any): Promise<Variant[]> {
    const conditions = [];

    // Category filter
    if (matchRules.categoryId) {
      // In a real scenario, we might want to check the category path for descendants
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
        sql`EXISTS (SELECT 1 FROM product_tags JOIN tags ON tags.id = product_tags.tag_id WHERE product_tags.product_id = ${productVariants.productId} AND tags.name IN ${matchRules.tags})`,
      );
    }

    // Attribute filters (Dynamic intersection)
    if (matchRules.attributes) {
      for (const [key, value] of Object.entries(matchRules.attributes)) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM variant_attributes 
            JOIN attribute_definitions ON attribute_definitions.id = variant_attributes.attribute_id 
            WHERE variant_attributes.variant_id = ${productVariants.id} 
              AND attribute_definitions.key = ${key} 
              AND (variant_attributes.value_text = ${String(value)} OR variant_attributes.value_num = ${String(value)})
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

    if (results.length === 0) return [];

    const variants = await Promise.all(results.map((r) => this.variantRepo.getById(r.id)));
    return variants.filter((v) => v !== null) as Variant[];
  }
}
