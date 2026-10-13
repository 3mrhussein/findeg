'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
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
  type ClientCartItem,
  type ItemMetadata,
  type MetadataMap,
  type StoredCart,
} from '@/lib/cart/cart-storage';

export type CartItem = ClientCartItem;

export interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    productId: number,
    quantity: number,
    options: {
      variantId: number;
      productName?: string;
      variantLabel?: string;
      imageUrl?: string;
      unitPrice?: number;
      sku?: string;
    },
  ) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<StoredCart>({ v: 1, lines: [] });
  const [metadata, setMetadata] = useState<MetadataMap>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadedCart = loadStoredCart(window.localStorage);
    const loadedMeta = loadMetadataMap(window.localStorage);
    setCart(loadedCart);
    setMetadata(loadedMeta);
  }, []);

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (
    productId: number,
    quantity: number,
    options: {
      variantId: number;
      productName?: string;
      variantLabel?: string;
      imageUrl?: string;
      unitPrice?: number;
      sku?: string;
    },
  ) => {
    const itemMeta: ItemMetadata = {
      productId,
      productName: options.productName,
      variantLabel: options.variantLabel,
      imageUrl: options.imageUrl,
      unitPrice: options.unitPrice,
      sku: options.sku,
    };
    const { cart: nextCart, metaMap: nextMeta } = addLine(
      cart,
      { variantId: options.variantId, quantity },
      itemMeta,
      metadata,
    );
    setCart(nextCart);
    setMetadata(nextMeta);
    if (typeof window !== 'undefined') {
      saveStoredCart(nextCart, window.localStorage);
      saveMetadataMap(nextMeta, window.localStorage);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: number) => {
    const nextCart = removeLine(cart, variantId);
    setCart(nextCart);
    if (typeof window !== 'undefined') {
      saveStoredCart(nextCart, window.localStorage);
    }
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    const nextCart = updateLineQuantity(cart, variantId, quantity);
    setCart(nextCart);
    if (typeof window !== 'undefined') {
      saveStoredCart(nextCart, window.localStorage);
    }
  };

  const clearCart = () => {
    const empty: StoredCart = { v: 1, lines: [] };
    setCart(empty);
    setMetadata({});
    if (typeof window !== 'undefined') {
      clearCartStorage(window.localStorage);
    }
  };

  const cartItems = useMemo(() => toClientCartItems(cart, metadata), [cart, metadata]);
  const cartCount = useMemo(() => cart.lines.reduce((total, l) => total + l.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + (item.unitPrice || 0) * item.quantity, 0),
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
