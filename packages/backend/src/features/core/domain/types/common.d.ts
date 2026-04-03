/**
 * Shared Domain Types
 *
 * Centralized type definitions and Zod schemas for domain-specific primitives.
 * Use schemas for runtime validation at boundaries (API, forms); use types for domain logic.
 */
import { z } from "zod";
import { LocalizedStringSchema, type ActorType, type CurrencyCode, type Locale, type Money, type MoneyAmount, type PermissionCode, type RoleId, type RoleScope, type LocalizedString } from "@/features/core/domain/value-objects";
/** Unique identifier across domain entities */
export declare const IdSchema: z.ZodCoercedNumber<unknown>;
export type ID = z.infer<typeof IdSchema>;
/** Monetary value in the system's base currency (e.g., EGP) */
export declare const PriceSchema: z.ZodNumber;
export type Price = MoneyAmount;
/** Stock Keeping Unit - unique alphanumeric product code */
export declare const SkuSchema: z.ZodOptional<z.ZodString>;
export declare const SkuRequiredSchema: z.ZodString;
export type Sku = string;
export declare const EmailSchema: z.ZodString;
export type Email = z.infer<typeof EmailSchema>;
export declare const SlugSchema: z.ZodString;
export type Slug = z.infer<typeof SlugSchema>;
export declare const QuantitySchema: z.ZodCoercedNumber<unknown>;
export type Quantity = z.infer<typeof QuantitySchema>;
/** Rating value (usually 0-5) */
export declare const RatingSchema: z.ZodNumber;
export type Rating = z.infer<typeof RatingSchema>;
export { LocalizedStringSchema };
export type { LocalizedString };
export declare const PortalRoleSchema: z.ZodEnum<{
    customer: "customer";
    staff: "staff";
    school_staff: "school_staff";
}>;
export type PortalRole = z.infer<typeof PortalRoleSchema>;
export declare const isStaffRole: (role?: PortalRole | null) => role is "staff";
export declare const isSchoolRole: (role?: PortalRole | null) => role is "school_staff";
export declare const isCustomerRole: (role?: PortalRole | null) => role is "customer" | null | undefined;
export { ActorTypeSchema, PermissionCodeSchema, RoleIdSchema, RoleScopeSchema, } from "@/features/core/domain/value-objects";
export declare const OrderStatusSchema: z.ZodEnum<{
    pending: "pending";
    confirmed: "confirmed";
    processing: "processing";
    shipped: "shipped";
    delivered: "delivered";
    cancelled: "cancelled";
    refunded: "refunded";
}>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export declare const PaymentStatusSchema: z.ZodEnum<{
    refunded: "refunded";
    unpaid: "unpaid";
    paid: "paid";
}>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export declare const PaymentMethodSchema: z.ZodEnum<{
    card: "card";
    cod: "cod";
}>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export declare const UomCodeSchema: z.ZodEnum<{
    pcs: "pcs";
    pack: "pack";
    carton: "carton";
}>;
export type UomCode = z.infer<typeof UomCodeSchema>;
/** Customer groups for pricing policy */
export declare const CustomerGroupSchema: z.ZodEnum<{
    public_b2c: "public_b2c";
    school_b2b: "school_b2b";
    wholesale: "wholesale";
}>;
export type CustomerGroup = z.infer<typeof CustomerGroupSchema>;
/**
 * Re-export value-object types from a single common entrypoint.
 * This keeps imports stable while moving toward richer domain VO usage.
 */
export type { Locale, CurrencyCode, Money, PermissionCode, RoleId, RoleScope, ActorType };
