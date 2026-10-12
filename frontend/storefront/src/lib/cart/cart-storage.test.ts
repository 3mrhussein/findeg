import { beforeEach, describe, expect, it } from 'vitest';
import {
  addLine,
  clearCartStorage,
  loadMetadataMap,
  loadStoredCart,
  removeLine,
  saveMetadataMap,
  saveStoredCart,
  toClientCartItems,
  updateLineQuantity,
  type CartStorage,
  type StoredCart,
} from './cart-storage';

class MemoryStorage implements CartStorage {
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

describe('client cart storage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('loads an empty cart when nothing is stored', () => {
    const cart = loadStoredCart(storage);
    expect(cart).toEqual({ v: 1, lines: [] });
  });

  it('stores price-free lines and round-trips them cleanly', () => {
    const cart: StoredCart = {
      v: 1,
      lines: [
        { variantId: 101, quantity: 2 },
        { variantId: 102, quantity: 5 },
      ],
    };
    saveStoredCart(cart, storage);

    const reloaded = loadStoredCart(storage);
    expect(reloaded).toEqual(cart);
  });

  it('merges quantities when adding an existing variant line through domain rules', () => {
    const initial: StoredCart = {
      v: 1,
      lines: [{ variantId: 101, quantity: 2 }],
    };
    const { cart } = addLine(initial, { variantId: 101, quantity: 3 });
    expect(cart.lines).toEqual([{ variantId: 101, quantity: 5 }]);
  });

  it('adds a new line when variant is not in the cart', () => {
    const initial: StoredCart = {
      v: 1,
      lines: [{ variantId: 101, quantity: 2 }],
    };
    const { cart } = addLine(initial, { variantId: 102, quantity: 1 });
    expect(cart.lines).toEqual([
      { variantId: 101, quantity: 2 },
      { variantId: 102, quantity: 1 },
    ]);
  });

  it('updates line quantity and clamps within 1..999', () => {
    const initial: StoredCart = {
      v: 1,
      lines: [{ variantId: 101, quantity: 2 }],
    };
    const updated = updateLineQuantity(initial, 101, 10);
    expect(updated.lines).toEqual([{ variantId: 101, quantity: 10 }]);
  });

  it('removes a line when quantity is set to 0 or removeLine is called', () => {
    const initial: StoredCart = {
      v: 1,
      lines: [
        { variantId: 101, quantity: 2 },
        { variantId: 102, quantity: 3 },
      ],
    };
    const updated = updateLineQuantity(initial, 101, 0);
    expect(updated.lines).toEqual([{ variantId: 102, quantity: 3 }]);

    const removed = removeLine(updated, 102);
    expect(removed.lines).toEqual([]);
  });

  it('recovers gracefully on corrupt or invalid stored JSON', () => {
    storage.setItem('findeg:cart', '{invalid-json');
    expect(loadStoredCart(storage)).toEqual({ v: 1, lines: [] });

    storage.setItem('findeg:cart', JSON.stringify({ v: 2, lines: [] }));
    expect(loadStoredCart(storage)).toEqual({ v: 1, lines: [] });

    storage.setItem('findeg:cart', JSON.stringify({ v: 1, lines: [{ variantId: 'x' }] }));
    expect(loadStoredCart(storage)).toEqual({ v: 1, lines: [] });
  });

  it('recovers gracefully when storage throws', () => {
    const throwingStorage: CartStorage = {
      getItem: () => {
        throw new Error('Storage access blocked');
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    expect(loadStoredCart(throwingStorage)).toEqual({ v: 1, lines: [] });
  });

  it('persists and clears both cart lines and metadata', () => {
    const cart: StoredCart = { v: 1, lines: [{ variantId: 101, quantity: 2 }] };
    const meta = { '101': { productName: 'Notebook', unitPrice: 25 } };

    saveStoredCart(cart, storage);
    saveMetadataMap(meta, storage);

    expect(loadStoredCart(storage)).toEqual(cart);
    expect(loadMetadataMap(storage)).toEqual(meta);

    clearCartStorage(storage);

    expect(loadStoredCart(storage)).toEqual({ v: 1, lines: [] });
    expect(loadMetadataMap(storage)).toEqual({});
  });

  it('hydrates ClientCartItems correctly from lines and metadata map', () => {
    const cart: StoredCart = {
      v: 1,
      lines: [
        { variantId: 101, quantity: 3 },
        { variantId: 102, quantity: 1 },
      ],
    };
    const metaMap = {
      '101': { productName: 'Blue Pen', unitPrice: 10, sku: 'PEN-01' },
    };

    const items = toClientCartItems(cart, metaMap);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      variantId: 101,
      quantity: 3,
      productName: 'Blue Pen',
      unitPrice: 10,
      sku: 'PEN-01',
      currency: 'EGP',
    });
    expect(items[1]).toMatchObject({
      variantId: 102,
      quantity: 1,
      productName: 'Item #102',
      unitPrice: 0,
      currency: 'EGP',
    });
  });
});
