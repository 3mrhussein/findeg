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
export { TranslationMapSchema, type TranslationMap } from '../value-objects/Locale';

/** Decimal numeric representation in legacy application DTOs, not domain Money. */
export type Price = number;

// ─── Sales Enums ─────────────────────────────────────────────────────────────
export { OrderStatusSchema, PaymentStatusSchema } from '@findeg/orders/schemas';
export type { OrderStatus, PaymentStatus, PaymentMethod } from '@findeg/domain';

// ─── Identity ────────────────────────────────────────────────────────────────
export { PortalRoleSchema, type PortalRole } from '@findeg/db/types';
export { ActorTypeSchema, type ActorType } from '@findeg/db/types';
export { PermissionCodeSchema, RoleIdSchema, RoleScopeSchema } from '@findeg/db/types';
