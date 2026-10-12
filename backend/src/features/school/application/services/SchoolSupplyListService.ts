import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { canReadSupplyLists, canWriteSupplyLists } from '../../domain/supplyListPermissions';
import {
  CreateSupplyListDraftSchema,
  UpdateSupplyListDraftSchema,
  SupplyListItemSchema,
  SupplyListIdSchema,
  ListOfferSchema,
} from '@findeg/db/types';
import {
  archiveSupplyList,
  deleteListOffer,
  deleteSupplyListItem,
  findVariantCandidates,
  getListOffer,
  getPublishedSupplyListInSlot,
  getSupplyList,
  getSupplyListStockFacts,
  getSupplyListDefaults,
  getSupplyListItems,
  insertSupplyListDraft,
  insertSupplyListItem,
  isSupplyListSlotTakenError,
  listSupplyListsForPartner,
  lockSupplyList,
  lockSupplyListPartner,
  publishSupplyList,
  snapshotSupplyListItem,
  updateSupplyListDraft,
  updateSupplyListItem,
  upsertListOffer,
  type SchoolSupplyListDatabase,
  type SchoolSupplyListTransaction,
} from '@findeg/db/queries/school-supply-lists';
import type { SchoolSupplyListRow } from '@findeg/db/schema';
import { toCandidateVariant } from '../../domain/eligibleVariants';
import { schoolListFailure } from '../../domain/errors';
import { domainId, mapSupplyList, mapSupplyListItem } from '@findeg/db';
import {
  assertStaffListAuthoring,
  assertDraftEditable,
  cloneSupplyList,
  archiveSupplyList as archiveDomainSupplyList,
  publishSupplyList as publishDomainSupplyList,
  generatePublicCode,
  type StaffListAuthoringAction,
} from '@findeg/domain/school-lists';

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
  ListOfferInput,
} from '../interfaces/ISchoolSupplyListService';

function ok<T>(data: T): SupplyListResult<T> {
  return { success: true, data };
}
function fail(error: SupplyListError): { success: false; error: SupplyListError } {
  return { success: false, error };
}

const canWrite = canWriteSupplyLists;
const canRead = canReadSupplyLists;

async function aggregate(
  tx: SchoolSupplyListTransaction,
  row: SchoolSupplyListRow,
): Promise<SchoolSupplyList> {
  return { ...row, items: await getSupplyListItems(tx, row.id) };
}

/**
 * Staff-only School Supply List lifecycle. The Partner School lock serializes
 * slot changes and replacement and pins the status that gates authoring
 * (ADR-0012), the list lock serializes item edits/publication, and database
 * constraints/triggers protect writers outside this service.
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
    return db
      .transaction(async (tx): Promise<SupplyListResult<SchoolSupplyList>> => {
        const partner = await lockSupplyListPartner(tx, parsed.data.businessPartnerId);
        if (!partner) return fail('partner-school-not-found');
        assertStaffListAuthoring(partner.status, 'draft');
        return ok(await aggregate(tx, await insertSupplyListDraft(tx, parsed.data)));
      })
      .catch(schoolListFailure);
  }

  async cloneToDraft(
    actor: SupplyListStaffActor,
    sourceListId: number,
    input: UpdateSupplyListDraftInput = {},
  ) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = UpdateSupplyListDraftSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    return this.withList(sourceListId, 'draft', async (tx, source, partnerStatus) => {
      const sourceItems = await getSupplyListItems(tx, source.id);
      const clone = cloneSupplyList(
        mapSupplyList(source),
        sourceItems.map(mapSupplyListItem),
        partnerStatus,
      );
      const draft = await insertSupplyListDraft(
        tx,
        CreateSupplyListDraftSchema.strip().parse({ ...source, ...parsed.data }),
        clone.list.sourceListId,
      );
      for (const [index, item] of sourceItems.entries()) {
        // Project only authoring fields; never copy identities, snapshots or timestamps.
        await insertSupplyListItem(tx, draft.id, {
          ...SupplyListItemSchema.strip().parse(item),
          variantId: clone.items[index].defaultVariantId,
          specification: clone.items[index].specification,
          required: clone.items[index].required,
          quantity: clone.items[index].quantity,
        });
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
    return this.withDraft(listId, 'draft', async (tx) =>
      ok(await aggregate(tx, await updateSupplyListDraft(tx, listId, parsed.data))),
    );
  }

  async addItem(actor: SupplyListStaffActor, listId: number, input: SupplyListItemInput) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = SupplyListItemSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    return this.withDraft(listId, 'draft', async (tx) =>
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
    return this.withDraft(listId, 'draft', async (tx) => {
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
    return this.withDraft(listId, 'draft', async (tx) => {
      const item = await deleteSupplyListItem(tx, listId, itemId);
      return item ? ok(undefined) : fail('item-not-found');
    });
  }

  async reorderItems(actor: SupplyListStaffActor, listId: number, itemIds: number[]) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = z.array(SupplyListIdSchema).safeParse(itemIds);
    if (!parsed.success || new Set(parsed.data).size !== parsed.data.length)
      return fail('invalid-input');
    return this.withDraft(listId, 'draft', async (tx, list) => {
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
      return await this.withDraft(listId, 'publish', async (tx, list, partnerStatus) => {
        const items = await getSupplyListItems(tx, list.id);
        const variantIds = [
          ...new Set(items.flatMap((item) => (item.variantId === null ? [] : [item.variantId]))),
        ];
        const defaults = await getSupplyListDefaults(tx, variantIds);
        const candidates = await findVariantCandidates(tx, { variantIds });
        const incumbent = await getPublishedSupplyListInSlot(tx, list);
        const incumbentOffer = incumbent ? await getListOffer(tx, incumbent.id) : null;
        const decision = publishDomainSupplyList({
          list: mapSupplyList(list),
          items: items.map(mapSupplyListItem),
          partnerStatus,
          defaultVariants: candidates.map(toCandidateVariant),
          stock: await getSupplyListStockFacts(tx, variantIds),
          incumbent: incumbent ? mapSupplyList(incumbent) : null,
          incumbentOffer: incumbentOffer
            ? {
                id: domainId<'ListOffer'>(incumbentOffer.listId),
                supplyListId: domainId<'SchoolSupplyList'>(incumbentOffer.listId),
                basisPoints: incumbentOffer.basisPoints,
                startsAt: incumbentOffer.startsAt,
                endsAt: incumbentOffer.endsAt,
              }
            : null,
          publicCode: generatePublicCode(randomBytes),
        });
        const warnings: PublishedSupplyList['warnings'] = decision.warnings.map((warning) => ({
          code: 'default-out-of-stock',
          listItemId: warning.supplyListItemId,
          variantId: warning.variantId,
        }));

        // All business rejections happen before writes. Technical failure rolls
        // back snapshots, archival and publication together.
        for (const item of items) {
          const variant = defaults.find((variant) => variant.variantId === item.variantId)!;
          await snapshotSupplyListItem(tx, item.id, {
            productNameEnSnapshot: variant.localizedName.en ?? null,
            productNameArSnapshot: variant.localizedName.ar ?? null,
            skuSnapshot: variant.sku,
          });
        }
        const now = this.clock();
        if (decision.replaced)
          await archiveSupplyList(tx, decision.replaced.id, now, decision.replaced.replacedById);
        const published = await publishSupplyList(
          tx,
          list.id,
          decision.list.publicCode!,
          now,
          decision.list.replacesListId,
        );
        if (decision.offer)
          await upsertListOffer(
            tx,
            published.id,
            {
              basisPoints: decision.offer.basisPoints,
              startsAt: decision.offer.startsAt,
              endsAt: decision.offer.endsAt,
            },
            now,
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
    return this.withList(listId, null, async (tx, list) => {
      archiveDomainSupplyList(mapSupplyList(list));
      return ok(await aggregate(tx, await archiveSupplyList(tx, list.id, this.clock())));
    });
  }

  async getById(actor: SupplyListStaffActor, listId: number) {
    if (!canRead(actor)) return fail('forbidden');
    return this.withList(listId, null, async (tx, list) => ok(await aggregate(tx, list)));
  }

  async listForPartner(actor: SupplyListStaffActor, businessPartnerId: number) {
    if (!canRead(actor)) return fail('forbidden');
    if (!SupplyListIdSchema.safeParse(businessPartnerId).success) return fail('invalid-input');
    const db = await this.getDb();
    return ok(await listSupplyListsForPartner(db, businessPartnerId));
  }

  async getOffer(actor: SupplyListStaffActor, listId: number) {
    if (!canRead(actor)) return fail('forbidden');
    return this.withList(listId, null, async (tx, list) =>
      ok((await getListOffer(tx, list.id)) ?? null),
    );
  }

  async setOffer(actor: SupplyListStaffActor, listId: number, input: ListOfferInput) {
    if (!canWrite(actor)) return fail('forbidden');
    const parsed = ListOfferSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    return this.withList(listId, null, async (tx, list) =>
      ok(await upsertListOffer(tx, list.id, parsed.data, this.clock())),
    );
  }

  async clearOffer(actor: SupplyListStaffActor, listId: number) {
    if (!canWrite(actor)) return fail('forbidden');
    return this.withList(listId, null, async (tx, list) => {
      await deleteListOffer(tx, list.id);
      return ok(undefined);
    });
  }

  private async withDraft<T>(
    listId: number,
    action: StaffListAuthoringAction,
    operation: (
      tx: SchoolSupplyListTransaction,
      list: SchoolSupplyListRow,
      partnerStatus: Parameters<typeof assertStaffListAuthoring>[0],
    ) => Promise<SupplyListResult<T>>,
  ) {
    return this.withList(listId, action, (tx, list, partnerStatus) => {
      assertDraftEditable(mapSupplyList(list), partnerStatus);
      return operation(tx, list, partnerStatus);
    });
  }

  /** Locks the Partner School, then the list. A non-null `action` must be allowed by its status. */
  private async withList<T>(
    listId: number,
    action: StaffListAuthoringAction | null,
    operation: (
      tx: SchoolSupplyListTransaction,
      list: SchoolSupplyListRow,
      partnerStatus: Parameters<typeof assertStaffListAuthoring>[0],
    ) => Promise<SupplyListResult<T>>,
  ): Promise<SupplyListResult<T>> {
    if (!SupplyListIdSchema.safeParse(listId).success) return fail('invalid-input');
    const db = await this.getDb();
    return db
      .transaction(async (tx) => {
        const initial = await getSupplyList(tx, listId);
        if (!initial) return fail('not-found');
        const partner = await lockSupplyListPartner(tx, initial.businessPartnerId);
        if (!partner) return fail('partner-school-not-found');
        if (action) assertStaffListAuthoring(partner.status, action);
        const list = await lockSupplyList(tx, listId);
        if (!list) return fail('not-found');
        return operation(tx, list, partner.status);
      })
      .catch(schoolListFailure);
  }
}
