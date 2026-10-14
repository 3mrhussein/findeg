import type { SupplyListStatus } from './types';

export const SUPPLY_LIST_STATUSES = ['draft', 'published', 'archived'] as const;

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
