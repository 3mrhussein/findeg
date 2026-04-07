import {
  type ISchoolListRepository,
  type SchoolListResult,
  type SchoolListItemResult,
  type SchoolListInput,
  type SchoolListItemInput,
} from "../interfaces/ISchoolListRepository";
import { Variant } from "../../domain/entities/Variant";
import { ID } from "@backend/features/core/domain/types/common";

export interface ISchoolListService {
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
  constructor(private schoolListRepo: ISchoolListRepository) {}

  async getListBySlug(slug: string): Promise<SchoolListResult | null> {
    const list = await this.schoolListRepo.getBySlug(slug);
    if (!list) return null;

    // Hydrate the items and alternatives for the public view
    const items = await this.schoolListRepo.getItemsWithAlternatives(list.id);
    return {
      ...list,
      items,
    };
  }

  async getActiveLists(): Promise<SchoolListResult[]> {
    return this.schoolListRepo.getActive();
  }

  async getAllLists(): Promise<SchoolListResult[]> {
    return this.schoolListRepo.getAll();
  }

  async createList(input: SchoolListInput): Promise<SchoolListResult> {
    return this.schoolListRepo.create(input);
  }

  async updateList(id: ID, input: Partial<SchoolListInput>): Promise<SchoolListResult> {
    return this.schoolListRepo.update(id, input);
  }

  async deleteList(id: ID): Promise<void> {
    return this.schoolListRepo.delete(id);
  }

  async addItem(listId: ID, input: SchoolListItemInput): Promise<SchoolListItemResult> {
    return this.schoolListRepo.addItem(listId, input);
  }

  async setAlternatives(
    itemId: ID,
    alternatives: { variantId: ID; isDefault: boolean }[],
  ): Promise<void> {
    return this.schoolListRepo.setAlternatives(itemId, alternatives);
  }

  async getSuggestionsForItem(itemId: ID): Promise<Variant[]> {
    const item = await this.schoolListRepo.getItem(itemId);
    if (!item || !item.matchRules) return [];

    return this.schoolListRepo.matchVariants(item.matchRules);
  }
}
