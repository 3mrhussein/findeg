'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@findeg/backend/features/cart';
import type { Product } from '@findeg/backend/features/catalog';

export interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    productId: number,
    quantity: number,
    options: { variantId: number },
  ) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartSelectors {
  variantKey?: string;
}

/**
 *
 */
function getGuestId() {
  const storageKey = 'findeg_guest_id';
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const generated = `guest_${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

/**
 *
 */
function parseVariantId(variantId?: string): CartSelectors {
  if (!variantId) return {};

  try {
    const parsed = JSON.parse(variantId) as CartSelectors;
    return {
      variantKey: parsed.variantKey,
    };
  } catch {
    // Legacy/simple variant ids are plain keys (e.g. "default"), not JSON blobs.
    return { variantKey: variantId };
  }
}

/**
 *
 */
function toCartItems(rawItems: any[]): CartItem[] {
  return rawItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    productName: item.productName || item.name || `Product #${item.productId}`,
    variantLabel: item.variantLabel || item.variantKey || 'Default',
    imageUrl: item.imageUrl || (item.images && item.images[0]?.url),
    quantity: item.quantity,
    unitPrice: item.unitPrice ?? item.unitPriceSnapshot ?? item.price ?? 0,
    currency: item.currency || 'EGP',
    cartKitId: item.cartKitId,
  }));
}

/**
 *
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /**
   *
   */
  const refreshCart = async () => {
    const guestId = getGuestId();
    const response = await fetch('/api/v1/cart', {
      headers: { 'X-Guest-Id': guestId },
      cache: 'no-store',
    });
    const json = await response.json();
    const items = json?.data?.cart?.items || [];
    setCartItems(toCartItems(items));
  };

  useEffect(() => {
    const guestId = getGuestId();
    void fetch('/api/v1/cart', {
      headers: { 'X-Guest-Id': guestId },
      cache: 'no-store',
    })
      .then((response) => response.json())
      .then((json) => {
        const items = json?.data?.cart?.items || [];
        setCartItems(toCartItems(items));
      });
  }, []);

  /**
   *
   */
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  /**
   *
   */
  const addToCart = (
    productId: number,
    quantity: number,
    options: { variantId: number },
  ) => {
    const guestId = getGuestId();
    const payload = {
      productId,
      variantId: options.variantId,
      quantity,
    };

    void fetch('/api/v1/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Id': guestId,
      },
      body: JSON.stringify(payload),
    }).then(() => refreshCart());

    setIsCartOpen(true);
  };

  /**
   *
   */
  const removeFromCart = (variantId: number) => {
    const guestId = getGuestId();
    const query = new URLSearchParams({
      variantId: String(variantId),
    });

    void fetch(`/api/v1/cart/items?${query.toString()}`, {
      method: 'DELETE',
      headers: { 'X-Guest-Id': guestId },
    }).then(() => refreshCart());
  };

  /**
   *
   */
  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(variantId);

    const guestId = getGuestId();
    void fetch(`/api/v1/cart/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Id': guestId,
      },
      body: JSON.stringify({
        variantId,
        quantity,
      }),
    }).then(() => refreshCart());
  };

  /**
   *
   */
  const clearCart = () => {
    const guestId = getGuestId();
    const currentItems = [...cartItems];

    void Promise.all(
      currentItems.map((item) => {
        const query = new URLSearchParams({
          variantId: String(item.variantId),
        });
        return fetch(`/api/v1/cart/items?${query.toString()}`, {
          method: 'DELETE',
          headers: { 'X-Guest-Id': guestId },
        });
      }),
    ).then(() => refreshCart());
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
