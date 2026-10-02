import type {
  SchoolSupplyListItemRow,
  SchoolSupplyListRow,
  SupplyListSpecification,
} from '@findeg/db/schema';
import type { ServiceResult } from '../../../core';

/** A resolved Staff session; Partner membership never grants lifecycle access. */
export interface SupplyListStaffActor {
  kind: 'staff';
  userId: number;
  activeRoleIds?: readonly string[];
  permissionCodes?: readonly string[];
}

export interface CreateSupplyListDraftInput {
  businessPartnerId: number;
  grade: string;
  academicYear: string;
  localizedTitle: { en?: string; ar?: string };
  localizedDescription?: { en?: string; ar?: string } | null;
  heroImageUrl?: string | null;
}

export type UpdateSupplyListDraftInput = Partial<
  Omit<CreateSupplyListDraftInput, 'businessPartnerId'>
>;

export interface SupplyListItemInput {
  /** Nullable while Staff prepare a draft; required before publication. */
  variantId?: number | null;
  exactItem?: boolean;
  specification?: SupplyListSpecification | null;
  required?: boolean;
  quantity?: number;
  localizedLabel: { en?: string; ar?: string };
  localizedNote?: { en?: string; ar?: string } | null;
  sortOrder?: number;
}

export interface SchoolSupplyList extends SchoolSupplyListRow {
  items: SchoolSupplyListItemRow[];
}

export type SupplyListError =
  | 'forbidden'
  | 'invalid-input'
  | 'partner-school-not-found'
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
}
