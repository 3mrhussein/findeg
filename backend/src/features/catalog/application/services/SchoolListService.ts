import { schoolListQueries } from '@findeg/db/queries';
import { productQueries } from '@findeg/db/queries';
import { ID } from '@findeg/backend/features/core/domain/types/common';
import {
  type SchoolListResult,
  type SchoolListItemResult,
  type SchoolListInput,
  type SchoolListItemInput,
} from '../interfaces/ISchoolListRepository';
import { Variant } from '../../domain/entities/Variant';
import { type TranslationMap } from '@findeg/db/types';
import { type MatchRulesDraft } from '@findeg/db';

export interface ISchoolListService {
  /** Gets a school list by ID without item hydration (Admin/Internal) */
  getListById(id: ID): Promise<SchoolListResult | null>;

  /** Gets a school list by slug with hydrated items and alternatives */
  getListBySlug(slug: string): Promise<SchoolListResult | null>;

  /** Lists all active school lists */
  getActiveLists(): Promise<SchoolListResult[]>;

  /** Lists all school lists (Admin) */
  getAllLists(): Promise<SchoolListResult[]>;

  /** Creates a new school list (Admin) */
  createList(input: SchoolListInput): Promise<SchoolListResult>;

  /** Updates an existing school list (Admin) */
  updateList(id: ID, input: Partial<SchoolListInput>): Promise<SchoolListResult>;

  /** Deletes a school list (Admin) */
  deleteList(id: ID): Promise<void>;

  /** Adds an item to a list (Admin) */
  addItem(listId: ID, input: SchoolListItemInput): Promise<SchoolListItemResult>;

  /** Sets pre-curated alternatives for an item (Admin) */
  setAlternatives(itemId: ID, alternatives: { variantId: ID; isDefault: boolean }[]): Promise<void>;

  /** Suggests variants based on an item's match rules (Admin/Internal) */
  getSuggestionsForItem(itemId: ID): Promise<Variant[]>;
}

export class SchoolListService implements ISchoolListService {
  private mapVariantToDomain(variant: productQueries.VariantRow): Variant {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      variantKey: variant.variantKey,
      localizedLabel: variant.localizedLabel as Variant['localizedLabel'],
      sortOrder: variant.sortOrder,
      isDefault: variant.isDefault,
      mediaSet: variant.mediaSet as Variant['mediaSet'],
      isActive: variant.isActive,
      basePrice: String(variant.basePrice),
      strikePrice: variant.strikePrice ? String(variant.strikePrice) : undefined,
      costPrice: variant.costPrice ? String(variant.costPrice) : undefined,
      weightGrams: variant.weightGrams || undefined,
      barcode: variant.barcode || undefined,
      images: [],
      attributes: [],
    };
  }

  async getListById(id: ID): Promise<SchoolListResult | null> {
    const list = await schoolListQueries.getById(id);
    if (!list) return null;

    // Return without items hydration (used by SchoolAccessService for access checks)
    return {
      ...(list as any),
    } as SchoolListResult;
  }

  async getListBySlug(slug: string): Promise<SchoolListResult | null> {
    const list = await schoolListQueries.getBySlug(slug);
    if (!list) return null;

    // Hydrate the items and alternatives for the public view
    const itemsWithAlts = await schoolListQueries.getItemsWithAlternatives(list.id);
    
    // Hydrate variants for alternatives
    const allVariantIds = Array.from(
      new Set(itemsWithAlts.flatMap((i) => i.alternatives.map((a) => a.variantId))),
    );
    const variants = await productQueries.getVariantsByIds(allVariantIds);
    const variantMap = new Map(variants.map((variant) => [variant.id, this.mapVariantToDomain(variant)]));

    const items: SchoolListItemResult[] = itemsWithAlts.map((item) => ({
      ...item,
      localizedLabel: item.localizedLabel as TranslationMap,
      matchRules: item.matchRules as MatchRulesDraft,
      alternatives: item.alternatives.map((a) => ({
        ...a,
        variant: variantMap.get(a.variantId),
      })),
    })) as unknown as SchoolListItemResult[];

    return {
      ...(list as any),
      items,
    } as SchoolListResult;
  }

  async getActiveLists(): Promise<SchoolListResult[]> {
    return schoolListQueries.getActive() as Promise<SchoolListResult[]>;
  }

  async getAllLists(): Promise<SchoolListResult[]> {
    return schoolListQueries.getAll() as Promise<SchoolListResult[]>;
  }

  async createList(input: SchoolListInput): Promise<SchoolListResult> {
    return schoolListQueries.create(input) as Promise<SchoolListResult>;
  }

  async updateList(id: ID, input: Partial<SchoolListInput>): Promise<SchoolListResult> {
    return schoolListQueries.update(id, input) as Promise<SchoolListResult>;
  }

  async deleteList(id: ID): Promise<void> {
    return schoolListQueries.deleteById(id);
  }

  async addItem(listId: ID, input: SchoolListItemInput): Promise<SchoolListItemResult> {
    return schoolListQueries.addItem(listId, input) as Promise<SchoolListItemResult>;
  }

  async setAlternatives(
    itemId: ID,
    alternatives: { variantId: ID; isDefault: boolean }[],
  ): Promise<void> {
    return schoolListQueries.setAlternatives(itemId, alternatives);
  }

  async getSuggestionsForItem(itemId: ID): Promise<Variant[]> {
    const item = await schoolListQueries.getItem(itemId);
    if (!item || !item.matchRules) return [];

    const variantIds = await schoolListQueries.matchVariantIds(item.matchRules);
    if (variantIds.length === 0) return [];

    const variants = await productQueries.getVariantsByIds(variantIds);
    return variants.map((variant) => this.mapVariantToDomain(variant));
  }
}
