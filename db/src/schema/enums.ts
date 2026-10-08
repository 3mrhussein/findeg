import { identitySchema, salesSchema } from './schemas';
import {
  PORTAL_ROLE_VALUES,
  ACTOR_TYPE_VALUES,
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
} from '../types/enum-values';

/**
 * Shared Business Enums
 *
 * Centralizing enums here ensures they are the single source of truth
 * for both database schemas and domain logic.
 */

// --- Identity Domain ---

export const portalRoleEnum = identitySchema.enum('portal_role', PORTAL_ROLE_VALUES);

export const actorTypeEnum = identitySchema.enum('actor_type', ACTOR_TYPE_VALUES);

// --- Sales Domain ---

export const orderStatusEnum = salesSchema.enum('order_status', ORDER_STATUS_VALUES);

export const paymentStatusEnum = salesSchema.enum('payment_status', PAYMENT_STATUS_VALUES);

export const paymentMethodEnum = salesSchema.enum('payment_method', PAYMENT_METHOD_VALUES);

// --- Catalog Domain ---
