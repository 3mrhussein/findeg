import { describe, expect, it } from 'vitest';
import { CartService } from '../application/services/CartService';
import { CartEntity, type CartItem } from '../domain/entities/Cart';

function item(quantity: number): CartItem {
  return {
    productId: 1,
    variantId: 1,
    sku: 'PEN',
    productName: 'Pen',
    variantLabel: '',
    quantity,
    unitPrice: 2,
    currency: 'EGP',
  };
}

describe('Server cart delegates quantity and merge rules to Domain', () => {
  it('merges duplicates and preserves metadata and totals', () => {
    const service = new CartService();
    expect(service.addToCart([item(998)], item(1))).toEqual([item(999)]);
    expect(service.getTotals([item(2), item(3)])).toEqual({ totalItems: 5, totalPrice: 10 });
    expect(new CartEntity([item(2), item(3)]).getItems()).toEqual([item(5)]);
  });

  it.each([0, -1, 1.5, 1000])('refuses quantity %s in adds and updates', (quantity) => {
    const service = new CartService();
    expect(() => service.addToCart([], item(quantity))).toThrow();
    expect(() => service.updateQuantity([item(1)], 1, quantity)).toThrow();
  });

  it('refuses an overflowing managed merge without mutating stored items', async () => {
    const service = new CartService();
    const id = 'domain-cart-overflow';
    await service.clearCart(id);
    await service.addItem(id, item(998));
    await expect(service.addItem(id, item(2))).rejects.toThrow();
    expect((await service.getCart(id)).items).toEqual([item(998)]);
    await expect(service.updateItemQuantity(id, 1, 0)).rejects.toThrow();
    expect((await service.getCart(id)).items).toEqual([item(998)]);
    await service.clearCart(id);
  });
});
