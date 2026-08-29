/**
 * Backend Domain Type Facade
 *
 * Re-exports database primitives for stable internal imports.
 * Domain logic lives in value-objects/, not here.
 */

// ─── Core Primitives ─────────────────────────────────────────────────────────
export { IdSchema, type ID } from '@findeg/db';
export { EmailSchema, type Email } from '@findeg/db';
export { SlugSchema, type Slug } from '@findeg/db';
export { SkuSchema, SkuRequiredSchema, type Sku } from '@findeg/db';
export { QuantitySchema, type Quantity } from '@findeg/db';
export { RatingSchema, type Rating } from '@findeg/db';

// ─── Locale & Translations ──────────────────────────────────────────────────
export { type Locale } from '../value-objects/Locale';
export { TranslationMapSchema, type TranslationMap } from '../value-objects/Locale';

// ─── Money ───────────────────────────────────────────────────────────────────
export { MoneyAmountSchema, type MoneyAmount } from '@findeg/db';
export { CurrencyCodeSchema, type CurrencyCode } from '@findeg/db';

/** @deprecated Use `MoneyAmountSchema` — kept for backward compatibility. */
export { MoneyAmountSchema as PriceSchema } from '@findeg/db';
/** @deprecated Use `MoneyAmount` — kept for backward compatibility. */
export type { MoneyAmount as Price } from '@findeg/db';

// ─── Sales Enums ─────────────────────────────────────────────────────────────
export { OrderStatusSchema, type OrderStatus } from '@findeg/db';
export { PaymentStatusSchema, type PaymentStatus } from '@findeg/db';
export { PaymentMethodSchema, type PaymentMethod } from '@findeg/db';


// ─── Identity ────────────────────────────────────────────────────────────────
export {
  ActivePortalSchema,
  defaultActivePortalForRole,
  eligibleActivePortalsForRole,
  PortalRoleSchema,
  type ActivePortal,
  type PortalRole,
} from '@findeg/db';
export { ActorTypeSchema, type ActorType } from '@findeg/db';
export { PermissionCodeSchema, RoleIdSchema, RoleScopeSchema } from '@findeg/db';
