import type { PublicSupplyList } from '@findeg/backend/features/school';

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
const INDEX_KEY = 'findeg:list-selection-index';

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
    const line = storedByItem.get(item.id);
    if (!line) return seeded.lines[index];
    const eligible =
      line.variantId === item.defaultVariant.variantId ||
      item.eligibleVariants.some((variant) => variant.variantId === line.variantId);
    if (!eligible) flaggedItemIds.push(item.id);
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
    const raw = storage.getItem(INDEX_KEY);
    if (!raw) return;
    const index: unknown = JSON.parse(raw);
    if (typeof index !== 'object' || index === null || !(publicCode in index)) return;
    const rest = { ...(index as Record<string, unknown>) };
    delete rest[publicCode];
    storage.setItem(INDEX_KEY, JSON.stringify(rest));
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
    const whole = Number.isFinite(quantity) ? Math.trunc(quantity) : MIN_QUANTITY;
    return { ...line, quantity: Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, whole)) };
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
    quantity: enabled ? Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, item.quantity)) : 0,
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
