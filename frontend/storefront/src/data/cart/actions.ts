"use server";

import { createCartServices } from '@findeg/backend/features/cart';
import { createCatalogServices } from '@findeg/backend/features/catalog';
import { updateTag } from 'next/cache';
import type { Variant } from '@findeg/backend/features/catalog';
import { getCart } from './queries';
import { AddToCartInputSchema, CartIdSchema, UpdateQuantityInputSchema, validateInput } from '../schemas';

/**
 * Get the current cart through the cached query layer.
 */
export async function getCartAction(guestId: string) {
  validateInput(CartIdSchema, guestId);
  return await getCart(guestId);
}

/**
 * Add item to cart and invalidate cache.
 */
export async function addToCart(
  guestId: string,
  payload: {
    productId: number;
    variantId: number;
    quantity: number;
    locale?: string;
  },
) {
  validateInput(CartIdSchema, guestId);
  const validatedPayload = validateInput(AddToCartInputSchema, payload);

  const { cart } = createCartServices();
  const { products } = createCatalogServices();

  const locale = validatedPayload.locale === 'ar' ? 'ar' : 'en';

  // Resolve product details
  const product = await products.getById(validatedPayload.productId, locale);
  if (!product) throw new Error('Product not found');

  const variant = product.variants?.find((v: Variant) => v.id === validatedPayload.variantId);
  if (!variant) throw new Error('Variant not found');

  const unitPrice = variant.basePrice;

  const cartItem = {
    productId: validatedPayload.productId,
    variantId: validatedPayload.variantId,
    sku: variant.sku,
    productName: product.name,
    variantLabel:
      variant.localizedLabel?.[locale] || variant.localizedLabel?.en || variant.variantKey,
    imageUrl: variant.images?.[0]?.url,
    quantity: validatedPayload.quantity,
    unitPrice: unitPrice as number,
    currency: 'EGP',
  };

  const result = await cart.addItem(guestId, cartItem as any);
  updateTag(`cart-${guestId}`);

  return result;
}

/**
 * Add item to cart using the name expected by existing callers.
 */
export async function addToCartAction(
  guestId: string,
  payload: {
    productId: number;
    variantId: number;
    quantity: number;
    locale?: string;
  },
) {
  return await addToCart(guestId, payload);
}

/**
 * Remove item from cart and invalidate cache.
 */
export async function removeFromCart(guestId: string, variantId: number) {
  validateInput(CartIdSchema, guestId);
  const { cart } = createCartServices();
  const result = await cart.removeItem(guestId, variantId);
  updateTag(`cart-${guestId}`);

  return result;
}

/**
 * Remove item from cart using the name expected by existing callers.
 */
export async function removeFromCartAction(guestId: string, variantId: number) {
  return await removeFromCart(guestId, variantId);
}

/**
 * Update item quantity in cart and invalidate cache.
 */
export async function updateQuantity(
  guestId: string,
  payload: {
    variantId: number;
    quantity: number;
  },
) {
  validateInput(CartIdSchema, guestId);
  const validatedPayload = validateInput(UpdateQuantityInputSchema, payload);

  const { cart } = createCartServices();
  const result = await cart.updateItemQuantity(guestId, validatedPayload.variantId, validatedPayload.quantity);
  updateTag(`cart-${guestId}`);

  return result;
}

/**
 * Update item quantity using the name expected by existing callers.
 */
export async function updateQuantityAction(
  guestId: string,
  payload: {
    variantId: number;
    quantity: number;
  },
) {
  return await updateQuantity(guestId, payload);
}
