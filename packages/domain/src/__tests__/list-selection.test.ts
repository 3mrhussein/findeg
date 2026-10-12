import { describe, expect, it } from 'vitest';
import { money } from '@findeg/domain/common';
import type { CategoryId, VariantId } from '@findeg/domain/catalog';
import { priceListOfferLine } from '@findeg/domain/orders';
import {
  checkoutBlockingItemIds,
  chooseSelectionVariant,
  isDefaultListSelection,
  isSubstitute,
  listOfferBasisPointsAt,
  type ListOfferId,
  listCompleteness,
  orderedSelectionLines,
  reconcileListSelection,
  seedListSelection,
  setSelectionItemEnabled,
  setSelectionQuantity,
  type ListSelection,
  type SelectableItem,
  type SelectableList,
  type SelectionLine,
  type SupplyListId,
  type SupplyListItemId,
} from '@findeg/domain/school-lists';

// Ported from the Storefront's `list-selection` tests. Browser persistence (storage keys,
// parsing, the Cart-drawer index) stays in the Storefront; these are the business rules.

const variantId = (n: number) => n as VariantId;
const itemId = (n: number) => n as SupplyListItemId;
const LIST = 5 as SupplyListId;

const item = (id: number, over: Partial<SelectableItem> = {}): SelectableItem => ({
  id: itemId(id),
  required: true,
  quantity: 3,
  defaultVariantId: variantId(id * 10),
  specification: { categoryId: 1 as CategoryId, attributes: {} },
  eligibleVariantIds: [variantId(id * 10), variantId(id * 10 + 1)],
  ...over,
});

const list = (items: SelectableItem[]): SelectableList => ({ id: LIST, items });

const line = (item: number, variant: number, quantity: number): SelectionLine => ({
  supplyListItemId: itemId(item),
  variantId: variantId(variant),
  quantity,
});

const selection = (lines: SelectionLine[]): ListSelection => ({ supplyListId: LIST, lines });

describe('List Selection (SL-10 to SL-12, ADR-0011)', () => {
  const l = list([item(1), item(2, { required: false, quantity: 2 })]);

  describe('seeding', () => {
    it('seeds required items at default and prescribed quantity, optional items off', () => {
      expect(seedListSelection(l)).toEqual(selection([line(1, 10, 3), line(2, 20, 0)]));
    });

    it('seeds when there are no earlier choices', () => {
      expect(reconcileListSelection(l, null)).toEqual({
        selection: seedListSelection(l),
        staleItemIds: [],
      });
    });
  });

  describe('reconciling earlier choices with the list as read now', () => {
    it('keeps earlier choices', () => {
      const edited = setSelectionQuantity(seedListSelection(l), itemId(1), 5);
      expect(reconcileListSelection(l, edited.lines).selection).toEqual(edited);
    });

    it('keeps a line whose variant is no longer eligible and flags it as stale', () => {
      const { selection: s, staleItemIds } = reconcileListSelection(l, [
        line(1, 999, 2),
        line(2, 20, 0),
      ]);
      expect(s.lines[0]).toEqual(line(1, 999, 2));
      expect(staleItemIds).toEqual([itemId(1)]);
    });

    it('does not flag an eligible non-default variant', () => {
      const chosen = chooseSelectionVariant(seedListSelection(l), itemId(1), variantId(11));
      expect(reconcileListSelection(l, chosen.lines).staleItemIds).toEqual([]);
    });

    it('drops lines for unknown list items and seeds items with no line', () => {
      expect(reconcileListSelection(l, [line(1, 10, 4), line(77, 1, 1)]).selection.lines).toEqual([
        line(1, 10, 4),
        line(2, 20, 0),
      ]);
    });

    it('clamps quantities and lifts required lines off 0', () => {
      const { selection: s } = reconcileListSelection(l, [line(1, 10, 0), line(2, 20, 5000)]);
      expect(s.lines.map((x) => x.quantity)).toEqual([1, 999]);
    });

    it('resets an Exact Item to its default instead of flagging it', () => {
      const exact = list([item(1, { specification: null, eligibleVariantIds: [variantId(10)] })]);
      const { selection: s, staleItemIds } = reconcileListSelection(exact, [line(1, 999, 3)]);
      expect(s.lines[0].variantId).toBe(10);
      expect(staleItemIds).toEqual([]);
    });
  });

  describe('editing', () => {
    it('clamps quantity to 1..999 on enabled lines', () => {
      const s = seedListSelection(l);
      const quantity = (value: number) =>
        setSelectionQuantity(s, itemId(1), value).lines[0].quantity;
      expect(quantity(0)).toBe(1);
      expect(quantity(-4)).toBe(1);
      expect(quantity(5000)).toBe(999);
      expect(quantity(2.7)).toBe(2);
      expect(quantity(Number.NaN)).toBe(1);
    });

    it('leaves a switched-off line at 0 when a quantity is set', () => {
      expect(setSelectionQuantity(seedListSelection(l), itemId(2), 5).lines[1].quantity).toBe(0);
    });

    it('turns optional items on at the prescribed quantity and off again', () => {
      const on = setSelectionItemEnabled(seedListSelection(l), l, itemId(2), true);
      expect(on.lines[1].quantity).toBe(2);
      expect(setSelectionItemEnabled(on, l, itemId(2), false).lines[1].quantity).toBe(0);
    });

    it('does not turn required items off', () => {
      const s = setSelectionItemEnabled(seedListSelection(l), l, itemId(1), false);
      expect(s.lines[0].quantity).toBe(3);
    });

    it('chooses another variant for an item', () => {
      const s = chooseSelectionVariant(seedListSelection(l), itemId(1), variantId(11));
      expect(s.lines[0]).toEqual(line(1, 11, 3));
    });

    it('detects the default selection', () => {
      expect(isDefaultListSelection(seedListSelection(l), l)).toBe(true);
      const chosen = chooseSelectionVariant(seedListSelection(l), itemId(1), variantId(11));
      expect(isDefaultListSelection(chosen, l)).toBe(false);
    });
  });

  describe('ordering', () => {
    it('orders only the lines that are switched on', () => {
      expect(orderedSelectionLines(seedListSelection(l))).toEqual([line(1, 10, 3)]);
    });
  });
});

describe('List Completeness is advisory (ADR-0011)', () => {
  const complete = (items: SelectableItem[], lines: SelectionLine[]) =>
    listCompleteness(list(items), selection(lines));

  it('counts a required item at its default and prescribed quantity', () => {
    expect(complete([item(1)], [line(1, 10, 3)])).toEqual({ total: 1, completed: 1, missing: [] });
  });

  it('counts any eligible substitute toward the item', () => {
    expect(complete([item(1)], [line(1, 11, 3)]).completed).toBe(1);
  });

  it('does not count a default that dropped out of eligibility', () => {
    const narrowed = item(1, { eligibleVariantIds: [variantId(11)] });
    expect(complete([narrowed], [line(1, 10, 3)]).completed).toBe(0);
  });

  it('counts a quantity above the prescription as complete', () => {
    expect(complete([item(1)], [line(1, 10, 6)]).completed).toBe(1);
  });

  it('lists a required item below its prescribed quantity as missing', () => {
    const a = item(1);
    expect(complete([a], [line(1, 10, 2)])).toEqual({ total: 1, completed: 0, missing: [a] });
  });

  it('does not count a variant that is no longer eligible', () => {
    const result = complete([item(1)], [line(1, 99, 3)]);
    expect(result.completed).toBe(0);
    expect(result.missing).toHaveLength(1);
  });

  it('never counts optional items, on or off', () => {
    const optional = item(2, { required: false });
    expect(complete([item(1), optional], [line(1, 10, 3), line(2, 20, 3)])).toEqual({
      total: 1,
      completed: 1,
      missing: [],
    });
  });

  it('treats an item with no line as missing', () => {
    expect(complete([item(1)], []).missing).toHaveLength(1);
  });
});

describe('stale choices block checkout (SL-11); completeness never does', () => {
  const l = list([item(1), item(2, { required: false, quantity: 2 })]);

  it('blocks checkout on a stale line that is switched on', () => {
    const stale = selection([line(1, 999, 3), line(2, 20, 0)]);
    expect(checkoutBlockingItemIds(l, stale)).toEqual([itemId(1)]);
  });

  it('does not block on a switched-off stale line until it is turned on', () => {
    const off = selection([line(1, 10, 3), line(2, 999, 0)]);
    expect(checkoutBlockingItemIds(l, off)).toEqual([]);
    const on = setSelectionItemEnabled(off, l, itemId(2), true);
    expect(checkoutBlockingItemIds(l, on)).toEqual([itemId(2)]);
  });

  it('unblocks once an eligible variant is chosen', () => {
    const stale = selection([line(1, 999, 3), line(2, 20, 0)]);
    const fixed = chooseSelectionVariant(stale, itemId(1), variantId(11));
    expect(checkoutBlockingItemIds(l, fixed)).toEqual([]);
  });

  it('does not block an incomplete selection', () => {
    const short = selection([line(1, 10, 1), line(2, 20, 0)]);
    expect(listCompleteness(l, short).completed).toBe(0);
    expect(checkoutBlockingItemIds(l, short)).toEqual([]);
  });
});

describe('substitute flag', () => {
  it('is false for the default variant and true for any other choice', () => {
    expect(isSubstitute(item(1), variantId(10))).toBe(false);
    expect(isSubstitute(item(1), variantId(11))).toBe(true);
  });
});

describe('List Offer applies to every line (ADR-0007)', () => {
  const l = list([item(1), item(2)]);
  const at = new Date('2026-10-15T00:00:00.000Z');
  const offer = {
    id: 1 as ListOfferId,
    supplyListId: LIST,
    basisPoints: 1000,
    startsAt: new Date('2026-10-01T00:00:00.000Z'),
    endsAt: null,
  };

  it('discounts the default and a substitute alike, whether or not the list is complete', () => {
    // Item 1 takes a substitute; item 2 is the default but short of its prescription.
    const s = selection([line(1, 11, 3), line(2, 20, 1)]);
    expect(listCompleteness(l, s).completed).toBe(1);
    expect(isSubstitute(item(1), variantId(11))).toBe(true);

    const basisPoints = listOfferBasisPointsAt(offer, at);
    const discounts = orderedSelectionLines(s).map(
      (ordered) => priceListOfferLine(money(1000n), ordered.quantity, basisPoints).discount,
    );
    expect(discounts).toEqual([money(300n), money(100n)]);
  });
});
