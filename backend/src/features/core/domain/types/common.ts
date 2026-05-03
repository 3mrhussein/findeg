import { z } from 'zod';
import {
  orderStatusEnum,
  paymentStatusEnum,
  paymentMethodEnum,
  uomCodeEnum,
  customerGroupEnum,
  IdSchema,
  SkuSchema,
  SkuRequiredSchema,
  EmailSchema,
  SlugSchema,
  QuantitySchema,
  RatingSchema,
  MoneyAmountSchema,
  TranslationMapSchema,
  ActorTypeSchema,
  PermissionCodeSchema,
  RoleIdSchema,
  RoleScopeSchema,
  PortalRoleSchema,
  type ID,
  type Sku,
  type Email,
  type Slug,
  type Quantity,
  type Rating,
  type Locale,
  type CurrencyCode,
  type Money,
  type MoneyAmount,
  type PermissionCode,
  type RoleId,
  type RoleScope,
  type ActorType,
  type PortalRole,
  type TranslationMap,
} from '@findeg/db';

// ─── Primitives ─────────────────────────────────────────────────────────────

/** Unique identifier across domain entities */
export { IdSchema };
export type { ID };

/** Monetary value in the system's base currency (e.g., EGP) */
export const PriceSchema = MoneyAmountSchema;
export type Price = MoneyAmount;

/** Stock Keeping Unit - unique alphanumeric product code */
export { SkuSchema, SkuRequiredSchema };
export type { Sku };

export { EmailSchema };
export type { Email };

export { SlugSchema };
export type { Slug };

export { QuantitySchema };
export type { Quantity };

/** Rating value (usually 0-5) */
export { RatingSchema };
export type { Rating };

export { TranslationMapSchema };
export type { TranslationMap };

export {
  PortalRoleSchema,
  ActorTypeSchema,
  PermissionCodeSchema,
  RoleIdSchema,
  RoleScopeSchema,
};

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
export type { Locale, CurrencyCode, Money, PermissionCode, RoleId, RoleScope, ActorType, PortalRole };

