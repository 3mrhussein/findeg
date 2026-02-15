"use client";

import React, { createContext, useState, useMemo } from "react";
import type { CartItem } from "@/features/cart/domain/entities/Cart";
import type { Product } from "@/features/catalog/domain/entities/Product";

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Product, quantity: number, selectedVariant?: { [key: string]: string }) => void;
  removeFromCart: (itemId: number, variantId?: string) => void;
  updateQuantity: (itemId: number, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 *
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    setCartItems((prevItems) => {
      const variantId = JSON.stringify(selectedVariant);
      const existingItem = prevItems.find(
        (item) => item.id === product.id && JSON.stringify(item.selectedVariant) === variantId,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && JSON.stringify(item.selectedVariant) === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prevItems, { ...product, quantity, selectedVariant }];
    });
    setIsCartOpen(true);
  };

  /**
   *
   */
  const removeFromCart = (productId: number, variantId?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && JSON.stringify(item.selectedVariant) === variantId),
      ),
    );
  };

  /**
   *
   */
  const updateQuantity = (productId: number, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId && JSON.stringify(item.selectedVariant) === variantId
            ? { ...item, quantity }
            : item,
        ),
      );
    }
  };

  /**
   *
   */
  const clearCart = () => setCartItems([]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
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
