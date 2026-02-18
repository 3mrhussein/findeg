"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/features/cart/domain/entities/Cart";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { CustomerGroup, UomCode } from "@/features/core/domain/types/common";

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Product, quantity: number, selectedVariant?: { [key: string]: string }) => void;
  removeFromCart: (itemId: number, variantId?: string) => void;
  updateQuantity: (itemId: number, quantity: number, variantId?: string) => void;
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
    id: item.id,
    name: item.name || `Product #${item.id}`,
    price: item.price ?? item.unitPriceSnapshot ?? 0,
    images: item.images || [],
    categoryName: item.categoryName,
    description: item.description || "",
    longDescription: item.longDescription || "",
    rating: item.rating ?? 0,
    reviewsCount: item.reviewsCount ?? 0,
    quantity: item.quantity,
    selectedVariant: item.selectedVariant || item.variant,
    variant: item.variant,
    variantKey: item.variantKey,
    uomCode: item.uomCode,
    customerGroup: item.customerGroup,
    unitPriceSnapshot: item.unitPriceSnapshot,
    currency: item.currency,
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
    const response = await fetch("/api/v1/cart", {
      headers: { "X-Guest-Id": guestId },
      cache: "no-store",
    });
    const json = await response.json();
    const items = json?.data?.cart?.items || [];
    setCartItems(toCartItems(items));
  };

  useEffect(() => {
    const guestId = getGuestId();
    void fetch("/api/v1/cart", {
      headers: { "X-Guest-Id": guestId },
      cache: "no-store",
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
    product: Product,
    quantity: number,
    selectedVariant?: { [key: string]: string },
  ) => {
    const guestId = getGuestId();
    const payload = {
      productId: product.id,
      quantity,
      variant: selectedVariant,
      variantKey: "default",
      uomCode: "pcs",
      customerGroup: "public_b2c",
    };

    void fetch("/api/v1/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Guest-Id": guestId,
      },
      body: JSON.stringify(payload),
    }).then(() => refreshCart());

    setIsCartOpen(true);
  };

  /**
   *
   */
  const removeFromCart = (productId: number, variantId?: string) => {
    const guestId = getGuestId();
    const selectors = parseVariantId(variantId);
    const query = new URLSearchParams();
    if (selectors.variantKey) query.set("variantKey", selectors.variantKey);
    if (selectors.uomCode) query.set("uomCode", selectors.uomCode);
    if (selectors.customerGroup) query.set("customerGroup", selectors.customerGroup);

    void fetch(`/api/v1/cart/items/${productId}?${query.toString()}`, {
      method: "DELETE",
      headers: { "X-Guest-Id": guestId },
    }).then(() => refreshCart());
  };

  /**
   *
   */
  const updateQuantity = (productId: number, quantity: number, variantId?: string) => {
    if (quantity <= 0) return removeFromCart(productId, variantId);

    const guestId = getGuestId();
    const selectors = parseVariantId(variantId);

    void fetch(`/api/v1/cart/items/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Guest-Id": guestId,
      },
      body: JSON.stringify({
        quantity,
        ...selectors,
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
        const query = new URLSearchParams();
        if (item.variantKey) query.set("variantKey", item.variantKey);
        if (item.uomCode) query.set("uomCode", item.uomCode);
        if (item.customerGroup) query.set("customerGroup", item.customerGroup);
        return fetch(`/api/v1/cart/items/${item.id}?${query.toString()}`, {
          method: "DELETE",
          headers: { "X-Guest-Id": guestId },
        });
      }),
    ).then(() => refreshCart());
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (item.unitPriceSnapshot ?? item.price ?? 0) * item.quantity,
        0,
      ),
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
