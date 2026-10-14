import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@findeg/domain';

/**
 * Backend Domain Type Facade
 *
 * Re-exports database primitives for stable internal imports.
 * Domain logic lives in value-objects/, not here.
 */

// ─── Core Primitives ─────────────────────────────────────────────────────────
export { IdSchema, type ID } from '@findeg/db/types';
export { EmailSchema, type Email } from '@findeg/db/types';
export { SlugSchema, type Slug } from '@findeg/db/types';
export { QuantitySchema, type Quantity } from '@findeg/db/types';
export { RatingSchema, type Rating } from '@findeg/db/types';

// ─── Locale & Translations ──────────────────────────────────────────────────
export type { Locale } from '@findeg/domain';
export { TranslationMapSchema, type TranslationMap } from '@findeg/catalog';

/** Decimal numeric representation in legacy application DTOs, not domain Money. */
export type Price = number;

// ─── Sales Enums ─────────────────────────────────────────────────────────────
// Derive the facade schemas from Domain without importing the Orders server factory.
const orderStatusSchema = z.enum(ORDER_STATUSES);
const paymentStatusSchema = z.enum(PAYMENT_STATUSES);
export { orderStatusSchema as OrderStatusSchema, paymentStatusSchema as PaymentStatusSchema };
export type { OrderStatus, PaymentStatus, PaymentMethod } from '@findeg/domain';

// ─── Identity ────────────────────────────────────────────────────────────────
export { PortalRoleSchema, type PortalRole } from '@findeg/db/types';
export { ActorTypeSchema, type ActorType } from '@findeg/db/types';
export { PermissionCodeSchema, RoleIdSchema, RoleScopeSchema } from '@findeg/db/types';
