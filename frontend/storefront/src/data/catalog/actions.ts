"use server";

import { getCategoryTree, getProductPricing } from './queries';
import { LocaleSchema, ProductPricingInputSchema, validateInput } from '../schemas';

/**
 * Get category tree through the cached query layer.
 * 
 * Validates locale before querying.
 */
export async function getCategoryTreeAction(locale: string = 'en') {
  const validatedLocale = validateInput(LocaleSchema, locale);
  return await getCategoryTree(validatedLocale);
}

/**
 * Get product pricing through the query layer.
 * 
 * Validates productId and variantId before querying.
 */
export async function getProductPricingAction(payload: {
  productId: number;
  variantId: number;
}) {
  const validatedPayload = validateInput(ProductPricingInputSchema, payload);
  return await getProductPricing(validatedPayload);
}