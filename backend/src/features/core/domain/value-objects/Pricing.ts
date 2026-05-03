import {
  PricingCustomerGroupSchema,
  type PricingCustomerGroup,
  PricingTierSchema,
  type PricingTier,
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
} from '@findeg/db';

export {
  PricingCustomerGroupSchema,
  type PricingCustomerGroup,
  PricingTierSchema,
  type PricingTier,
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


interface ResolvePricingOptions {
  now?: Date;
}

/**
 * Derives strike price for display if final price is discounted vs. base.
 */
export function strikePrice(base: PersistedPricing, final: ResolvedPricing['finalPrice']) {
  if (base.base.currency !== final.currency) return undefined;
  if (base.base.amount <= final.amount) return undefined;
  return base.base;
}

/**
 * Checks if a discount rule is active based on the current date.
 */
function isRuleActive(rule: DiscountRule, now: Date): boolean {
  if (!rule.isActive) return false;

  const startsAt = rule.startsAt ? Date.parse(rule.startsAt) : null;
  const endsAt = rule.endsAt ? Date.parse(rule.endsAt) : null;

  if (startsAt !== null && Number.isFinite(startsAt) && now.getTime() < startsAt) return false;
  if (endsAt !== null && Number.isFinite(endsAt) && now.getTime() > endsAt) return false;

  return true;
}

/**
 *
 */
function calculateRuleDiscountAmount(currentAmount: number, rule: DiscountRule): number {
  if (rule.type === 'percentage') {
    return currentAmount * (rule.value / 100);
  }
  return rule.value;
}

/**
 * Resolves final pricing from persisted base pricing and discount rules.
 * Strike price is computed, not persisted.
 */
export function applyDiscounts(
  pricing: PersistedPricing,
  discountRules: DiscountRule[] = [],
  options: ResolvePricingOptions = {},
): ResolvedPricing {
  const now = options.now || new Date();
  const activeRules = [...discountRules]
    .filter((rule) => isRuleActive(rule, now))
    .sort((a, b) => b.priority - a.priority);

  const basePrice = pricing.base;
  let currentAmount = basePrice.amount;
  const appliedDiscounts: AppliedDiscount[] = [];

  for (const rule of activeRules) {
    if (rule.type === 'fixed' && rule.currency && rule.currency !== basePrice.currency) {
      continue;
    }

    const rawDiscountAmount = calculateRuleDiscountAmount(currentAmount, rule);
    if (!Number.isFinite(rawDiscountAmount) || rawDiscountAmount <= 0) continue;

    const discountAmount = Math.min(currentAmount, rawDiscountAmount);
    if (discountAmount <= 0) continue;

    currentAmount = Math.max(0, currentAmount - discountAmount);
    appliedDiscounts.push({
      ruleId: rule.id,
      amount: {
        amount: discountAmount,
        currency: basePrice.currency,
      },
    });
  }

  const finalPrice = {
    amount: currentAmount,
    currency: basePrice.currency,
  };

  return {
    basePrice,
    finalPrice,
    strikePrice: strikePrice(pricing, finalPrice),
    appliedDiscounts,
  };
}

// ─── Legacy Aliases (to be removed) ─────────────────────────────────────────
export const deriveStrikePrice = strikePrice;
export const resolvePricing = applyDiscounts;
