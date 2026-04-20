"use server";

import { createCartServices } from "@findeg/backend/features/cart";
import { createCatalogServices } from "@findeg/backend/features/catalog";
import { UomCode } from "@findeg/backend/features/core/domain/types/common";
import { revalidateTag } from "next/cache";

/**
 * Server action to fetch the current cart.
 */
export async function getCartAction(guestId: string) {
  const { cart } = createCartServices();
  return await cart.getCart(guestId);
}

/**
 * Server action to add an item to the cart.
 */
export async function addToCartAction(
  guestId: string,
  payload: {
    productId: number;
    variantId: number;
    uomCode: UomCode;
    quantity: number;
    locale?: string;
  },
) {
  const { cart } = createCartServices();
  const { products } = createCatalogServices();

  const locale = payload.locale === "ar" ? "ar" : "en";

  // Resolve product details for the CartItem
  const product = await products.getById(payload.productId, locale);
  if (!product) throw new Error("Product not found");

  const variant = product.variants?.find((v: any) => v.id === payload.variantId);
  if (!variant) throw new Error("Variant not found");

  const priceEntry = variant.priceLists?.find((p: any) => p.uomCode === payload.uomCode) || {
    unitPrice: variant.basePrice,
  };

  const cartItem = {
    productId: payload.productId,
    variantId: payload.variantId,
    sku: variant.sku,
    productName: product.name,
    variantLabel:
      variant.localizedLabel?.[locale] || variant.localizedLabel?.en || variant.variantKey,
    imageUrl: variant.images?.[0]?.url,
    quantity: payload.quantity,
    uomCode: payload.uomCode,
    uomFactor: 1, // Defaulting for now
    unitPrice: priceEntry.unitPrice as number,
    currency: "EGP",
  };

  const result = await cart.addItem(guestId, cartItem as any);
  revalidateTag(`cart-${guestId}`, "max"); // Next.js 16 revalidate works on the tag across profiles
  return result;
}

/**
 * Server action to remove an item from the cart.
 */
export async function removeFromCartAction(guestId: string, variantId: number, uomCode: UomCode) {
  const { cart } = createCartServices();
  const result = await cart.removeItem(guestId, variantId, { uomCode });
  revalidateTag(`cart-${guestId}`, "max");
  return result;
}

/**
 * Server action to update item quantity in the cart.
 */
export async function updateQuantityAction(
  guestId: string,
  payload: {
    variantId: number;
    uomCode: UomCode;
    quantity: number;
  },
) {
  const { cart } = createCartServices();
  const result = await cart.updateItemQuantity(guestId, payload.variantId, payload.quantity, {
    uomCode: payload.uomCode,
  });
  revalidateTag(`cart-${guestId}`, "max");
  return result;
}
