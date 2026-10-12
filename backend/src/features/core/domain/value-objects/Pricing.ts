import {
  PersistedPricingSchema,
  type PersistedPricing,
  DiscountTypeSchema,
  type DiscountType,
  DiscountRuleSchema,
  type DiscountRule,
  AppliedDiscountSchema,
  type AppliedDiscount,
  ResolvedPricingSchema,
  type ResolvedPricing,
} from '@findeg/db/types';

export {
  PersistedPricingSchema,
  type PersistedPricing,
  DiscountTypeSchema,
  type DiscountType,
  DiscountRuleSchema,
  type DiscountRule,
  AppliedDiscountSchema,
  type AppliedDiscount,
  ResolvedPricingSchema,
  type ResolvedPricing,
};

/**
 * Derives strike price for display if final price is discounted vs. base.
 */
export function strikePrice(base: PersistedPricing, final: ResolvedPricing['finalPrice']) {
  if (base.base.currency !== final.currency) return undefined;
  if (base.base.amount <= final.amount) return undefined;
  return base.base;
}

// ─── Legacy Aliases (to be removed) ─────────────────────────────────────────
export const deriveStrikePrice = strikePrice;
