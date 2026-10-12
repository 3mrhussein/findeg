import type { VariantId } from '../catalog';
import type { ItemSpecification, SupplyListId, SupplyListItemId } from './index';
import { SUPPLY_LIST_ITEM_QUANTITY_MAX, SUPPLY_LIST_ITEM_QUANTITY_MIN, isExactItem } from './item';

/** One item's choice in a List Selection. A quantity of 0 is an optional item switched off. */
export interface SelectionLine {
  supplyListItemId: SupplyListItemId;
  variantId: VariantId;
  quantity: number;
}

/** A Customer's in-progress choices against one published list, kept apart from the Cart. */
export interface ListSelection {
  supplyListId: SupplyListId;
  /** One line per item, in the list's item order. */
  lines: readonly SelectionLine[];
}

/** A published list's item as a List Selection sees it. */
export interface SelectableItem {
  id: SupplyListItemId;
  required: boolean;
  /** The prescribed quantity. */
  quantity: number;
  defaultVariantId: VariantId;
  /** `null` for an Exact Item. */
  specification: ItemSpecification | null;
  /** The item's eligible variants as read now (see `eligibleVariants`). */
  eligibleVariantIds: readonly VariantId[];
}

/** A published list as a List Selection sees it. */
export interface SelectableList<I extends SelectableItem = SelectableItem> {
  id: SupplyListId;
  items: readonly I[];
}

/** A whole quantity from 1 to 999. A missing or non-finite one becomes 1. */
const clampQuantity = (quantity: number) => {
  const whole = Number.isFinite(quantity) ? Math.trunc(quantity) : SUPPLY_LIST_ITEM_QUANTITY_MIN;
  return Math.min(SUPPLY_LIST_ITEM_QUANTITY_MAX, Math.max(SUPPLY_LIST_ITEM_QUANTITY_MIN, whole));
};

/** A required line is never 0; an optional one may be switched off. */
const normalizeQuantity = (quantity: number, required: boolean) =>
  quantity === 0 && !required ? 0 : clampQuantity(quantity);

/** Only the item's current eligible variants count; a default that dropped out is not eligible. */
const isEligibleChoice = (item: SelectableItem, variantId: VariantId) =>
  item.eligibleVariantIds.includes(variantId);

/** A first List Selection: required items at their default and prescribed quantity, optional items off. */
export function seedListSelection(list: SelectableList): ListSelection {
  return {
    supplyListId: list.id,
    lines: list.items.map((item) => ({
      supplyListItemId: item.id,
      variantId: item.defaultVariantId,
      quantity: item.required ? item.quantity : 0,
    })),
  };
}

/**
 * Brings earlier choices up to date with the list as read now. With no earlier choices it seeds.
 * Lines for unknown items are dropped and items without a line are seeded. Quantities are
 * clamped to 1..999 and a required line is lifted off 0. An Exact Item is reset to its default.
 * A line whose variant is no longer eligible is kept and reported as stale (SL-11).
 */
export function reconcileListSelection(
  list: SelectableList,
  earlier: readonly SelectionLine[] | null,
): { selection: ListSelection; staleItemIds: SupplyListItemId[] } {
  const seeded = seedListSelection(list);
  if (earlier === null) return { selection: seeded, staleItemIds: [] };
  const earlierByItem = new Map(earlier.map((line) => [line.supplyListItemId, line]));
  const lines = list.items.map((item, index): SelectionLine => {
    const line = earlierByItem.get(item.id);
    if (!line) return seeded.lines[index];
    return {
      supplyListItemId: item.id,
      variantId: isExactItem(item) ? item.defaultVariantId : line.variantId,
      quantity: normalizeQuantity(line.quantity, item.required),
    };
  });
  const selection = { supplyListId: list.id, lines };
  return { selection, staleItemIds: staleSelectionItemIds(list, selection) };
}

/** The items whose chosen variant is no longer eligible, whether switched on or off. */
function staleSelectionItemIds(list: SelectableList, selection: ListSelection): SupplyListItemId[] {
  const itemById = new Map(list.items.map((item) => [item.id, item]));
  return selection.lines.flatMap((line) => {
    const item = itemById.get(line.supplyListItemId);
    return item && !isEligibleChoice(item, line.variantId) ? [line.supplyListItemId] : [];
  });
}

/**
 * The stale choices that block checkout (SL-11): stale lines that are switched on. A switched-off
 * optional line was never chosen, so it blocks only once it is turned on. Completeness never
 * blocks.
 */
export function checkoutBlockingItemIds(
  list: SelectableList,
  selection: ListSelection,
): SupplyListItemId[] {
  const enabled = new Set(orderedSelectionLines(selection).map((line) => line.supplyListItemId));
  return staleSelectionItemIds(list, selection).filter((id) => enabled.has(id));
}

/**
 * Whether a list line is a substitute: its chosen variant is not the item's default. Order
 * attribution and Partner Reports record it on every list line.
 */
export function isSubstitute(
  item: { defaultVariantId: VariantId | null },
  variantId: VariantId,
): boolean {
  return item.defaultVariantId !== variantId;
}

function mapLine(
  selection: ListSelection,
  supplyListItemId: SupplyListItemId,
  update: (line: SelectionLine) => SelectionLine,
): ListSelection {
  return {
    supplyListId: selection.supplyListId,
    lines: selection.lines.map((line) =>
      line.supplyListItemId === supplyListItemId ? update(line) : line,
    ),
  };
}

/** Sets an enabled line's quantity, clamped to 1..999. A switched-off line stays at 0. */
export function setSelectionQuantity(
  selection: ListSelection,
  supplyListItemId: SupplyListItemId,
  quantity: number,
): ListSelection {
  return mapLine(selection, supplyListItemId, (line) =>
    line.quantity === 0 ? line : { ...line, quantity: clampQuantity(quantity) },
  );
}

/** Turns an optional item on at its prescribed quantity, or off. A required item cannot be turned off. */
export function setSelectionItemEnabled(
  selection: ListSelection,
  list: SelectableList,
  supplyListItemId: SupplyListItemId,
  enabled: boolean,
): ListSelection {
  const item = list.items.find((candidate) => candidate.id === supplyListItemId);
  if (!item || item.required) return selection;
  return mapLine(selection, supplyListItemId, (line) => ({
    ...line,
    quantity: enabled ? clampQuantity(item.quantity) : 0,
  }));
}

/** Chooses a variant for an item. An ineligible choice shows up as stale. */
export function chooseSelectionVariant(
  selection: ListSelection,
  supplyListItemId: SupplyListItemId,
  variantId: VariantId,
): ListSelection {
  return mapLine(selection, supplyListItemId, (line) => ({ ...line, variantId }));
}

/** The lines a checkout orders: switched-off (quantity 0) lines are left out. */
export function orderedSelectionLines(selection: ListSelection): SelectionLine[] {
  return selection.lines.filter((line) => line.quantity > 0);
}

/** True when every line is exactly what seeding would produce. */
export function isDefaultListSelection(selection: ListSelection, list: SelectableList): boolean {
  const seeded = seedListSelection(list);
  return (
    selection.lines.length === seeded.lines.length &&
    seeded.lines.every((line, index) => {
      const current = selection.lines[index];
      return (
        current.supplyListItemId === line.supplyListItemId &&
        current.variantId === line.variantId &&
        current.quantity === line.quantity
      );
    })
  );
}

export interface ListCompleteness<I extends SelectableItem = SelectableItem> {
  /** Required items on the list. */
  total: number;
  completed: number;
  missing: I[];
}

/**
 * Advisory List Completeness (ADR-0011): a required item is complete when its chosen variant is
 * eligible and its quantity reaches the prescription. Optional items never count. It never
 * blocks checkout and never changes the List Offer.
 */
export function listCompleteness<I extends SelectableItem>(
  list: SelectableList<I>,
  selection: ListSelection,
): ListCompleteness<I> {
  const lineByItem = new Map(selection.lines.map((line) => [line.supplyListItemId, line]));
  const required = list.items.filter((item) => item.required);
  const missing = required.filter((item) => {
    const line = lineByItem.get(item.id);
    if (!line || line.quantity < item.quantity) return true;
    return !isEligibleChoice(item, line.variantId);
  });
  return { total: required.length, completed: required.length - missing.length, missing };
}
