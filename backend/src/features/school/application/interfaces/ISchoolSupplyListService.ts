import type { ListOffer, SchoolSupplyListItemRow, SchoolSupplyListRow } from '@findeg/db/schema';
import type {
  CreateSupplyListDraftInput,
  UpdateSupplyListDraftInput,
  SupplyListItemInput,
  ListOfferInput,
} from '@findeg/db/types';
export type {
  CreateSupplyListDraftInput,
  UpdateSupplyListDraftInput,
  SupplyListItemInput,
  ListOfferInput,
} from '@findeg/db/types';
import type { ServiceResult } from '../../../core';

/** A resolved Staff session; Partner membership never grants lifecycle access. */
export interface SupplyListStaffActor {
  kind: 'staff';
  userId: number;
  activeRoleIds?: readonly string[];
  permissionCodes?: readonly string[];
}

export interface SchoolSupplyList extends SchoolSupplyListRow {
  items: SchoolSupplyListItemRow[];
}

export type SupplyListError =
  | 'forbidden'
  | 'invalid-input'
  | 'partner-school-not-found'
  /** The owning Business Partner's status forbids this authoring action (ADR-0012). */
  | 'partner-status-not-allowed'
  | 'not-found'
  | 'item-not-found'
  | 'not-draft'
  | 'invalid-transition'
  | 'empty-list'
  | 'default-unavailable'
  | 'default-ineligible'
  | 'slot-taken';

/** ServiceResult metadata on success, typed business rejection on failure. */
export type SupplyListResult<T> =
  (ServiceResult<T> & { data: T }) | { success: false; error: SupplyListError };

export interface PublishedSupplyList {
  list: SchoolSupplyList;
  warnings: { code: 'default-out-of-stock'; listItemId: number; variantId: number }[];
}

export interface ISchoolSupplyListService {
  createDraft(
    actor: SupplyListStaffActor,
    input: CreateSupplyListDraftInput,
  ): Promise<SupplyListResult<SchoolSupplyList>>;
  /** Clone a published or archived version. Publication replaces it only if it still holds the target slot. */
  cloneToDraft(
    actor: SupplyListStaffActor,
    sourceListId: number,
    input?: UpdateSupplyListDraftInput,
  ): Promise<SupplyListResult<SchoolSupplyList>>;
  updateDraft(
    actor: SupplyListStaffActor,
    listId: number,
    input: UpdateSupplyListDraftInput,
  ): Promise<SupplyListResult<SchoolSupplyList>>;
  addItem(
    actor: SupplyListStaffActor,
    listId: number,
    input: SupplyListItemInput,
  ): Promise<SupplyListResult<SchoolSupplyListItemRow>>;
  /** Drafts may have no default yet; Exact mode clears any substitution specification. */
  updateItem(
    actor: SupplyListStaffActor,
    listId: number,
    itemId: number,
    input: Partial<SupplyListItemInput>,
  ): Promise<SupplyListResult<SchoolSupplyListItemRow>>;
  removeItem(
    actor: SupplyListStaffActor,
    listId: number,
    itemId: number,
  ): Promise<SupplyListResult<void>>;
  /** All item IDs, once each, in their new order. */
  reorderItems(
    actor: SupplyListStaffActor,
    listId: number,
    itemIds: number[],
  ): Promise<SupplyListResult<SchoolSupplyList>>;
  publish(
    actor: SupplyListStaffActor,
    listId: number,
  ): Promise<SupplyListResult<PublishedSupplyList>>;
  archive(actor: SupplyListStaffActor, listId: number): Promise<SupplyListResult<SchoolSupplyList>>;
  getById(actor: SupplyListStaffActor, listId: number): Promise<SupplyListResult<SchoolSupplyList>>;
  /** Every version (draft, published, archived) a Partner School has, for Staff navigation. */
  listForPartner(
    actor: SupplyListStaffActor,
    businessPartnerId: number,
  ): Promise<SupplyListResult<SchoolSupplyListRow[]>>;
  /** The list's List Offer, or null when it has none. Offers are not part of the publish freeze. */
  getOffer(
    actor: SupplyListStaffActor,
    listId: number,
  ): Promise<SupplyListResult<ListOffer | null>>;
  /** Create or replace the offer on a draft, published or archived list without republishing. */
  setOffer(
    actor: SupplyListStaffActor,
    listId: number,
    input: ListOfferInput,
  ): Promise<SupplyListResult<ListOffer>>;
  clearOffer(actor: SupplyListStaffActor, listId: number): Promise<SupplyListResult<void>>;
}
