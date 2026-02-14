/**
 * Orders Database Schema
 *
 * Full order lifecycle tracking including:
 * - Order header with totals, payment, shipping info
 * - Order items with product snapshots (preserves data at time of purchase)
 * - Guest checkout support via guestEmail
 */

import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { products } from "./products";

/**
 * Shipping Address Snapshot type
 *
 * Stored as JSONB to preserve the exact address at time of order.
 */
export interface ShippingAddressSnapshot {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
}

/**
 * Orders Table
 *
 * Tracks the full order lifecycle:
 * - `status` — pending → confirmed → processing → shipped → delivered / cancelled / refunded
 * - `paymentStatus` — unpaid → paid → refunded
 * - `guestEmail` — Allows guest checkout without user account
 * - `shippingAddressSnapshot` — Frozen address at time of order (JSONB)
 * - `trackingNumber` — Shipping carrier tracking
 * - `adminNotes` — Internal notes visible only to admin
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),

  /** Email for guest checkout (no userId) */
  guestEmail: varchar("guest_email", { length: 255 }),

  // Status
  /** Order lifecycle: pending → confirmed → processing → shipped → delivered / cancelled / refunded */
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  /** Payment status: unpaid → paid → refunded */
  paymentStatus: varchar("payment_status", { length: 50 }).default("unpaid").notNull(),

  // Totals
  /** Sum of all item prices before shipping */
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  /** Shipping fee */
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  /** Final amount: subtotal + shippingCost */
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EGP").notNull(),

  // Payment
  /** Payment method identifier (e.g., "cod", "paymob_card", "fawry") */
  paymentMethod: varchar("payment_method", { length: 50 }),

  // Shipping
  /** Frozen address snapshot at time of order */
  shippingAddressSnapshot: jsonb("shipping_address_snapshot").$type<ShippingAddressSnapshot>(),
  /** Carrier tracking number */
  trackingNumber: text("tracking_number"),

  /** Internal admin-only notes */
  adminNotes: text("admin_notes"),

  // Legacy fields kept for backward compatibility
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Variant Snapshot type
 *
 * Preserves selected variant details at time of purchase.
 */
export interface VariantSnapshot {
  [key: string]: string;
}

/**
 * Order Items Table
 *
 * Each item stores product snapshots to preserve data at time of purchase:
 * - `productNameSnapshot` — Product name when ordered
 * - `productSkuSnapshot` — SKU when ordered
 * - `unitPriceSnapshot` — Price per unit when ordered
 * - `variantSnapshot` — Selected variant details when ordered
 * - `totalPrice` — quantity × unitPrice
 */
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),

  // Snapshot fields — preserve data at time of purchase
  /** Product name at time of order */
  productNameSnapshot: text("product_name_snapshot"),
  /** Product SKU at time of order */
  productSkuSnapshot: text("product_sku_snapshot"),
  /** Price per unit at time of order */
  unitPriceSnapshot: decimal("unit_price_snapshot", { precision: 10, scale: 2 }),
  /** Selected variant details at time of order */
  variantSnapshot: jsonb("variant_snapshot").$type<VariantSnapshot>(),
  /** Total price: quantity × unitPriceSnapshot */
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),

  // Legacy field kept for backward compatibility
  priceAtTime: decimal("price_at_time", { precision: 10, scale: 2 }).notNull(),
  variantDetails: text("variant_details"),
});

/**
 * Order Relations
 */
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

/** Each order item references its parent order and product */
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

/**
 * Type Exports
 */
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
