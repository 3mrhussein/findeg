import { z } from 'zod';
import { CurrencyCodeSchema, MoneySchema } from './common';

/**
 * Logical pricing segments. Keep additive for future channels.
 */

/**
 * Persisted pricing payload on catalog entities.
 */
export const PersistedPricingSchema = z.object({
  base: MoneySchema,
  cost: MoneySchema.optional(),
  wholesale: MoneySchema.optional(),
});
export type PersistedPricing = z.infer<typeof PersistedPricingSchema>;

export const DiscountTypeSchema = z.enum(['percentage', 'fixed']);
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
 */
export const ResolvedPricingSchema = z.object({
  basePrice: MoneySchema,
  finalPrice: MoneySchema,
  strikePrice: MoneySchema.optional(),
  appliedDiscounts: z.array(AppliedDiscountSchema).default([]),
});
export type ResolvedPricing = z.infer<typeof ResolvedPricingSchema>;
