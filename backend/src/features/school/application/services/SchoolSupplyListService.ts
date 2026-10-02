import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { PERMISSION_CODES, systemAdmin } from '@findeg/db';
import {
  CreateSupplyListDraftSchema,
  UpdateSupplyListDraftSchema,
  SupplyListItemSchema,
  SupplyListIdSchema,
} from '@findeg/db/types';
import {
  archiveSupplyList,
  deleteSupplyListItem,
  findVariantCandidates,
  getPublishedSupplyListInSlot,
  getSupplyList,
  getAvailableQuantities,
  getSupplyListDefaults,
  getSupplyListItems,
  insertSupplyListDraft,
  insertSupplyListItem,
  isSupplyListSlotTakenError,
  lockSupplyList,
  lockSupplyListPartner,
  publishSupplyList,
  snapshotSupplyListItem,
  updateSupplyListDraft,
  updateSupplyListItem,
  type SchoolSupplyListDatabase,
  type SchoolSupplyListTransaction,
} from '@findeg/db/queries/school-supply-lists';
import type { SchoolSupplyListRow, SchoolSupplyListItemRow } from '@findeg/db/schema';
import { eligibleVariants } from '../../domain/eligibleVariants';
import type {
  CreateSupplyListDraftInput,
  ISchoolSupplyListService,
  PublishedSupplyList,
  SchoolSupplyList,
  SupplyListError,
  SupplyListItemInput,
  SupplyListResult,
  SupplyListStaffActor,
  UpdateSupplyListDraftInput,
} from '../interfaces/ISchoolSupplyListService';

type ValidatedSupplyListItem = SchoolSupplyListItemRow & {
  variantId: number;
  catalogDefault: Awaited<ReturnType<typeof getSupplyListDefaults>>[number];
};

function ok<T>(data: T): SupplyListResult<T> {
  return { success: true, data };
}
function fail(error: SupplyListError): { success: false; error: SupplyListError } {
  return { success: false, error };
}

function isStaff(actor: SupplyListStaffActor): boolean {
  return actor?.kind === 'staff' && SupplyListIdSchema.safeParse(actor.userId).success;
}
function canWrite(actor: SupplyListStaffActor): boolean {
  return (
    isStaff(actor) &&
    (systemAdmin(actor) ||
      actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE) === true)
  );
}
function canRead(actor: SupplyListStaffActor): boolean {
  return (
    canWrite(actor) ||
    (isStaff(actor) &&
      actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ) === true)
  );
}

async function aggregate(
  tx: SchoolSupplyListTransaction,
  row: SchoolSupplyListRow,
): Promise<SchoolSupplyList> {
  return { ...row, items: await getSupplyListItems(tx, row.id) };
}

/**
 * Staff-only School Supply List lifecycle. The Partner School lock serializes
 * slot changes and replacement, the list lock serializes item edits/publication,
 * and database constraints/triggers protect writers outside this service.
 */
export class SchoolSupplyListService implements ISchoolSupplyListService {
  constructor(
    private readonly getDb: () => Promise<SchoolSupplyListDatabase>,
    private readonly clock: () => Date,
  ) {}

  async createDraft(actor: SupplyListStaffActor, input: CreateSupplyListDraftInput) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = CreateSupplyListDraftSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    const db = await this.getDb();
    return db.transaction(async (tx): Promise<SupplyListResult<SchoolSupplyList>> => {
      if (!(await lockSupplyListPartner(tx, parsed.data.businessPartnerId)))
        return fail('partner-school-not-found');
      return ok(await aggregate(tx, await insertSupplyListDraft(tx, parsed.data)));
    });
  }

  async cloneToDraft(
    actor: SupplyListStaffActor,
    sourceListId: number,
    input: UpdateSupplyListDraftInput = {},
  ) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = UpdateSupplyListDraftSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    return this.withList(sourceListId, async (tx, source) => {
      if (source.status === 'draft') return fail('invalid-transition');
      const draft = await insertSupplyListDraft(
        tx,
        CreateSupplyListDraftSchema.strip().parse({ ...source, ...parsed.data }),
        source.id,
      );
      for (const item of await getSupplyListItems(tx, source.id)) {
        // Project only authoring fields; never copy identities, snapshots or timestamps.
        await insertSupplyListItem(tx, draft.id, SupplyListItemSchema.strip().parse(item));
      }
      return ok(await aggregate(tx, draft));
    });
  }

  async updateDraft(
    actor: SupplyListStaffActor,
    listId: number,
    input: UpdateSupplyListDraftInput,
  ) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = UpdateSupplyListDraftSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    return this.withDraft(listId, async (tx) =>
      ok(await aggregate(tx, await updateSupplyListDraft(tx, listId, parsed.data))),
    );
  }

  async addItem(actor: SupplyListStaffActor, listId: number, input: SupplyListItemInput) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = SupplyListItemSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    return this.withDraft(listId, async (tx) =>
      ok(
        await insertSupplyListItem(
          tx,
          listId,
          parsed.data.exactItem ? { ...parsed.data, specification: null } : parsed.data,
        ),
      ),
    );
  }

  async updateItem(
    actor: SupplyListStaffActor,
    listId: number,
    itemId: number,
    input: Partial<SupplyListItemInput>,
  ) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = SupplyListItemSchema.partial().safeParse(input);
    if (!parsed.success || !SupplyListIdSchema.safeParse(itemId).success)
      return fail('invalid-input');
    return this.withDraft(listId, async (tx) => {
      const current = (await getSupplyListItems(tx, listId)).find((item) => item.id === itemId);
      if (!current) return fail('item-not-found');
      const patch =
        (parsed.data.exactItem ?? current.exactItem)
          ? { ...parsed.data, specification: null }
          : parsed.data;
      return ok(await updateSupplyListItem(tx, listId, itemId, patch));
    });
  }

  async removeItem(actor: SupplyListStaffActor, listId: number, itemId: number) {
    if (!canWrite(actor)) return fail('forbidden');
    if (!SupplyListIdSchema.safeParse(itemId).success) return fail('invalid-input');
    return this.withDraft(listId, async (tx) => {
      const item = await deleteSupplyListItem(tx, listId, itemId);
      return item ? ok(undefined) : fail('item-not-found');
    });
  }

  async reorderItems(actor: SupplyListStaffActor, listId: number, itemIds: number[]) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = z.array(SupplyListIdSchema).safeParse(itemIds);
    if (!parsed.success || new Set(parsed.data).size !== parsed.data.length)
      return fail('invalid-input');
    return this.withDraft(listId, async (tx, list) => {
      const items = await getSupplyListItems(tx, listId);
      const ids = new Set(items.map((item) => item.id));
      if (items.length !== parsed.data.length || parsed.data.some((id) => !ids.has(id)))
        return fail('invalid-input');
      for (const [sortOrder, id] of parsed.data.entries()) {
        await updateSupplyListItem(tx, listId, id, { sortOrder });
      }
      return ok(await aggregate(tx, list));
    });
  }

  async publish(
    actor: SupplyListStaffActor,
    listId: number,
  ): Promise<SupplyListResult<PublishedSupplyList>> {
    if (!canWrite(actor)) return fail('forbidden');
    try {
      return await this.withDraft(listId, async (tx, list) => {
        const validation = await this.validateDefaults(tx, await getSupplyListItems(tx, list.id));
        if (!validation.success) return validation;
        const { variantIds, items } = validation.data;

        const incumbent = await getPublishedSupplyListInSlot(tx, list);
        if (incumbent && incumbent.id !== list.sourceListId) return fail('slot-taken');
        const stock = await getAvailableQuantities(tx, variantIds);
        const warnings: PublishedSupplyList['warnings'] = items
          .filter((item) => (stock.get(item.variantId) ?? 0) < 1)
          .map((item) => ({
            code: 'default-out-of-stock',
            listItemId: item.id,
            variantId: item.variantId,
          }));

        // All business rejections happen before writes. Technical failure rolls
        // back snapshots, archival and publication together.
        for (const item of items) {
          const variant = item.catalogDefault;
          await snapshotSupplyListItem(tx, item.id, {
            productNameEnSnapshot: variant.localizedName.en ?? null,
            productNameArSnapshot: variant.localizedName.ar ?? null,
            skuSnapshot: variant.sku,
          });
        }
        const now = this.clock();
        if (incumbent) await archiveSupplyList(tx, incumbent.id, now, list.id);
        const published = await publishSupplyList(
          tx,
          list.id,
          randomUUID().replaceAll('-', ''),
          now,
          incumbent?.id ?? null,
        );
        return ok({ list: await aggregate(tx, published), warnings });
      });
    } catch (error) {
      if (isSupplyListSlotTakenError(error)) return fail('slot-taken');
      throw error;
    }
  }

  async archive(actor: SupplyListStaffActor, listId: number) {
    if (!canWrite(actor)) return fail('forbidden');
    return this.withList(listId, async (tx, list) => {
      if (list.status !== 'published') return fail('invalid-transition');
      return ok(await aggregate(tx, await archiveSupplyList(tx, list.id, this.clock())));
    });
  }

  async getById(actor: SupplyListStaffActor, listId: number) {
    if (!canRead(actor)) return fail('forbidden');
    return this.withList(listId, async (tx, list) => ok(await aggregate(tx, list)));
  }

  /** Validate and narrow catalog facts before any publication or replacement writes. */
  private async validateDefaults(
    tx: SchoolSupplyListTransaction,
    items: SchoolSupplyListItemRow[],
  ): Promise<SupplyListResult<{ variantIds: number[]; items: ValidatedSupplyListItem[] }>> {
    if (items.length === 0) return fail('empty-list');
    const selected = items.flatMap((item) =>
      item.variantId === null ? [] : [{ ...item, variantId: item.variantId }],
    );
    if (selected.length !== items.length) return fail('default-unavailable');
    const variantIds = [...new Set(selected.map((item) => item.variantId))];
    const defaults = new Map(
      (await getSupplyListDefaults(tx, variantIds)).map((row) => [row.variantId, row]),
    );
    const validated: ValidatedSupplyListItem[] = [];
    for (const item of selected) {
      const catalogDefault = defaults.get(item.variantId);
      if (!catalogDefault?.variantActive || !catalogDefault.productActive)
        return fail('default-unavailable');
      validated.push({ ...item, catalogDefault });
    }
    const candidates = await findVariantCandidates(tx, { variantIds });
    if (
      validated.some(
        (item) =>
          !eligibleVariants(item, candidates).some(
            (candidate) => candidate.variantId === item.variantId,
          ),
      )
    )
      return fail('default-ineligible');
    return ok({ variantIds, items: validated });
  }

  private async withDraft<T>(
    listId: number,
    operation: (
      tx: SchoolSupplyListTransaction,
      list: SchoolSupplyListRow,
    ) => Promise<SupplyListResult<T>>,
  ) {
    return this.withList(listId, (tx, list) =>
      list.status === 'draft' ? operation(tx, list) : Promise.resolve(fail('not-draft')),
    );
  }

  private async withList<T>(
    listId: number,
    operation: (
      tx: SchoolSupplyListTransaction,
      list: SchoolSupplyListRow,
    ) => Promise<SupplyListResult<T>>,
  ): Promise<SupplyListResult<T>> {
    if (!SupplyListIdSchema.safeParse(listId).success) return fail('invalid-input');
    const db = await this.getDb();
    return db.transaction(async (tx) => {
      const initial = await getSupplyList(tx, listId);
      if (!initial) return fail('not-found');
      if (!(await lockSupplyListPartner(tx, initial.businessPartnerId)))
        return fail('partner-school-not-found');
      const list = await lockSupplyList(tx, listId);
      if (!list) return fail('not-found');
      return operation(tx, list);
    });
  }
}
