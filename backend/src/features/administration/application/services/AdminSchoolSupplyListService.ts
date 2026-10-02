import { SupplyListIdSchema, SupplyListItemSchema } from '@findeg/db';
import { canReadSupplyLists, canWriteSupplyLists } from '../../../school';
import type {
  CreateSupplyListDraftInput,
  ISchoolSupplyListService,
  SupplyListItemInput,
  SupplyListStaffActor,
  UpdateSupplyListDraftInput,
} from '../../../school';
import type {
  IAdminSchoolSupplyListService,
  SpecificationOption,
  SpecificationVariantCandidate,
} from '../interfaces/IAdminSchoolSupplyListService';

type SpecificationOptionsQuery = (categoryId: number) => Promise<SpecificationOption[]>;
type VariantCandidatesQuery = (categoryId: number) => Promise<SpecificationVariantCandidate[]>;

const forbidden = () => ({ success: false as const, error: 'forbidden' as const });
const invalid = () => ({ success: false as const, error: 'invalid-input' as const });

export class AdminSchoolSupplyListService implements IAdminSchoolSupplyListService {
  constructor(
    private readonly lifecycle: ISchoolSupplyListService,
    private readonly querySpecificationOptions: SpecificationOptionsQuery,
    private readonly queryVariantCandidates: VariantCandidatesQuery,
  ) {}

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
    const parsed = SupplyListItemSchema.safeParse(input);
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
    const parsed = SupplyListItemSchema.partial().safeParse(input);
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

  private async authoringQuery<T>(
    actor: SupplyListStaffActor,
    categoryId: number,
    query: (categoryId: number) => Promise<T[]>,
  ) {
    if (!canWriteSupplyLists(actor)) return forbidden();
    const parsed = SupplyListIdSchema.safeParse(categoryId);
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
