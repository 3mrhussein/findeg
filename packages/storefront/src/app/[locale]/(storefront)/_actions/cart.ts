"use server";

import { createCartServices } from "@backend/features/cart";
import { createCatalogServices } from "@backend/features/catalog";
import { UomCode } from "@backend/features/core/domain/types/common";
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
  },
) {
  const { cart } = createCartServices();
  const { products } = createCatalogServices();

  // Resolve product details for the CartItem
  const product = await products.getById(payload.productId);
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
    variantLabel: variant.localizedLabel?.en || variant.variantKey,
    quantity: payload.quantity,
    uomCode: payload.uomCode,
    uomFactor: 1, // Defaulting for now
    unitPrice: priceEntry.unitPrice,
    currency: "EGP",
  };

  const result = await cart.addItem(guestId, cartItem as any);
  revalidateTag(`cart-${guestId}`, "default" as any);
  return result;
}

/**
 * Server action to remove an item from the cart.
 */
export async function removeFromCartAction(guestId: string, variantId: number, uomCode: UomCode) {
  const { cart } = createCartServices();
  const result = await cart.removeItem(guestId, variantId, { uomCode });
  revalidateTag(`cart-${guestId}`, "default" as any);
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
  revalidateTag(`cart-${guestId}`, "default" as any);
  return result;
}
