/**
 * School Supply List vocabulary (GLOSSARY: School Supply List, List Selection, Exact Item,
 * Allowed Alternative, List Replacement; ADR-0004, ADR-0011).
 */
import type { LocalizedText } from '../common';

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

/** A School Supply List line is either an Exact Item or a specification (Allowed Alternative). */
export const SUPPLY_LIST_ITEM_KINDS = ['exact-item', 'specification'] as const;
export type SupplyListItemKind = (typeof SUPPLY_LIST_ITEM_KINDS)[number];

export const SUPPLY_LIST_ITEM_QUANTITY_MIN = 1;
export const SUPPLY_LIST_ITEM_QUANTITY_MAX = 999;

/** A curated list a Partner School asks its Customers to buy, for one academic year and grade. */
export interface SchoolSupplyList {
  id: number;
  businessPartnerId: number;
  academicYear: string;
  grade: string;
  title: LocalizedText;
  status: SupplyListStatus;
  /** Public, unguessable code that Customers use instead of a login. */
  publicCode: string;
}

/** One line of a School Supply List. Required or optional per item. */
export interface SchoolSupplyListItem {
  id: number;
  supplyListId: SchoolSupplyList['id'];
  kind: SupplyListItemKind;
  required: boolean;
  quantity: number;
  /** Exact Items name a product variant; specifications are matched at selection time. */
  variantId?: number;
}

/** A Customer's in-progress choices against one published list, kept apart from the Cart. */
export interface ListSelection {
  supplyListId: SchoolSupplyList['id'];
  lines: readonly {
    supplyListItemId: SchoolSupplyListItem['id'];
    variantId: number;
    quantity: number;
  }[];
}
