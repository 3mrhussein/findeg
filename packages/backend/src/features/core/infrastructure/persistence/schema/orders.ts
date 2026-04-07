/**
 * Orders Database Schema
 *
 * Full order lifecycle tracking including:
 * - Order header with totals, payment, shipping info
 * - Order items with product snapshots (preserves data at time of purchase)
 * - Guest checkout support via guestEmail
 */

import { serial, text, integer, decimal, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { salesSchema } from "./schemas";
import { users } from "./users";
import { products } from "./products";
import { productVariants } from "./product-variants";
import { cartKits } from "./cart-kits";
import type { ShippingAddress } from "@features/order/domain/value-objects/ShippingAddress";
import type { VariantSnapshot } from "@features/order/domain/value-objects/VariantSnapshot";
import type {
  CurrencyCode,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@features/core/domain/types/common";

/** Re-export for consumers */
export type { ShippingAddress as ShippingAddressSnapshot } from "@features/order/domain/value-objects/ShippingAddress";

/**
 * Orders Table
 */
export const orders = salesSchema.table("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),

  /** Email for guest checkout (no userId) */
  guestEmail: varchar("guest_email", { length: 255 }),

  // Status
  /** Order lifecycle: pending → confirmed → processing → shipped → delivered / cancelled / refunded */
  status: varchar("status", { length: 50 }).$type<OrderStatus>().default("pending").notNull(),
  /** Payment status: unpaid → paid → refunded */
  paymentStatus: varchar("payment_status", { length: 50 })
    .$type<PaymentStatus>()
    .default("unpaid")
    .notNull(),

  // Totals
  /** Sum of all item prices before shipping */
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  /** Shipping fee */
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  /** Final amount: subtotal + shippingCost */
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).$type<CurrencyCode>().default("EGP").notNull(),

  // Payment
  /** Payment method identifier (e.g., "cod", "paymob_card", "fawry") */
  paymentMethod: varchar("payment_method", { length: 50 }).$type<PaymentMethod>(),

  // Shipping
  /** Frozen address snapshot at time of order */
  shippingAddressSnapshot: jsonb("shipping_address_snapshot").$type<ShippingAddress>(),
  /** Carrier tracking number */
  trackingNumber: text("tracking_number"),

  /** Internal admin-only notes */
  adminNotes: text("admin_notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Order Items Table
 */
export const orderItems = salesSchema.table("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),

  /** Optional link to a school list kit */
  cartKitId: integer("cart_kit_id").references(() => cartKits.id, { onDelete: "set null" }),

  /** FK to the specific variant (SKU) that was purchased */
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),

  quantity: integer("quantity").notNull(),

  /** Which UOM was purchased (EA, PACK_3, etc.) */
  uomCode: text("uom_code"),

  /** UOM factor at time of purchase */
  uomFactor: decimal("uom_factor", { precision: 12, scale: 4 }),

  // Snapshot fields — preserve data at time of purchase
  /** Product name at time of order */
  productNameSnapshot: text("product_name_snapshot"),
  /** Product SKU at time of order */
  productSkuSnapshot: text("product_sku_snapshot"),
  /** Variant SKU frozen at purchase time */
  variantSkuSnapshot: text("variant_sku_snapshot"),
  /** Price per unit at time of order */
  unitPriceSnapshot: decimal("unit_price_snapshot", { precision: 10, scale: 2 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull().default("0"),

  /** Selected variant details at time of order */
  variantSnapshot: jsonb("variant_snapshot").$type<VariantSnapshot>(),

  /** Total price: quantity × unitPriceSnapshot */
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
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
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
  cartKit: one(cartKits, {
    fields: [orderItems.cartKitId],
    references: [cartKits.id],
  }),
}));

/**
 * Type Exports
 */
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
