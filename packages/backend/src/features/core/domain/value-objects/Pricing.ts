import { z } from "zod";
import { CurrencyCodeSchema, MoneySchema } from "./Money";

/**
 * Logical pricing segments. Keep additive for future channels.
 */
export const PricingCustomerGroupSchema = z.enum(["public_b2c", "school_b2b", "wholesale"]);
export type PricingCustomerGroup = z.infer<typeof PricingCustomerGroupSchema>;

/**
 * Persisted price row by customer group and sellable UoM.
 */
export const PricingTierSchema = z.object({
  customerGroup: PricingCustomerGroupSchema,
  uomCode: z.string().min(1),
  unitPrice: MoneySchema,
  isSellable: z.boolean().default(true),
});
export type PricingTier = z.infer<typeof PricingTierSchema>;

/**
 * Persisted pricing payload on catalog entities.
 */
export const PersistedPricingSchema = z.object({
  base: MoneySchema,
  cost: MoneySchema.optional(),
  wholesale: MoneySchema.optional(),
  tiers: z.array(PricingTierSchema).default([]),
});
export type PersistedPricing = z.infer<typeof PersistedPricingSchema>;

export const DiscountTypeSchema = z.enum(["percentage", "fixed"]);
export type DiscountType = z.infer<typeof DiscountTypeSchema>;

/**
 * Persisted discount rule definition.
 */
export const DiscountRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: DiscountTypeSchema,
  value: z.number().positive(),
  currency: CurrencyCodeSchema.optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
});
export type DiscountRule = z.infer<typeof DiscountRuleSchema>;

/**
 * Applied discount details in resolved pricing output.
 */
export const AppliedDiscountSchema = z.object({
  ruleId: z.string().min(1),
  amount: MoneySchema,
});
export type AppliedDiscount = z.infer<typeof AppliedDiscountSchema>;

/**
 * Runtime-calculated pricing surface returned to UI/API.
 * strikePrice is intentionally computed and not persisted.
 */
export const ResolvedPricingSchema = z.object({
  basePrice: MoneySchema,
  finalPrice: MoneySchema,
  strikePrice: MoneySchema.optional(),
  appliedDiscounts: z.array(AppliedDiscountSchema).default([]),
});
export type ResolvedPricing = z.infer<typeof ResolvedPricingSchema>;

interface ResolvePricingOptions {
  now?: Date;
}

/**
 * Derives strike price for display if final price is discounted vs. base.
 */
export function strikePrice(base: PersistedPricing, final: ResolvedPricing["finalPrice"]) {
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
  if (rule.type === "percentage") {
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
    if (rule.type === "fixed" && rule.currency && rule.currency !== basePrice.currency) {
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
