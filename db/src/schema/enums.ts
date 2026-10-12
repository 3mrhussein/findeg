import { identitySchema, salesSchema } from './schemas';
import { ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHOD_TYPES } from '@findeg/domain';
import { PORTAL_ROLE_VALUES, ACTOR_TYPE_VALUES } from '../types/persistence-values';

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

export const orderStatusEnum = salesSchema.enum('order_status', ORDER_STATUSES);

export const paymentStatusEnum = salesSchema.enum('payment_status', PAYMENT_STATUSES);

export const paymentMethodEnum = salesSchema.enum('payment_method', PAYMENT_METHOD_TYPES);

// --- Catalog Domain ---
