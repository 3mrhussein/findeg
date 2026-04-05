import { z } from "zod";
/**
 * Logical pricing segments. Keep additive for future channels.
 */
export declare const PricingCustomerGroupSchema: z.ZodEnum<{
    public_b2c: "public_b2c";
    school_b2b: "school_b2b";
    wholesale: "wholesale";
}>;
export type PricingCustomerGroup = z.infer<typeof PricingCustomerGroupSchema>;
/**
 * Persisted price row by customer group and sellable UoM.
 */
export declare const PricingTierSchema: z.ZodObject<{
    customerGroup: z.ZodEnum<{
        public_b2c: "public_b2c";
        school_b2b: "school_b2b";
        wholesale: "wholesale";
    }>;
    uomCode: z.ZodString;
    unitPrice: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    isSellable: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
/**
 * Persisted pricing payload on catalog entities.
 */
export declare const PersistedPricingSchema: z.ZodObject<{
    base: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    cost: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
    wholesale: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
    tiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        customerGroup: z.ZodEnum<{
            public_b2c: "public_b2c";
            school_b2b: "school_b2b";
            wholesale: "wholesale";
        }>;
        uomCode: z.ZodString;
        unitPrice: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>;
        isSellable: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type PersistedPricing = z.infer<typeof PersistedPricingSchema>;
export declare const DiscountTypeSchema: z.ZodEnum<{
    percentage: "percentage";
    fixed: "fixed";
}>;
export type DiscountType = z.infer<typeof DiscountTypeSchema>;
/**
 * Persisted discount rule definition.
 */
export declare const DiscountRuleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        percentage: "percentage";
        fixed: "fixed";
    }>;
    value: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    startsAt: z.ZodOptional<z.ZodString>;
    endsAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    priority: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type DiscountRule = z.infer<typeof DiscountRuleSchema>;
/**
 * Applied discount details in resolved pricing output.
 */
export declare const AppliedDiscountSchema: z.ZodObject<{
    ruleId: z.ZodString;
    amount: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AppliedDiscount = z.infer<typeof AppliedDiscountSchema>;
/**
 * Runtime-calculated pricing surface returned to UI/API.
 * strikePrice is intentionally computed and not persisted.
 */
export declare const ResolvedPricingSchema: z.ZodObject<{
    basePrice: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    finalPrice: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    strikePrice: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
    appliedDiscounts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        ruleId: z.ZodString;
        amount: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ResolvedPricing = z.infer<typeof ResolvedPricingSchema>;
interface ResolvePricingOptions {
    now?: Date;
}
/**
 * Derives strike price for display if final price is discounted vs. base.
 */
export declare function strikePrice(base: PersistedPricing, final: ResolvedPricing["finalPrice"]): {
    amount: number;
    currency: string;
} | undefined;
/**
 * Resolves final pricing from persisted base pricing and discount rules.
 * Strike price is computed, not persisted.
 */
export declare function applyDiscounts(pricing: PersistedPricing, discountRules?: DiscountRule[], options?: ResolvePricingOptions): ResolvedPricing;
export declare const deriveStrikePrice: typeof strikePrice;
export declare const resolvePricing: typeof applyDiscounts;
export {};
