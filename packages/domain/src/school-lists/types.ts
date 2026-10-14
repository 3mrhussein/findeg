/**
 * School Supply List vocabulary (GLOSSARY: School Supply List, List Selection, Exact Item,
 * Allowed Alternative, List Replacement, List Offer; ADR-0004, ADR-0007, ADR-0011).
 */
import type { Id, LocalizedText } from '../common';
import type { CategoryId, VariantId } from '../catalog';
import type { BusinessPartnerId } from '../partners';
import * as constants from './constants';
import type { PublicCode } from './helpers';

export type SupplyListId = Id<'SchoolSupplyList'>;
export type SupplyListItemId = Id<'SchoolSupplyListItem'>;
export type SupplyListStatus = (typeof constants.SUPPLY_LIST_STATUSES)[number];

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
