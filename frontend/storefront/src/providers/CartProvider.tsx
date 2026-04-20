"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@findeg/backend/features/cart/domain/entities/Cart";
import type { Product } from "@findeg/backend/features/catalog/domain/entities/Product";
import { CustomerGroup } from "@findeg/backend/features/catalog/domain";
import { UomCode } from "@findeg/backend/features/core/domain/types/common";

export interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    productId: number,
    quantity: number,
    options: { variantId: number; uomCode: UomCode },
  ) => void;
  removeFromCart: (variantId: number, uomCode: UomCode) => void;
  updateQuantity: (variantId: number, uomCode: UomCode, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartSelectors {
  variantKey?: string;
  uomCode?: UomCode;
  customerGroup?: CustomerGroup;
}

/**
 *
 */
function getGuestId() {
  const storageKey = "findeg_guest_id";
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
      uomCode: parsed.uomCode,
      customerGroup: parsed.customerGroup,
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
    variantLabel: item.variantLabel || item.variantKey || "Default",
    imageUrl: item.imageUrl || (item.images && item.images[0]?.url),
    quantity: item.quantity,
    uomCode: item.uomCode,
    uomFactor: item.uomFactor ?? 1,
    unitPrice: item.unitPrice ?? item.unitPriceSnapshot ?? item.price ?? 0,
    currency: item.currency || "EGP",
    customerGroup: item.customerGroup,
    cartKitId: item.cartKitId,
  }));
}

import {
  getCartAction,
  addToCartAction,
  removeFromCartAction,
  updateQuantityAction,
} from "@/app/[locale]/(storefront)/_actions/cart";

// ... (types and helper functions)

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
    const cart = await getCartAction(guestId);
    const items = cart?.items || [];
    setCartItems(toCartItems(items));
  };

  useEffect(() => {
    const guestId = getGuestId();
    getCartAction(guestId).then((cart: any) => {
      const items = cart?.items || [];
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
    options: { variantId: number; uomCode: UomCode },
  ) => {
    const guestId = getGuestId();
    const payload = {
      productId,
      variantId: options.variantId,
      uomCode: options.uomCode,
      quantity,
    };

    addToCartAction(guestId, payload).then(() => refreshCart());
    setIsCartOpen(true);
  };

  /**
   *
   */
  const removeFromCart = (variantId: number, uomCode: UomCode) => {
    const guestId = getGuestId();
    removeFromCartAction(guestId, variantId, uomCode).then(() => refreshCart());
  };

  /**
   *
   */
  const updateQuantity = (variantId: number, uomCode: UomCode, quantity: number) => {
    if (quantity <= 0) return removeFromCart(variantId, uomCode);

    const guestId = getGuestId();
    const payload = {
      variantId,
      uomCode,
      quantity,
    };
    updateQuantityAction(guestId, payload).then(() => refreshCart());
  };

  /**
   *
   */
  const clearCart = () => {
    const guestId = getGuestId();
    const currentItems = [...cartItems];

    Promise.all(
      currentItems.map((item) => {
        return removeFromCartAction(guestId, item.variantId, item.uomCode);
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
