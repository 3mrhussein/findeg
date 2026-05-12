"use server";

import { getCategoryTree, getProductPricing } from './queries';

/**
 * Get category tree through the cached query layer.
 */
export async function getCategoryTreeAction(locale: string = 'en') {
    return await getCategoryTree(locale);
}

/**
 * Get product pricing through the query layer.
 */
export async function getProductPricingAction(payload: {
    productId: number;
    variantId: number;
}) {
    return await getProductPricing(payload);
}