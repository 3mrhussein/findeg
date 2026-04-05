/**
 * Shared Domain Types
 *
 * Centralized type definitions and Zod schemas for domain-specific primitives.
 * Use schemas for runtime validation at boundaries (API, forms); use types for domain logic.
 */
import { z } from "zod";
import { MoneyAmountSchema, LocalizedStringSchema, } from "@/features/core/domain/value-objects";
// ─── Primitives ─────────────────────────────────────────────────────────────
/** Unique identifier across domain entities */
export const IdSchema = z.coerce.number().int().positive();
/** Monetary value in the system's base currency (e.g., EGP) */
export const PriceSchema = MoneyAmountSchema;
/** Stock Keeping Unit - unique alphanumeric product code */
export const SkuSchema = z
    .string()
    .regex(/^[A-Za-z0-9\-_]*$/, "Invalid SKU format")
    .optional();
export const SkuRequiredSchema = z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9\-_]+$/, "Invalid SKU format");
export const EmailSchema = z.string().email();
export const SlugSchema = z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens");
export const QuantitySchema = z.coerce.number().int().nonnegative();
/** Rating value (usually 0-5) */
export const RatingSchema = z.number().min(0).max(5);
export { LocalizedStringSchema };
export const PortalRoleSchema = z.enum(["customer", "staff", "school_staff"]);
export const isStaffRole = (role) => role === "staff";
export const isSchoolRole = (role) => role === "school_staff";
export const isCustomerRole = (role) => role === "customer" || !role;
export { ActorTypeSchema, PermissionCodeSchema, RoleIdSchema, RoleScopeSchema, } from "@/features/core/domain/value-objects";
// ─── Constants ──────────────────────────────────────────────────────────────
export const OrderStatusSchema = z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
]);
export const PaymentStatusSchema = z.enum(["unpaid", "paid", "refunded"]);
export const PaymentMethodSchema = z.enum(["cod", "card"]);
export const UomCodeSchema = z.enum(["pcs", "pack", "carton"]);
/** Customer groups for pricing policy */
export const CustomerGroupSchema = z.enum(["public_b2c", "school_b2b", "wholesale"]);
