import {
  PERMISSION_CODES,
  SupplyListIdSchema,
  SupplyListItemSchema,
  systemAdmin,
} from '@findeg/db';
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

function canWrite(actor: SupplyListStaffActor): boolean {
  return (
    actor?.kind === 'staff' &&
    SupplyListIdSchema.safeParse(actor.userId).success &&
    (systemAdmin(actor) ||
      actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE) === true)
  );
}

function canRead(actor: SupplyListStaffActor): boolean {
  return (
    canWrite(actor) ||
    (actor?.kind === 'staff' &&
      SupplyListIdSchema.safeParse(actor.userId).success &&
      actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ) === true)
  );
}

export class AdminSchoolSupplyListService implements IAdminSchoolSupplyListService {
  constructor(
    private readonly lifecycle: ISchoolSupplyListService,
    private readonly querySpecificationOptions: SpecificationOptionsQuery,
    private readonly queryVariantCandidates: VariantCandidatesQuery,
  ) {}

  async listSpecificationOptions(actor: SupplyListStaffActor, categoryId: number) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    const parsed = SupplyListIdSchema.safeParse(categoryId);
    if (!parsed.success) return { success: false as const, error: 'invalid-input' as const };
    return { success: true as const, data: await this.querySpecificationOptions(parsed.data) };
  }

  async listVariantCandidates(actor: SupplyListStaffActor, categoryId: number) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    const parsed = SupplyListIdSchema.safeParse(categoryId);
    if (!parsed.success) return { success: false as const, error: 'invalid-input' as const };
    return { success: true as const, data: await this.queryVariantCandidates(parsed.data) };
  }

  async createDraft(actor: SupplyListStaffActor, input: CreateSupplyListDraftInput) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.createDraft(actor, input);
  }

  async cloneToDraft(
    actor: SupplyListStaffActor,
    sourceListId: number,
    input?: UpdateSupplyListDraftInput,
  ) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.cloneToDraft(actor, sourceListId, input);
  }

  async updateDraft(
    actor: SupplyListStaffActor,
    listId: number,
    input: UpdateSupplyListDraftInput,
  ) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.updateDraft(actor, listId, input);
  }

  async addItem(actor: SupplyListStaffActor, listId: number, input: SupplyListItemInput) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    const parsed = SupplyListItemSchema.safeParse(input);
    if (!parsed.success || !(await this.specificationExists(parsed.data))) {
      return { success: false as const, error: 'invalid-input' as const };
    }
    return this.lifecycle.addItem(actor, listId, parsed.data);
  }

  async updateItem(
    actor: SupplyListStaffActor,
    listId: number,
    itemId: number,
    input: Partial<SupplyListItemInput>,
  ) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    const parsed = SupplyListItemSchema.partial().safeParse(input);
    if (!parsed.success || !(await this.specificationExists(parsed.data))) {
      return { success: false as const, error: 'invalid-input' as const };
    }
    return this.lifecycle.updateItem(actor, listId, itemId, parsed.data);
  }

  async removeItem(actor: SupplyListStaffActor, listId: number, itemId: number) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.removeItem(actor, listId, itemId);
  }

  async reorderItems(actor: SupplyListStaffActor, listId: number, itemIds: number[]) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.reorderItems(actor, listId, itemIds);
  }

  async publish(actor: SupplyListStaffActor, listId: number) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.publish(actor, listId);
  }

  async archive(actor: SupplyListStaffActor, listId: number) {
    if (!canWrite(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.archive(actor, listId);
  }

  async getById(actor: SupplyListStaffActor, listId: number) {
    if (!canRead(actor)) return { success: false as const, error: 'forbidden' as const };
    return this.lifecycle.getById(actor, listId);
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
