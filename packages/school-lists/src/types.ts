import type {
  CreateSupplyListDraftInput,
  ListOffer,
  ListOfferInput,
  SchoolSupplyListIndexFilters,
  SchoolSupplyListIndexRow,
  SchoolSupplyListItemRow,
  SchoolSupplyListRow,
  SupplyListItemInput,
  UpdateSupplyListDraftInput,
} from '@findeg/db';
import type { BusinessPartnerStatus, PUBLIC_SUPPLY_LIST_STATUSES } from '@findeg/domain';

export type {
  CreateSupplyListDraftInput,
  UpdateSupplyListDraftInput,
  SupplyListItemInput,
  ListOfferInput,
} from '@findeg/db';
export type { SchoolSupplyListIndexFilters, SchoolSupplyListIndexRow } from '@findeg/db';

/** Result metadata for cache integration; the package never calls Next.js APIs (spec #434). */
type ServiceResult<T> = {
  success: true;
  data?: T;
  cachePaths?: string[];
  cacheTags?: string[];
  cacheConfig?: { tags: string[]; lifetime: number };
};

/** Localized text as stored on a list (`en` and `ar`, either may be absent). */
type TranslationMap = SchoolSupplyListRow['localizedTitle'];

export interface SchoolFilterOptions {
  governorates: string[];
  schoolTypes: string[];
  academicSystems: string[];
}

export interface SchoolSearchParams {
  query?: string;
  governorate?: string;
  schoolType?: string;
  academicSystem?: string;
  /** Only schools with at least one published list. */
  withPublishedLists?: boolean;
  page: number;
  pageSize: number;
}

/** A Partner School in the directory. `code` is its Business Partner code, used in its URL. */
export interface SchoolSearchResult {
  code: string;
  nameEn: string;
  nameAr: string;
  governorate: string | null;
  area: string | null;
  schoolType: string | null;
  academicSystem: string | null;
  logoUrl: string | null;
  publishedListCount: number;
}

/** A published School Supply List, opened at `/lists/<publicCode>`. */
export interface SchoolProfileList {
  grade: string;
  academicYear: string;
  localizedTitle: SchoolSupplyListRow['localizedTitle'];
  localizedDescription: SchoolSupplyListRow['localizedDescription'];
  heroImageUrl: string | null;
  publicCode: string;
}

export interface SchoolProfile extends Omit<SchoolSearchResult, 'publishedListCount'> {
  /** Published lists only: drafts and archived lists never appear. */
  lists: SchoolProfileList[];
}

export interface ISchoolDirectory {
  searchSchools(
    params: SchoolSearchParams,
  ): Promise<{ items: SchoolSearchResult[]; totalCount: number }>;
  getByCode(code: string): Promise<SchoolProfile | null>;
  getFilterOptions(): Promise<SchoolFilterOptions>;
}

export type PublicSupplyListStatus = (typeof PUBLIC_SUPPLY_LIST_STATUSES)[number];

export interface PublicSupplyListVariant {
  variantId: number;
  sku: string;
  name: TranslationMap;
  variantLabel: TranslationMap;
  brand: TranslationMap | null;
  /** Informational base price as a decimal string; the checkout quote is authoritative. */
  price: string;
  /** Available quantity summed across active warehouses is at least 1. */
  inStock: boolean;
}

export interface PublicSupplyListEligibleVariant extends PublicSupplyListVariant {
  /** Attribute key → value, only where this variant differs from the item's default. */
  differingAttributes: Record<string, string>;
}

export interface PublicSupplyListItem {
  id: number;
  required: boolean;
  quantity: number;
  exactItem: boolean;
  specification: { categoryId: number; attributes: Record<string, string> } | null;
  label: TranslationMap;
  note: TranslationMap | null;
  defaultVariant: PublicSupplyListVariant;
  eligibleVariants: PublicSupplyListEligibleVariant[];
}

export interface PublicSupplyListOffer {
  basisPoints: number;
  startsAt: string;
  endsAt: string | null;
}

export interface PublicSupplyList {
  publicCode: string;
  status: PublicSupplyListStatus;
  grade: string;
  academicYear: string;
  title: TranslationMap;
  description: TranslationMap | null;
  heroImageUrl: string | null;
  school: { id: number; nameEn: string; nameAr: string; logoUrl: string | null };
  /** Set when an archived list was replaced by a newer one. */
  replacementPublicCode: string | null;
  /** Active List Offer (ADR-0007); null when none exists or inactive. */
  offer: PublicSupplyListOffer | null;
  items: PublicSupplyListItem[];
}

export type PublicSupplyListResult =
  { success: true; data: PublicSupplyList } | { success: false; error: 'not-found' };

/** Anonymous, live (uncached) read of a published or archived list by its public code. */
export interface ISchoolSupplyListReader {
  getByPublicCode(publicCode: string): Promise<PublicSupplyListResult>;
}

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

/**
 * List-checkout request contract (spec #206). Interface only: the checkout
 * spec implements it. `/checkout/validate` and Order Acceptance accept this
 * beside the existing `{ source: 'cart', lines: [{ variantId, quantity }] }`.
 *
 * The server must check that:
 * - the list is `published` (otherwise 409 `list-unavailable`);
 * - each `listItemId` belongs to the list and appears once;
 * - each variant is eligible via `eligibleVariants`, inside the acceptance
 *   transaction with candidates read `FOR SHARE`;
 * - quantities are 1 to 999 and the selection is not empty.
 * Line failures return 422 `selection-invalid` naming the offending `listItemId`s.
 */
export interface ListCheckoutLine {
  listItemId: number;
  variantId: number;
  /** 1 to 999. */
  quantity: number;
}

export interface ListCheckoutRequest {
  source: 'list';
  publicCode: string;
  lines: ListCheckoutLine[];
}

export type ListCheckoutError =
  | { status: 409; code: 'list-unavailable' }
  | { status: 422; code: 'selection-invalid'; listItemIds: number[] };

export interface SpecificationOption {
  attributeKey: string;
  values: string[];
}

export interface SpecificationVariantCandidate {
  variantId: number;
  categoryId: number | null;
  attributes: Record<string, string>;
}

export interface SchoolListPartnerOption {
  id: number;
  nameEn: string;
  nameAr: string;
  status: BusinessPartnerStatus;
}

export interface IAdminSchoolSupplyListService extends ISchoolSupplyListService {
  listPartnerOptions(
    actor: SupplyListStaffActor,
  ): Promise<SupplyListResult<SchoolListPartnerOption[]>>;
  listAll(
    actor: SupplyListStaffActor,
    filters?: SchoolSupplyListIndexFilters,
  ): Promise<SupplyListResult<SchoolSupplyListIndexRow[]>>;
  listSpecificationOptions(
    actor: SupplyListStaffActor,
    categoryId: number,
  ): Promise<SupplyListResult<SpecificationOption[]>>;
  listVariantCandidates(
    actor: SupplyListStaffActor,
    categoryId: number,
  ): Promise<SupplyListResult<SpecificationVariantCandidate[]>>;
}
