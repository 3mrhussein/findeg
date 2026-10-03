/**
 * Guest Order Access Schema (ADR-0008)
 *
 * A request is created when a guest asks for a code for one Order. Each email attempt mints a
 * fresh code and stores only its hash, so a request can hold several codes; using any one of
 * them consumes the whole request.
 */

import { uuid, integer, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { salesSchema } from '../schemas';
import { orders } from './orders';

export const guestAccessRequests = salesSchema.table(
  'guest_access_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    /** Verification attempts made against this request (at most 5 are allowed). */
    attempts: integer('attempts').notNull().default(0),
    /** Set when a valid code is used; a consumed request accepts no further codes. */
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
  },
  (table) => [index('idx_guest_access_requests_order').on(table.orderId, table.createdAt)],
);

export const guestAccessCodes = salesSchema.table(
  'guest_access_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
      .notNull()
      .references(() => guestAccessRequests.id, { onDelete: 'cascade' }),
    /** HMAC of the code; the code itself is never stored. */
    codeHash: text('code_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_guest_access_codes_request_hash').on(table.requestId, table.codeHash),
  ],
);

export const guestAccessRequestsRelations = relations(guestAccessRequests, ({ one, many }) => ({
  order: one(orders, { fields: [guestAccessRequests.orderId], references: [orders.id] }),
  codes: many(guestAccessCodes),
}));

export const guestAccessCodesRelations = relations(guestAccessCodes, ({ one }) => ({
  request: one(guestAccessRequests, {
    fields: [guestAccessCodes.requestId],
    references: [guestAccessRequests.id],
  }),
}));

export type GuestAccessRequest = typeof guestAccessRequests.$inferSelect;
export type GuestAccessCode = typeof guestAccessCodes.$inferSelect;
