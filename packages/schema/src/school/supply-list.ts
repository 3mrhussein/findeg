/**
 * School Supply List vocabulary (GLOSSARY: School Supply List, Draft / Published / Archived,
 * List Replacement; ADR-0004).
 */

export const SUPPLY_LIST_STATUSES = ['draft', 'published', 'archived'] as const;
export type SupplyListStatus = (typeof SUPPLY_LIST_STATUSES)[number];

/** Only Published and Archived lists are visible to Customers; a Draft is never public. */
export const PUBLIC_SUPPLY_LIST_STATUSES = [
  'published',
  'archived',
] as const satisfies readonly SupplyListStatus[];

/** Lifecycle moves: Draft → Published, then Published → Archived when superseded (List Replacement). */
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
