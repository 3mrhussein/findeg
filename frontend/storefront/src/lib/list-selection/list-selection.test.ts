import { beforeEach, describe, expect, it } from 'vitest';
import type { PublicSupplyList, PublicSupplyListItem } from '@findeg/backend/features/school';
import {
  chooseVariant,
  isDefaultSelection,
  listCompleteness,
  linesForPost,
  loadSelection,
  readSelectionIndex,
  resetSelection,
  saveSelection,
  seedSelection,
  selectionIndexKey,
  selectionKey,
  setEnabled,
  syncSelectionIndex,
  setQuantity,
  type SelectionLine,
} from './list-selection';

const variant = (variantId: number) => ({
  variantId,
  sku: `SKU-${variantId}`,
  name: { en: `Variant ${variantId}` },
  variantLabel: {},
  brand: null,
  price: '10.00',
  inStock: true,
});

const item = (id: number, over: Partial<PublicSupplyListItem> = {}): PublicSupplyListItem => ({
  id,
  required: true,
  quantity: 3,
  exactItem: false,
  specification: null,
  label: { en: `Item ${id}` },
  note: null,
  defaultVariant: variant(id * 10),
  eligibleVariants: [
    { ...variant(id * 10), differingAttributes: {} },
    { ...variant(id * 10 + 1), differingAttributes: { colour: 'red' } },
  ],
  ...over,
});

const list = (items: PublicSupplyListItem[], over: Partial<PublicSupplyList> = {}) =>
  ({
    publicCode: 'a'.repeat(32),
    status: 'published',
    items,
    ...over,
  }) as PublicSupplyList;

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

describe('list selection', () => {
  let storage: MemoryStorage;
  beforeEach(() => {
    storage = new MemoryStorage();
  });

  const l = list([item(1), item(2, { required: false, quantity: 2 })]);

  describe('seeding', () => {
    it('seeds required items at default and prescribed quantity, optional items off', () => {
      expect(seedSelection(l)).toEqual({
        v: 1,
        lines: [
          { listItemId: 1, variantId: 10, quantity: 3 },
          { listItemId: 2, variantId: 20, quantity: 0 },
        ],
      });
    });

    it('seeds on first visit and keys storage by public code', () => {
      const { selection } = loadSelection(l, storage);
      expect(selection).toEqual(seedSelection(l));
      expect(selectionKey(l.publicCode)).toBe(`findeg:list-selection:${l.publicCode}`);
    });

    it.each([
      ['unparseable JSON', '{nope'],
      ['wrong version', JSON.stringify({ v: 2, lines: [] })],
      ['malformed lines', JSON.stringify({ v: 1, lines: [{ listItemId: 'x' }] })],
      ['non-object', '42'],
    ])('reseeds on %s', (_name, raw) => {
      storage.setItem(selectionKey(l.publicCode), raw);
      expect(loadSelection(l, storage).selection).toEqual(seedSelection(l));
    });

    it('reseeds when storage throws', () => {
      const broken = {
        getItem: () => {
          throw new Error('denied');
        },
        setItem: () => undefined,
        removeItem: () => undefined,
      };
      expect(loadSelection(l, broken).selection).toEqual(seedSelection(l));
    });
  });

  describe('persistence', () => {
    it('round-trips a saved selection', () => {
      const edited = setQuantity(seedSelection(l), 1, 5);
      saveSelection(l.publicCode, edited, storage);
      expect(loadSelection(l, storage).selection).toEqual(edited);
    });

    it('reset removes the stored selection so the defaults return', () => {
      saveSelection(l.publicCode, setQuantity(seedSelection(l), 1, 5), storage);
      resetSelection(l.publicCode, storage);
      expect(storage.getItem(selectionKey(l.publicCode))).toBeNull();
      expect(loadSelection(l, storage).selection).toEqual(seedSelection(l));
    });

    it("never carries an archived list's selection into its replacement", () => {
      const archived = list(l.items, {
        status: 'archived',
        replacementPublicCode: 'b'.repeat(32),
      });
      saveSelection(archived.publicCode, setQuantity(seedSelection(archived), 1, 9), storage);
      const replacement = list(l.items, { publicCode: 'b'.repeat(32) });
      expect(loadSelection(replacement, storage).selection).toEqual(seedSelection(replacement));
    });
  });

  describe('reconciliation', () => {
    it('keeps a line whose variant is no longer eligible and flags it', () => {
      saveSelection(
        l.publicCode,
        {
          v: 1,
          lines: [
            { listItemId: 1, variantId: 999, quantity: 2 },
            ...seedSelection(l).lines.slice(1),
          ],
        },
        storage,
      );
      const { selection, flaggedItemIds } = loadSelection(l, storage);
      expect(selection.lines[0]).toEqual({ listItemId: 1, variantId: 999, quantity: 2 });
      expect(flaggedItemIds).toEqual([1]);
    });

    it('does not flag an eligible non-default variant', () => {
      saveSelection(l.publicCode, chooseVariant(seedSelection(l), 1, 11), storage);
      expect(loadSelection(l, storage).flaggedItemIds).toEqual([]);
    });

    it('drops lines for unknown list items and seeds items with no line', () => {
      saveSelection(
        l.publicCode,
        {
          v: 1,
          lines: [
            { listItemId: 1, variantId: 10, quantity: 4 },
            { listItemId: 77, variantId: 1, quantity: 1 },
          ],
        },
        storage,
      );
      expect(loadSelection(l, storage).selection.lines).toEqual([
        { listItemId: 1, variantId: 10, quantity: 4 },
        { listItemId: 2, variantId: 20, quantity: 0 },
      ]);
    });
  });

  describe('normalising stored lines', () => {
    it('clamps stored quantities and lifts required lines off 0', () => {
      saveSelection(
        l.publicCode,
        {
          v: 1,
          lines: [
            { listItemId: 1, variantId: 10, quantity: 0 },
            { listItemId: 2, variantId: 20, quantity: 5000 },
          ],
        },
        storage,
      );
      expect(loadSelection(l, storage).selection.lines.map((x) => x.quantity)).toEqual([1, 999]);
    });

    it('resets an Exact Item to its default instead of flagging it', () => {
      const exact = list([
        item(1, {
          exactItem: true,
          eligibleVariants: [{ ...variant(10), differingAttributes: {} }],
        }),
      ]);
      saveSelection(
        exact.publicCode,
        { v: 1, lines: [{ listItemId: 1, variantId: 999, quantity: 3 }] },
        storage,
      );
      const { selection, flaggedItemIds } = loadSelection(exact, storage);
      expect(selection.lines[0].variantId).toBe(10);
      expect(flaggedItemIds).toEqual([]);
    });
  });

  describe('editing', () => {
    it('clamps quantity to 1..999 on enabled lines', () => {
      const s = seedSelection(l);
      expect(setQuantity(s, 1, 0).lines[0].quantity).toBe(1);
      expect(setQuantity(s, 1, -4).lines[0].quantity).toBe(1);
      expect(setQuantity(s, 1, 5000).lines[0].quantity).toBe(999);
      expect(setQuantity(s, 1, 2.7).lines[0].quantity).toBe(2);
      expect(setQuantity(s, 1, Number.NaN).lines[0].quantity).toBe(1);
    });

    it('leaves a disabled line at 0 when a quantity is set', () => {
      expect(setQuantity(seedSelection(l), 2, 5).lines[1].quantity).toBe(0);
    });

    it('turns optional items on at the prescribed quantity and off again', () => {
      const on = setEnabled(seedSelection(l), l, 2, true);
      expect(on.lines[1].quantity).toBe(2);
      expect(setEnabled(on, l, 2, false).lines[1].quantity).toBe(0);
    });

    it('does not turn required items off', () => {
      expect(setEnabled(seedSelection(l), l, 1, false).lines[0].quantity).toBe(3);
    });
  });

  describe('cart-drawer index', () => {
    const meta = { title: 'Grade 4', schoolName: 'Nile School' };
    const now = new Date('2026-10-02T10:00:00.000Z');
    const edit = (selection = seedSelection(l)) => setQuantity(selection, 1, 5);

    it('is not written when the list is only seeded or visited', () => {
      loadSelection(l, storage);
      syncSelectionIndex(l.publicCode, seedSelection(l), l, meta, storage, now);
      expect(storage.getItem(selectionIndexKey)).toBeNull();
      expect(readSelectionIndex(storage)).toEqual([]);
    });

    it('is written on the first change from the defaults', () => {
      syncSelectionIndex(l.publicCode, edit(), l, meta, storage, now);
      expect(readSelectionIndex(storage)).toEqual([
        { publicCode: l.publicCode, ...meta, updatedAt: now.toISOString() },
      ]);
    });

    it('refreshes the updated time on later changes without duplicating the entry', () => {
      syncSelectionIndex(l.publicCode, edit(), l, meta, storage, now);
      const later = new Date('2026-10-03T10:00:00.000Z');
      syncSelectionIndex(l.publicCode, setQuantity(edit(), 1, 6), l, meta, storage, later);
      expect(readSelectionIndex(storage)).toEqual([
        { publicCode: l.publicCode, ...meta, updatedAt: later.toISOString() },
      ]);
    });

    it('is removed when the selection returns to the defaults', () => {
      syncSelectionIndex(l.publicCode, edit(), l, meta, storage, now);
      syncSelectionIndex(l.publicCode, seedSelection(l), l, meta, storage, now);
      expect(readSelectionIndex(storage)).toEqual([]);
    });

    it('is removed by reset and leaves other lists alone', () => {
      const other = list(l.items, { publicCode: 'b'.repeat(32) });
      syncSelectionIndex(l.publicCode, edit(), l, meta, storage, now);
      syncSelectionIndex(other.publicCode, edit(seedSelection(other)), other, meta, storage, now);
      resetSelection(l.publicCode, storage);
      expect(readSelectionIndex(storage).map((entry) => entry.publicCode)).toEqual([
        other.publicCode,
      ]);
    });

    it('ignores a corrupt index', () => {
      storage.setItem(selectionIndexKey, '{not json');
      expect(readSelectionIndex(storage)).toEqual([]);
      storage.setItem(selectionIndexKey, JSON.stringify({ x: { title: 1 } }));
      expect(readSelectionIndex(storage)).toEqual([]);
    });

    it('detects the default selection', () => {
      expect(isDefaultSelection(seedSelection(l), l)).toBe(true);
      expect(isDefaultSelection(chooseVariant(seedSelection(l), 1, 11), l)).toBe(false);
    });
  });

  describe('posting', () => {
    it('strips quantity-0 lines', () => {
      expect(linesForPost(seedSelection(l))).toEqual([
        { listItemId: 1, variantId: 10, quantity: 3 },
      ]);
    });
  });
});

describe('listCompleteness', () => {
  const complete = (items: PublicSupplyListItem[], lines: SelectionLine[]) =>
    listCompleteness(list(items), { v: 1, lines });

  it('counts a required item at its default and prescribed quantity', () => {
    const result = complete([item(1)], [{ listItemId: 1, variantId: 10, quantity: 3 }]);
    expect(result).toEqual({ total: 1, completed: 1, missing: [] });
  });

  it('counts any eligible substitute toward the item', () => {
    const result = complete([item(1)], [{ listItemId: 1, variantId: 11, quantity: 3 }]);
    expect(result.completed).toBe(1);
  });

  it('does not count a default that dropped out of the server eligibility', () => {
    const result = complete(
      [item(1, { eligibleVariants: [{ ...variant(11), differingAttributes: {} }] })],
      [{ listItemId: 1, variantId: 10, quantity: 3 }],
    );
    expect(result.completed).toBe(0);
  });

  it('counts a quantity above the prescription as complete', () => {
    const result = complete([item(1)], [{ listItemId: 1, variantId: 10, quantity: 6 }]);
    expect(result.completed).toBe(1);
  });

  it('lists a required item below its prescribed quantity as missing', () => {
    const a = item(1);
    const result = complete([a], [{ listItemId: 1, variantId: 10, quantity: 2 }]);
    expect(result).toEqual({ total: 1, completed: 0, missing: [a] });
  });

  it('does not count a variant that is no longer eligible', () => {
    const result = complete([item(1)], [{ listItemId: 1, variantId: 99, quantity: 3 }]);
    expect(result.completed).toBe(0);
    expect(result.missing).toHaveLength(1);
  });

  it('never counts optional items, on or off', () => {
    const optional = item(2, { required: false });
    const result = complete(
      [item(1), optional],
      [
        { listItemId: 1, variantId: 10, quantity: 3 },
        { listItemId: 2, variantId: 20, quantity: 3 },
      ],
    );
    expect(result).toEqual({ total: 1, completed: 1, missing: [] });
  });

  it('treats an item with no line as missing', () => {
    expect(complete([item(1)], []).missing).toHaveLength(1);
  });
});
