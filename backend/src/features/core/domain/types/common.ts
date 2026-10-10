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
export { SkuSchema, SkuRequiredSchema, type Sku } from '@findeg/db/types';
export { QuantitySchema, type Quantity } from '@findeg/db/types';
export { RatingSchema, type Rating } from '@findeg/db/types';

// ─── Locale & Translations ──────────────────────────────────────────────────
export { type Locale } from '../value-objects/Locale';
export { TranslationMapSchema, type TranslationMap } from '../value-objects/Locale';

// ─── Money ───────────────────────────────────────────────────────────────────
export { MoneyAmountSchema, type MoneyAmount } from '@findeg/db/types';
export { CurrencyCodeSchema, type CurrencyCode } from '@findeg/db/types';

/** @deprecated Use `MoneyAmountSchema` — kept for backward compatibility. */
export { MoneyAmountSchema as PriceSchema } from '@findeg/db/types';
/** @deprecated Use `MoneyAmount` — kept for backward compatibility. */
export type { MoneyAmount as Price } from '@findeg/db/types';

// ─── Sales Enums ─────────────────────────────────────────────────────────────
export { OrderStatusSchema, type OrderStatus } from '@findeg/db/types';
export { PaymentStatusSchema, type PaymentStatus } from '@findeg/db/types';
export { PaymentMethodSchema, type PaymentMethod } from '@findeg/db/types';

// ─── Identity ────────────────────────────────────────────────────────────────
export { PortalRoleSchema, type PortalRole } from '@findeg/db/types';
export { ActorTypeSchema, type ActorType } from '@findeg/db/types';
export { PermissionCodeSchema, RoleIdSchema, RoleScopeSchema } from '@findeg/db/types';
