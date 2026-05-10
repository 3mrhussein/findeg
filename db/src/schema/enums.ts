import { pgEnum } from "drizzle-orm/pg-core";
import { identitySchema, salesSchema } from "./schemas";

/**
 * Shared Business Enums
 *
 * Centralizing enums here ensures they are the single source of truth
 * for both database schemas and domain logic.
 */

// --- Identity Domain ---

export const portalRoleEnum = identitySchema.enum("portal_role", [
  "customer",
  "staff",
  "school_staff",
]);

export const actorTypeEnum = identitySchema.enum("actor_type", ["guest", "user", "service"]);

// --- Sales Domain ---

export const orderStatusEnum = salesSchema.enum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = salesSchema.enum("payment_status", ["unpaid", "paid", "refunded"]);

export const paymentMethodEnum = salesSchema.enum("payment_method", ["cod", "card"]);

// --- Catalog Domain ---

export const uomCodeEnum = pgEnum("uom_code", ["pcs", "pack", "carton"]);

export const customerGroupEnum = pgEnum("customer_group", [
  "public_b2c",
  "school_b2b",
  "wholesale",
]);
