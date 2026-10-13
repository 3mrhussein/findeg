import {
  generateOrderReference as domainOrderReference,
  ORDER_REFERENCE_PATTERN,
} from '@findeg/domain';
import { sqlLiteral } from '../sql-values';
/**
 * Orders Database Schema
 *
 * Full order lifecycle tracking including:
 * - Order header with totals, payment, shipping info
 * - Order items with product snapshots (preserves data at time of purchase)
 * - Guest checkout support via guestEmail
 */

import { randomBytes } from 'node:crypto';
import {
  serial,
  text,
  integer,
  decimal,
  timestamp,
  varchar,
  jsonb,
  uniqueIndex,
  index,
  check,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { salesSchema } from '../schemas';
import { users } from '../identity/users';
import { products } from '../catalog/products';
import { productVariants } from '../catalog/product-variants';
import { businessPartners } from '../identity/partners';
import { schoolSupplyListItems, schoolSupplyLists } from '../school-engine/school-supply-lists';
import { orderStatusEnum, paymentStatusEnum, paymentMethodEnum } from '../enums';
import { StoredShippingAddress, VariantSnapshot } from '@findeg/db/types';
import { CurrencyCode } from '@findeg/domain';

export function generateOrderReference() {
  return domainOrderReference(randomBytes);
}

/**
 * Orders Table
 */
export const orders = salesSchema.table(
  'orders',
  {
    id: serial('id').primaryKey(),

    /** Public human-readable order reference (FE- + 6 Crockford base32 characters) */
    orderReference: text('order_reference')
      .$defaultFn(() => generateOrderReference())
      .notNull(),

    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),

    /** Email for guest checkout (no userId) */
    guestEmail: varchar('guest_email', { length: 255 }),

    // Status
    /** Order lifecycle: pending → confirmed → processing → shipped → delivered / cancelled / refunded */
    status: orderStatusEnum('status').default('pending').notNull(),
    /** Payment status: unpaid → paid → refunded */
    paymentStatus: paymentStatusEnum('payment_status').default('unpaid').notNull(),

    // Totals
    /** Sum of all item prices before shipping */
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
    /** Shipping fee */
    shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0'),
    /** Final amount: subtotal + shippingCost */
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).$type<CurrencyCode>().default('EGP').notNull(),

    // Payment
    /** Payment method identifier (e.g., "cod", "paymob_card", "fawry") */
    paymentMethod: paymentMethodEnum('payment_method'),

    // School Supply List attribution is all-null for an ordinary Cart order and
    // all-present for an order accepted from exactly one published list version.
    schoolSupplyListId: integer('school_supply_list_id').references(() => schoolSupplyLists.id, {
      onDelete: 'restrict',
    }),
    schoolSupplyListPublicCode: text('school_supply_list_public_code'),
    schoolSupplyListPublishedAt: timestamp('school_supply_list_published_at'),
    businessPartnerId: integer('business_partner_id').references(() => businessPartners.id, {
      onDelete: 'restrict',
    }),

    /** List Offer basis points applied at acceptance; null when no offer was active. */
    listOfferBasisPoints: integer('list_offer_basis_points'),
    /** Sum of every line's discount_amount. */
    discountTotal: decimal('discount_total', { precision: 10, scale: 2 }).notNull().default('0'),

    // Shipping
    /** Frozen address snapshot at time of order */
    shippingAddressSnapshot: jsonb('shipping_address_snapshot').$type<StoredShippingAddress>(),
    /** Carrier tracking number */
    trackingNumber: text('tracking_number'),

    /** Internal admin-only notes */
    adminNotes: text('admin_notes'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_orders_order_reference').on(table.orderReference),
    check(
      'ck_orders_order_reference',
      sql`${table.orderReference} ~ ${sqlLiteral(ORDER_REFERENCE_PATTERN.source)}`,
    ),
    check(
      'ck_orders_list_attribution',
      sql`(${table.schoolSupplyListId} is null and ${table.schoolSupplyListPublicCode} is null and ${table.schoolSupplyListPublishedAt} is null and ${table.businessPartnerId} is null)
        or (${table.schoolSupplyListId} is not null and ${table.schoolSupplyListPublicCode} is not null and ${table.schoolSupplyListPublishedAt} is not null and ${table.businessPartnerId} is not null)`,
    ),
  ],
);

/**
 * Order Items Table
 */
export const orderItems = salesSchema.table(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),

    /** FK to the specific variant (SKU) that was purchased */
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

    schoolSupplyListItemId: integer('school_supply_list_item_id').references(
      () => schoolSupplyListItems.id,
      { onDelete: 'restrict' },
    ),
    isSubstitute: boolean('is_substitute'),

    quantity: integer('quantity').notNull(),

    // Snapshot fields — preserve data at time of purchase
    /** Product name at time of order */
    productNameSnapshot: text('product_name_snapshot'),
    /** Product SKU at time of order */
    productSkuSnapshot: text('product_sku_snapshot'),
    /** Variant SKU frozen at purchase time */
    variantSkuSnapshot: text('variant_sku_snapshot'),
    /** Price per unit at time of order */
    unitPriceSnapshot: decimal('unit_price_snapshot', { precision: 10, scale: 2 }),
    /** Gross catalog unit price at acceptance, before any discount. */
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull().default('0'),
    /** Discount applied to the whole line. */
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
    /** Post-discount line total: what the Customer is charged for the line, before shipping. */
    lineTotal: decimal('line_total', { precision: 10, scale: 2 }).notNull().default('0'),

    /** Selected variant details at time of order */
    variantSnapshot: jsonb('variant_snapshot').$type<VariantSnapshot>(),

    /** Total price: quantity × unitPriceSnapshot */
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull().default('0'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  },
  (table) => [
    check(
      'ck_order_items_list_attribution',
      sql`(${table.schoolSupplyListItemId} is null and ${table.isSubstitute} is null)
      or (${table.schoolSupplyListItemId} is not null and ${table.isSubstitute} is not null)`,
    ),
  ],
);

/**
 * Order Relations
 */
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  notes: many(orderNotes),
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
}));

/**
 * Order Notes Table
 *
 * Append-only internal notes on orders, with author and time.
 */
export const orderNotes = salesSchema.table(
  'order_notes',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
    authorName: text('author_name').notNull(),
    note: text('note').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_order_notes_order_id').on(table.orderId)],
);

export const orderNotesRelations = relations(orderNotes, ({ one }) => ({
  order: one(orders, {
    fields: [orderNotes.orderId],
    references: [orders.id],
  }),
  author: one(users, {
    fields: [orderNotes.authorId],
    references: [users.id],
  }),
}));

/**
 * Type Exports
 */
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderNote = typeof orderNotes.$inferSelect;
export type NewOrderNote = typeof orderNotes.$inferInsert;
