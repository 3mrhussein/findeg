"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useCart } from "@/hooks/useCart";
import { DOMAIN_DEFAULTS } from "@/features/core/domain/constants/messages";

interface CheckoutLineItem {
  id: number;
  name: string;
  quantity: number;
  totalLabel: string;
}

interface UseCheckoutContentControllerResult {
  isCartEmpty: boolean;
  lineItems: CheckoutLineItem[];
  cartTotalLabel: string;
}

/**
 * Encapsulates checkout summary data shaping and money formatting.
 */
export function useCheckoutContentController(): UseCheckoutContentControllerResult {
  const { cartItems, cartTotal } = useCart();
  const locale = useLocale();

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: DOMAIN_DEFAULTS.CURRENCY,
        minimumFractionDigits: 2,
      }),
    [locale],
  );

  const lineItems = useMemo(
    () =>
      cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        totalLabel: formatter.format(item.price * item.quantity),
      })),
    [cartItems, formatter],
  );

  return {
    isCartEmpty: cartItems.length === 0,
    lineItems,
    cartTotalLabel: formatter.format(cartTotal),
  };
}
