import type { PublicSupplyList, PublicSupplyListItem } from '@findeg/backend/features/school';
import {
  seedListSelection,
  reconcileListSelection,
  setSelectionQuantity,
  setSelectionItemEnabled,
  chooseSelectionVariant,
  orderedSelectionLines,
  isDefaultListSelection,
  listCompleteness as domainListCompleteness,
  checkoutBlockingItemIds as domainCheckoutBlockingItemIds,
  type SelectableList,
  type SelectionLine as DomainSelectionLine,
  type ListSelection as DomainListSelection,
  type SupplyListItemId,
  type VariantId,
  type SupplyListId,
  type CategoryId,
} from '@findeg/domain';

/**
 * A Customer's List Selection: held in the browser per `publicCode`, never
 * synced to the account and never merged with the Cart (ADR-0011).
 */
export interface SelectionLine {
  listItemId: number;
  variantId: number;
  /** 0 means an optional item that is switched off. */
  quantity: number;
}

export interface ListSelection {
  v: 1;
  lines: SelectionLine[];
}

/** The storage surface this module needs; `window.localStorage` satisfies it. */
export interface SelectionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 999;

const KEY_PREFIX = 'findeg:list-selection:';
export const selectionIndexKey = 'findeg:list-selection-index';

export const selectionKey = (publicCode: string) => `${KEY_PREFIX}${publicCode}`;

function toSelectableList(list: PublicSupplyList): SelectableList {
  return {
    id: ((list as unknown as { id?: number }).id ?? 1) as unknown as SupplyListId,
    items: list.items.map((item) => ({
      id: item.id as unknown as SupplyListItemId,
      required: item.required,
      quantity: item.quantity,
      defaultVariantId: item.defaultVariant.variantId as unknown as VariantId,
      specification: item.exactItem
        ? null
        : {
            categoryId: (item.specification?.categoryId ?? 0) as unknown as CategoryId,
            attributes: item.specification?.attributes ?? {},
          },
      eligibleVariantIds: item.eligibleVariants.map((v) => v.variantId as unknown as VariantId),
    })),
  };
}

function toDomainLines(lines: readonly SelectionLine[]): DomainSelectionLine[] {
  return lines.map((line) => ({
    supplyListItemId: line.listItemId as unknown as SupplyListItemId,
    variantId: line.variantId as unknown as VariantId,
    quantity: line.quantity,
  }));
}

function fromDomainLines(lines: readonly DomainSelectionLine[]): SelectionLine[] {
  return lines.map((line) => ({
    listItemId: line.supplyListItemId as number,
    variantId: line.variantId as number,
    quantity: line.quantity,
  }));
}

const isLine = (value: unknown): value is SelectionLine => {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    Number.isInteger(line.listItemId) &&
    Number.isInteger(line.variantId) &&
    Number.isInteger(line.quantity) &&
    (line.quantity as number) >= 0
  );
};

function parseSelection(raw: string | null): ListSelection | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { v, lines } = parsed as { v?: unknown; lines?: unknown };
    if (v !== 1 || !Array.isArray(lines) || !lines.every(isLine)) return null;
    return { v: 1, lines };
  } catch {
    return null;
  }
}

export function seedSelection(list: PublicSupplyList): ListSelection {
  const seeded = seedListSelection(toSelectableList(list));
  return {
    v: 1,
    lines: fromDomainLines(seeded.lines),
  };
}

/**
 * Reads the stored selection (reseeding when it is missing, unreadable or the
 * wrong version) and reconciles it against the list just read via domain reconcileListSelection.
 */
export function loadSelection(
  list: PublicSupplyList,
  storage: SelectionStorage,
): { selection: ListSelection; flaggedItemIds: number[] } {
  let stored: ListSelection | null = null;
  try {
    stored = parseSelection(storage.getItem(selectionKey(list.publicCode)));
  } catch {
    stored = null;
  }

  const selectable = toSelectableList(list);
  const earlier = stored ? toDomainLines(stored.lines) : null;
  const { selection, staleItemIds } = reconcileListSelection(selectable, earlier);

  return {
    selection: {
      v: 1,
      lines: fromDomainLines(selection.lines),
    },
    flaggedItemIds: staleItemIds as number[],
  };
}

export function saveSelection(
  publicCode: string,
  selection: ListSelection,
  storage: SelectionStorage,
): void {
  try {
    storage.setItem(selectionKey(publicCode), JSON.stringify(selection));
  } catch {
    // Storage may be full or blocked; the selection then lives for this page view only.
  }
}

/** Restores the defaults for a list: the next load reseeds. Also clears its Cart-drawer index entry. */
export function resetSelection(publicCode: string, storage: SelectionStorage): void {
  try {
    storage.removeItem(selectionKey(publicCode));
    const raw = storage.getItem(selectionIndexKey);
    if (!raw) return;
    const index: unknown = JSON.parse(raw);
    if (typeof index !== 'object' || index === null || !(publicCode in index)) return;
    const rest = { ...(index as Record<string, unknown>) };
    delete rest[publicCode];
    storage.setItem(selectionIndexKey, JSON.stringify(rest));
  } catch {
    // Nothing more to clear if storage is unavailable.
  }
}

/** Clamps to 1–999 on an enabled line; a switched-off line stays at 0. */
export function setQuantity(
  selection: ListSelection,
  listItemId: number,
  quantity: number,
): ListSelection {
  const domainSelection: DomainListSelection = {
    supplyListId: 1 as unknown as SupplyListId,
    lines: toDomainLines(selection.lines),
  };
  const updated = setSelectionQuantity(
    domainSelection,
    listItemId as unknown as SupplyListItemId,
    quantity,
  );
  return {
    v: 1,
    lines: fromDomainLines(updated.lines),
  };
}

/** Turns an optional item on at its prescribed quantity, or off. Required items cannot be turned off. */
export function setEnabled(
  selection: ListSelection,
  list: PublicSupplyList,
  listItemId: number,
  enabled: boolean,
): ListSelection {
  const selectable = toSelectableList(list);
  const domainSelection: DomainListSelection = {
    supplyListId: selectable.id,
    lines: toDomainLines(selection.lines),
  };
  const updated = setSelectionItemEnabled(
    domainSelection,
    selectable,
    listItemId as unknown as SupplyListItemId,
    enabled,
  );
  return {
    v: 1,
    lines: fromDomainLines(updated.lines),
  };
}

export function chooseVariant(
  selection: ListSelection,
  listItemId: number,
  variantId: number,
): ListSelection {
  const domainSelection: DomainListSelection = {
    supplyListId: 1 as unknown as SupplyListId,
    lines: toDomainLines(selection.lines),
  };
  const updated = chooseSelectionVariant(
    domainSelection,
    listItemId as unknown as SupplyListItemId,
    variantId as unknown as VariantId,
  );
  return {
    v: 1,
    lines: fromDomainLines(updated.lines),
  };
}

/** The lines that would be posted: switched-off (quantity 0) lines are stripped. */
export function linesForPost(selection: ListSelection): SelectionLine[] {
  const domainSelection: DomainListSelection = {
    supplyListId: 1 as unknown as SupplyListId,
    lines: toDomainLines(selection.lines),
  };
  return fromDomainLines(orderedSelectionLines(domainSelection));
}

/** The stale choices that block checkout. */
export function checkoutBlockingItemIds(
  list: PublicSupplyList,
  selection: ListSelection,
): number[] {
  const selectable = toSelectableList(list);
  const domainSelection: DomainListSelection = {
    supplyListId: selectable.id,
    lines: toDomainLines(selection.lines),
  };
  return domainCheckoutBlockingItemIds(selectable, domainSelection) as number[];
}

/** What the Cart drawer needs to link to an in-progress list without a network call. */
export interface SelectionIndexEntry {
  publicCode: string;
  title: string;
  schoolName: string;
  /** ISO timestamp of the last change. */
  updatedAt: string;
}

type StoredIndexEntry = Omit<SelectionIndexEntry, 'publicCode'>;

const isStoredEntry = (value: unknown): value is StoredIndexEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.title === 'string' &&
    typeof entry.schoolName === 'string' &&
    typeof entry.updatedAt === 'string'
  );
};

function readIndexRecord(storage: SelectionStorage): Record<string, StoredIndexEntry> {
  try {
    const raw = storage.getItem(selectionIndexKey);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, entry]) => isStoredEntry(entry)));
  } catch {
    return {};
  }
}

/** The in-progress lists, most recently changed first. */
export function readSelectionIndex(storage: SelectionStorage): SelectionIndexEntry[] {
  return Object.entries(readIndexRecord(storage))
    .map(([publicCode, entry]) => ({ publicCode, ...entry }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** True when every line is exactly what seeding would produce. */
export function isDefaultSelection(selection: ListSelection, list: PublicSupplyList): boolean {
  const selectable = toSelectableList(list);
  const domainSelection: DomainListSelection = {
    supplyListId: selectable.id,
    lines: toDomainLines(selection.lines),
  };
  return isDefaultListSelection(domainSelection, selectable);
}

/**
 * Keeps the Cart-drawer index in step with an edit: the entry appears on the
 * first change from the defaults and goes away when the defaults return.
 * Seeding alone never writes it.
 */
export function syncSelectionIndex(
  publicCode: string,
  selection: ListSelection,
  list: PublicSupplyList,
  meta: { title: string; schoolName: string },
  storage: SelectionStorage,
  now: Date = new Date(),
): void {
  try {
    const index = readIndexRecord(storage);
    if (isDefaultSelection(selection, list)) {
      if (!(publicCode in index)) return;
      delete index[publicCode];
    } else {
      index[publicCode] = { ...meta, updatedAt: now.toISOString() };
    }
    storage.setItem(selectionIndexKey, JSON.stringify(index));
  } catch {
    // The drawer link is a convenience; the selection itself is unaffected.
  }
}

export interface ListCompleteness {
  /** Required items on the list. */
  total: number;
  completed: number;
  missing: PublicSupplyListItem[];
}

/**
 * Advisory List Completeness (ADR-0011): delegates to domain listCompleteness.
 */
export function listCompleteness(
  list: PublicSupplyList,
  selection: ListSelection,
): ListCompleteness {
  const selectable = toSelectableList(list);
  const domainSelection: DomainListSelection = {
    supplyListId: selectable.id,
    lines: toDomainLines(selection.lines),
  };
  const result = domainListCompleteness(selectable, domainSelection);
  const itemById = new Map(list.items.map((i) => [i.id, i]));
  return {
    total: result.total,
    completed: result.completed,
    missing: result.missing.map((m) => itemById.get(m.id as number)!).filter(Boolean),
  };
}
