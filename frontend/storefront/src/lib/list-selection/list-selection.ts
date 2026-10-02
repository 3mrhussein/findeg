import type { PublicSupplyList, PublicSupplyListItem } from '@findeg/backend/features/school';

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

const clampQuantity = (quantity: number) => {
  const whole = Number.isFinite(quantity) ? Math.trunc(quantity) : MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, whole));
};

/** Enabled lines are clamped to 1–999; a required line can never be 0, an optional one may be off. */
const normalizeQuantity = (quantity: number, required: boolean) =>
  quantity === 0 && !required ? 0 : clampQuantity(quantity);

/** The server's eligibility result is the only authority; a default that dropped out of it is not eligible. */
const isEligibleChoice = (item: PublicSupplyListItem, variantId: number) =>
  item.eligibleVariants.some((variant) => variant.variantId === variantId);

export const selectionKey = (publicCode: string) => `${KEY_PREFIX}${publicCode}`;

export function seedSelection(list: PublicSupplyList): ListSelection {
  return {
    v: 1,
    lines: list.items.map((item) => ({
      listItemId: item.id,
      variantId: item.defaultVariant.variantId,
      quantity: item.required ? item.quantity : 0,
    })),
  };
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

/**
 * Reads the stored selection (reseeding when it is missing, unreadable or the
 * wrong version) and reconciles it against the list just read: lines for
 * unknown items are dropped, items without a line are seeded, and a line whose
 * variant is no longer eligible is kept but reported in `flaggedItemIds`.
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
  if (!stored) return { selection: seedSelection(list), flaggedItemIds: [] };

  const seeded = seedSelection(list);
  const storedByItem = new Map(stored.lines.map((line) => [line.listItemId, line]));
  const flaggedItemIds: number[] = [];

  const lines = list.items.map((item, index) => {
    const stored = storedByItem.get(item.id);
    if (!stored) return seeded.lines[index];
    // Exact Items have no Change control, so a stale variant is reset to the default.
    const line: SelectionLine = {
      ...stored,
      variantId: item.exactItem ? item.defaultVariant.variantId : stored.variantId,
      quantity: normalizeQuantity(stored.quantity, item.required),
    };
    if (!isEligibleChoice(item, line.variantId)) flaggedItemIds.push(item.id);
    return line;
  });

  return { selection: { v: 1, lines }, flaggedItemIds };
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

const mapLine = (
  selection: ListSelection,
  listItemId: number,
  update: (line: SelectionLine) => SelectionLine,
): ListSelection => ({
  v: 1,
  lines: selection.lines.map((line) => (line.listItemId === listItemId ? update(line) : line)),
});

/** Clamps to 1–999 on an enabled line; a switched-off line stays at 0. */
export function setQuantity(
  selection: ListSelection,
  listItemId: number,
  quantity: number,
): ListSelection {
  return mapLine(selection, listItemId, (line) => {
    if (line.quantity === 0) return line;
    return { ...line, quantity: clampQuantity(quantity) };
  });
}

/** Turns an optional item on at its prescribed quantity, or off. Required items cannot be turned off. */
export function setEnabled(
  selection: ListSelection,
  list: PublicSupplyList,
  listItemId: number,
  enabled: boolean,
): ListSelection {
  const item = list.items.find((candidate) => candidate.id === listItemId);
  if (!item || item.required) return selection;
  return mapLine(selection, listItemId, (line) => ({
    ...line,
    quantity: enabled ? clampQuantity(item.quantity) : 0,
  }));
}

export function chooseVariant(
  selection: ListSelection,
  listItemId: number,
  variantId: number,
): ListSelection {
  return mapLine(selection, listItemId, (line) => ({ ...line, variantId }));
}

/** The lines that would be posted: switched-off (quantity 0) lines are stripped. */
export function linesForPost(selection: ListSelection): SelectionLine[] {
  return selection.lines.filter((line) => line.quantity > 0);
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
  const seeded = seedSelection(list);
  return (
    selection.lines.length === seeded.lines.length &&
    seeded.lines.every((line, index) => {
      const current = selection.lines[index];
      return (
        current.listItemId === line.listItemId &&
        current.variantId === line.variantId &&
        current.quantity === line.quantity
      );
    })
  );
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
 * Advisory List Completeness (ADR-0011): a required item is complete when its
 * chosen variant is eligible and its quantity reaches the prescription. Optional
 * items never count. Computed on the client only and never stored.
 */
export function listCompleteness(
  list: PublicSupplyList,
  selection: ListSelection,
): ListCompleteness {
  const lineByItem = new Map(selection.lines.map((line) => [line.listItemId, line]));
  const required = list.items.filter((item) => item.required);
  const missing = required.filter((item) => {
    const line = lineByItem.get(item.id);
    if (!line || line.quantity < item.quantity) return true;
    return !isEligibleChoice(item, line.variantId);
  });
  return { total: required.length, completed: required.length - missing.length, missing };
}
