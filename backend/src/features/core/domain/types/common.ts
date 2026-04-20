import { z } from "zod";
import {
  portalRoleEnum,
  orderStatusEnum,
  paymentStatusEnum,
  paymentMethodEnum,
  uomCodeEnum,
  customerGroupEnum,
} from "@findeg/db";
import {
  ActorTypeSchema as CoreActorTypeSchema,
  PermissionCodeSchema as CorePermissionCodeSchema,
  RoleIdSchema as CoreRoleIdSchema,
  RoleScopeSchema as CoreRoleScopeSchema,
  MoneyAmountSchema,
  LocalizedStringSchema,
  type ActorType,
  type CurrencyCode,
  type Locale,
  type Money,
  type MoneyAmount,
  type PermissionCode,
  type RoleId,
  type RoleScope,
  type LocalizedString,
} from "../value-objects";

// ─── Primitives ─────────────────────────────────────────────────────────────

/** Unique identifier across domain entities */
export const IdSchema = z.coerce.number().int().positive();
export type ID = z.infer<typeof IdSchema>;
/** Monetary value in the system's base currency (e.g., EGP) */
export const PriceSchema = MoneyAmountSchema;
export type Price = MoneyAmount;

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

export const EmailSchema = z.string().email();
export type Email = z.infer<typeof EmailSchema>;

export const SlugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens");
export type Slug = z.infer<typeof SlugSchema>;

export const QuantitySchema = z.coerce.number().int().nonnegative();
export type Quantity = z.infer<typeof QuantitySchema>;

/** Rating value (usually 0-5) */
export const RatingSchema = z.number().min(0).max(5);
export type Rating = z.infer<typeof RatingSchema>;

export { LocalizedStringSchema };
export type { LocalizedString };

export const PortalRoleSchema = z.enum(portalRoleEnum.enumValues);
export type PortalRole = z.infer<typeof PortalRoleSchema>;

// NOTE: isStaffRole, isSchoolRole, isCustomerRole moved to domain/auth/authorization.ts
// to avoid exposing this file (which has @ imports) from the core package.
// Use: import { isStaffRole } from "@findeg/backend/features/core";

export {
  ActorTypeSchema,
  PermissionCodeSchema,
  RoleIdSchema,
  RoleScopeSchema,
} from "../value-objects";

// ─── Constants ──────────────────────────────────────────────────────────────

export const OrderStatusSchema = z.enum(orderStatusEnum.enumValues);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentStatusSchema = z.enum(paymentStatusEnum.enumValues);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodSchema = z.enum(paymentMethodEnum.enumValues);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const UomCodeSchema = z.enum(uomCodeEnum.enumValues);
export type UomCode = z.infer<typeof UomCodeSchema>;

/** Customer groups for pricing policy */
export const CustomerGroupSchema = z.enum(customerGroupEnum.enumValues);
export type CustomerGroup = z.infer<typeof CustomerGroupSchema>;

// ─── Re-exported Value Objects ──────────────────────────────────────────────

/**
 * Re-export value-object types from a single common entrypoint.
 * This keeps imports stable while moving toward richer domain VO usage.
 */
export type { Locale, CurrencyCode, Money, PermissionCode, RoleId, RoleScope, ActorType };
