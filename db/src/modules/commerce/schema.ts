/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { paymentMethods } from '../../schema/identity/identity-access.js';
export { orders, orderItems } from '../../schema/sales/orders.js';
export { cartKits } from '../../schema/sales/cart-kits.js';
export { discountRules } from '../../schema/sales/discount-rules.js';
export { addresses } from '../../schema/identity/addresses.js';

import { boolean, jsonb, numeric, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { salesSchema } from '../../schema/schemas.js';

export const storefrontCarts = salesSchema.table('storefront_carts', {
	ownerDigest: text('owner_digest').primaryKey(),
	items: jsonb('items').$type<readonly { variantId: number; quantity: number }[]>().notNull(),
});

export const deliveryZones = salesSchema.table('delivery_zones', {
	id: serial('id').primaryKey(),
	name: jsonb('name').$type<{ en: string; ar: string }>().notNull(),
	fee: numeric('fee', { precision: 14, scale: 2 }).notNull(),
	isActive: boolean('is_active').default(true).notNull(),
});

export const acceptedOrders = salesSchema.table('accepted_orders', {
	reference: text('reference').primaryKey(),
	snapshot: jsonb('snapshot').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const checkoutOutcomes = salesSchema.table(
	'checkout_outcomes',
	{
		ownerDigest: text('owner_digest').notNull(),
		key: text('key').notNull(),
		fingerprint: text('fingerprint').notNull(),
		orderReference: text('order_reference').notNull().references(() => acceptedOrders.reference),
	},
	(table) => [primaryKey({ columns: [table.ownerDigest, table.key] })],
);

export const guestOrderAccess = salesSchema.table('guest_order_access', {
	reference: text('reference').primaryKey(),
	orderReference: text('order_reference').notNull().references(() => acceptedOrders.reference),
	codeHash: text('code_hash').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	usedAt: timestamp('used_at', { withTimezone: true }),
});
