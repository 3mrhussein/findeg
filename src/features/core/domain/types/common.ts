/**
 * Shared Domain Types
 *
 * Centralized type definitions and Zod schemas for domain-specific primitives.
 * Use schemas for runtime validation at boundaries (API, forms); use types for domain logic.
 */

import { z } from "zod";

// ─── Primitives ─────────────────────────────────────────────────────────────

/** Unique identifier across domain entities */
export const IdSchema = z.coerce.number().int().positive();
export type ID = z.infer<typeof IdSchema>;

/** Optional ID (e.g. for nullable FKs) */
export const OptionalIdSchema = IdSchema.optional();
export type OptionalID = z.infer<typeof OptionalIdSchema>;

/** Monetary value in the system's base currency (e.g., EGP) */
export const PriceSchema = z.number().nonnegative();
export type Price = z.infer<typeof PriceSchema>;

/** Stock Keeping Unit - unique alphanumeric product code */
export const SkuSchema = z
  .string()
  .regex(/^[A-Za-z0-9\-_]*$/, "Invalid SKU format")
  .optional();
export const SkuRequiredSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9\-_]+$/, "Invalid SKU format");
export type Sku = string;

/** User email address (validated format) */
export const EmailSchema = z.string().email();
export type Email = z.infer<typeof EmailSchema>;

/** URL-friendly identifier for entities */
export const SlugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens");
export type Slug = z.infer<typeof SlugSchema>;

/** Item count for stock, orders, etc. */
export const QuantitySchema = z.coerce.number().int().nonnegative();
export type Quantity = z.infer<typeof QuantitySchema>;

/** Rating value (usually 0-5) */
export const RatingSchema = z.number().min(0).max(5);
export type Rating = z.infer<typeof RatingSchema>;

/** User access levels (accepts enum values or string for backward compatibility) */
export const UserRoleSchema = z.enum(["admin", "user"]);
export const UserRoleLooseSchema = UserRoleSchema.or(z.string());
export type UserRole = z.infer<typeof UserRoleSchema>;

// ─── Constants ──────────────────────────────────────────────────────────────

/** Order lifecycle statuses */
export const OrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/** Payment status */
export const PaymentStatusSchema = z.enum(["unpaid", "paid", "refunded"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/** Payment method */
export const PaymentMethodSchema = z.enum(["cod", "card"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/** Sellable units of measure */
export const UomCodeSchema = z.enum(["pcs", "pack", "carton"]);
export type UomCode = z.infer<typeof UomCodeSchema>;

/** Customer groups for pricing policy */
export const CustomerGroupSchema = z.enum(["public_b2c", "school_b2b"]);
export type CustomerGroup = z.infer<typeof CustomerGroupSchema>;
