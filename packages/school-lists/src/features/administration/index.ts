import {
  SupplyListIdSchema as supplyListIdSchema,
  SupplyListItemSchema as supplyListItemSchema,
} from '@findeg/db';
import { canReadSupplyLists, canWriteSupplyLists } from '../permissions';
import type {
  CreateSupplyListDraftInput,
  ISchoolSupplyListService,
  ListOfferInput,
  SupplyListItemInput,
  SupplyListStaffActor,
  UpdateSupplyListDraftInput,
} from '../../types';
import type {
  IAdminSchoolSupplyListService,
  SchoolSupplyListIndexFilters,
  SchoolSupplyListIndexRow,
  SchoolListPartnerOption,
  SpecificationOption,
  SpecificationVariantCandidate,
} from '../../types';

type SpecificationOptionsQuery = (categoryId: number) => Promise<SpecificationOption[]>;
type VariantCandidatesQuery = (categoryId: number) => Promise<SpecificationVariantCandidate[]>;
type ListAllQuery = (filters?: SchoolSupplyListIndexFilters) => Promise<SchoolSupplyListIndexRow[]>;

const forbidden = () => ({ success: false as const, error: 'forbidden' as const });
const invalid = () => ({ success: false as const, error: 'invalid-input' as const });

export class AdminSchoolSupplyListService implements IAdminSchoolSupplyListService {
  constructor(
    private readonly lifecycle: ISchoolSupplyListService,
    private readonly querySpecificationOptions: SpecificationOptionsQuery,
    private readonly queryVariantCandidates: VariantCandidatesQuery,
    private readonly queryListAll?: ListAllQuery,
    private readonly queryPartnerOptions: () => Promise<SchoolListPartnerOption[]> = () =>
      Promise.resolve([]),
  ) {}

  async listPartnerOptions(actor: SupplyListStaffActor) {
    if (!canReadSupplyLists(actor)) return forbidden();
    return { success: true as const, data: await this.queryPartnerOptions() };
  }

  async listAll(actor: SupplyListStaffActor, filters: SchoolSupplyListIndexFilters = {}) {
    if (!canReadSupplyLists(actor)) return forbidden();
    if (!this.queryListAll) return { success: true as const, data: [] };
    return { success: true as const, data: await this.queryListAll(filters) };
  }

  // These two queries back the authoring picker, so they need write access; read-only Staff are refused on purpose.
  async listSpecificationOptions(actor: SupplyListStaffActor, categoryId: number) {
    return this.authoringQuery(actor, categoryId, this.querySpecificationOptions);
  }

  async listVariantCandidates(actor: SupplyListStaffActor, categoryId: number) {
    return this.authoringQuery(actor, categoryId, this.queryVariantCandidates);
  }

  async createDraft(actor: SupplyListStaffActor, input: CreateSupplyListDraftInput) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.createDraft(actor, input);
  }

  async cloneToDraft(
    actor: SupplyListStaffActor,
    sourceListId: number,
    input?: UpdateSupplyListDraftInput,
  ) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.cloneToDraft(actor, sourceListId, input);
  }

  async updateDraft(
    actor: SupplyListStaffActor,
    listId: number,
    input: UpdateSupplyListDraftInput,
  ) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.updateDraft(actor, listId, input);
  }

  async addItem(actor: SupplyListStaffActor, listId: number, input: SupplyListItemInput) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    const parsed = supplyListItemSchema.safeParse(input);
    if (!parsed.success || !(await this.specificationExists(parsed.data))) {
      return invalid();
    }
    return this.lifecycle.addItem(actor, listId, parsed.data);
  }

  async updateItem(
    actor: SupplyListStaffActor,
    listId: number,
    itemId: number,
    input: Partial<SupplyListItemInput>,
  ) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    const parsed = supplyListItemSchema.partial().safeParse(input);
    if (!parsed.success || !(await this.specificationExists(parsed.data))) {
      return invalid();
    }
    return this.lifecycle.updateItem(actor, listId, itemId, parsed.data);
  }

  async removeItem(actor: SupplyListStaffActor, listId: number, itemId: number) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.removeItem(actor, listId, itemId);
  }

  async reorderItems(actor: SupplyListStaffActor, listId: number, itemIds: number[]) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.reorderItems(actor, listId, itemIds);
  }

  async publish(actor: SupplyListStaffActor, listId: number) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.publish(actor, listId);
  }

  async archive(actor: SupplyListStaffActor, listId: number) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.archive(actor, listId);
  }

  async getById(actor: SupplyListStaffActor, listId: number) {
    if (!canReadSupplyLists(actor)) return forbidden();
    return this.lifecycle.getById(actor, listId);
  }

  async listForPartner(actor: SupplyListStaffActor, businessPartnerId: number) {
    if (!canReadSupplyLists(actor)) return forbidden();
    return this.lifecycle.listForPartner(actor, businessPartnerId);
  }

  async getOffer(actor: SupplyListStaffActor, listId: number) {
    if (!canReadSupplyLists(actor)) return forbidden();
    return this.lifecycle.getOffer(actor, listId);
  }

  async setOffer(actor: SupplyListStaffActor, listId: number, input: ListOfferInput) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.setOffer(actor, listId, input);
  }

  async clearOffer(actor: SupplyListStaffActor, listId: number) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    return this.lifecycle.clearOffer(actor, listId);
  }

  private async authoringQuery<T>(
    actor: SupplyListStaffActor,
    categoryId: number,
    query: (categoryId: number) => Promise<T[]>,
  ) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    const parsed = supplyListIdSchema.safeParse(categoryId);
    if (!parsed.success) return invalid();
    return { success: true as const, data: await query(parsed.data) };
  }

  private async specificationExists(
    input: Pick<SupplyListItemInput, 'exactItem' | 'specification'>,
  ) {
    if (input.exactItem && input.specification) return false;
    if (!input.specification) return true;
    const options = new Map(
      (await this.querySpecificationOptions(input.specification.categoryId)).map((option) => [
        option.attributeKey,
        new Set(option.values),
      ]),
    );
    return Object.entries(input.specification.attributes).every(([key, value]) =>
      options.get(key)?.has(value),
    );
  }
}
