"use server";

import { createCartServices } from '@findeg/backend/features/cart';
import { createCatalogServices } from '@findeg/backend/features/catalog';
import { updateTag } from 'next/cache';
import type { Variant } from '@findeg/backend/features/catalog';
import { getCart } from './queries';

/**
 * Get the current cart through the cached query layer.
 */
export async function getCartAction(guestId: string) {
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
    const { cart } = createCartServices();
    const { products } = createCatalogServices();

    const locale = payload.locale === 'ar' ? 'ar' : 'en';

    // Resolve product details
    const product = await products.getById(payload.productId, locale);
    if (!product) throw new Error('Product not found');

    const variant = product.variants?.find((v: Variant) => v.id === payload.variantId);
    if (!variant) throw new Error('Variant not found');

    const unitPrice = variant.basePrice;

    const cartItem = {
        productId: payload.productId,
        variantId: payload.variantId,
        sku: variant.sku,
        productName: product.name,
        variantLabel:
            variant.localizedLabel?.[locale] || variant.localizedLabel?.en || variant.variantKey,
        imageUrl: variant.images?.[0]?.url,
        quantity: payload.quantity,
        unitPrice: unitPrice as number,
        currency: 'EGP',
    };

    const result = await cart.addItem(guestId, cartItem as any);
    updateTag(`cart-${guestId}`);

    return result;
}

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
    const { cart } = createCartServices();
    const result = await cart.removeItem(guestId, variantId);
    updateTag(`cart-${guestId}`);

    return result;
}

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
    const { cart } = createCartServices();
    const result = await cart.updateItemQuantity(guestId, payload.variantId, payload.quantity);
    updateTag(`cart-${guestId}`);

    return result;
}

export async function updateQuantityAction(
    guestId: string,
    payload: {
        variantId: number;
        quantity: number;
    },
) {
    return await updateQuantity(guestId, payload);
}
