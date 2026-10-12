/**
 * School Supply List vocabulary (GLOSSARY: School Supply List, List Selection, Exact Item,
 * Allowed Alternative, List Replacement; ADR-0004, ADR-0011).
 */
import type { Id, LocalizedText } from '../common';
import type { CategoryId, VariantId } from '../catalog';
import type { BusinessPartnerId } from '../partners';
import type { PublicCode } from './public-code';

export { eligibleVariants, isEligibleVariant } from './eligibility';
export type { CandidateVariant, EligibilityItem } from './eligibility';
export { SupplyListError } from './supply-list-error';
export type { SupplyListErrorCode } from './supply-list-error';
export { isExactItem, supplyListItem } from './item';
export { PUBLIC_CODE_PATTERN, generatePublicCode, publicCode } from './public-code';
export type { PublicCode, RandomBytes } from './public-code';
export {
  STAFF_LIST_AUTHORING_ACTIONS,
  STAFF_LIST_AUTHORING_STATUSES,
  assertStaffListAuthoring,
  staffListAuthoringAllows,
} from './staff-authoring';
export type { StaffListAuthoringAction } from './staff-authoring';
export { archiveSupplyList, assertDraftEditable, cloneSupplyList } from './lifecycle';
export type { SupplyListClone, SupplyListDraft, SupplyListItemDraft } from './lifecycle';
export { isListOfferActive, listOffer, listOfferBasisPointsAt } from './list-offer';
export type { ListOfferWindow } from './list-offer';
export { isSameSupplyListSlot, publishSupplyList } from './publish';
export type {
  CopiedListOffer,
  DefaultOutOfStockWarning,
  PublishSupplyListInput,
  PublishedSupplyList,
} from './publish';

export type SupplyListId = Id<'SchoolSupplyList'>;
export type SupplyListItemId = Id<'SchoolSupplyListItem'>;

export const SUPPLY_LIST_STATUSES = ['draft', 'published', 'archived'] as const;
export type SupplyListStatus = (typeof SUPPLY_LIST_STATUSES)[number];

/** Only Published and Archived lists are visible to Customers; a Draft is never public. */
export const PUBLIC_SUPPLY_LIST_STATUSES = [
  'published',
  'archived',
] as const satisfies readonly SupplyListStatus[];

/** Draft → Published, then Published → Archived when superseded (List Replacement). */
export const SUPPLY_LIST_STATUS_TRANSITIONS: Readonly<
  Record<SupplyListStatus, readonly SupplyListStatus[]>
> = {
  draft: ['published'],
  published: ['archived'],
  archived: [],
};

export const SUPPLY_LIST_ITEM_QUANTITY_MIN = 1;
export const SUPPLY_LIST_ITEM_QUANTITY_MAX = 999;

/** A curated list a Partner School asks its Customers to buy, for one academic year and grade. */
export interface SchoolSupplyList {
  id: SupplyListId;
  businessPartnerId: BusinessPartnerId;
  academicYear: string;
  grade: string;
  title: LocalizedText;
  status: SupplyListStatus;
  /** Public, unguessable code that Customers use instead of a login. Set on publishing. */
  publicCode: PublicCode | null;
  /** Set on a clone: the list it was copied from (content provenance only). */
  sourceListId: SupplyListId | null;
  /** Set when this list supersedes a published list for the same partner, year and grade (List Replacement). */
  replacesListId: SupplyListId | null;
  /** Set on the superseded list, pointing at its replacement. */
  replacedById: SupplyListId | null;
}

/**
 * What an item's Allowed Alternatives must match: a product in exactly this category whose
 * variant carries every one of these attribute values.
 */
export interface ItemSpecification {
  categoryId: CategoryId;
  /** Attribute key → required value. Empty means any variant in the category. */
  attributes: Readonly<Record<string, string>>;
}

/** One line of a School Supply List. Required or optional per item. */
export interface SchoolSupplyListItem {
  id: SupplyListItemId;
  supplyListId: SupplyListId;
  /** Every item has a default variant. A draft may still lack one; publishing refuses that. */
  defaultVariantId: VariantId | null;
  /** `null` makes an Exact Item: only the default variant is accepted. */
  specification: ItemSpecification | null;
  required: boolean;
  quantity: number;
}

/** A Customer's in-progress choices against one published list, kept apart from the Cart. */
export interface ListSelection {
  supplyListId: SupplyListId;
  lines: readonly {
    supplyListItemId: SupplyListItemId;
    variantId: VariantId;
    quantity: number;
  }[];
}
