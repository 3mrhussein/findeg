/**
 * Outbox Database Schema (ADR-0008)
 *
 * One general outbox: any feature enqueues a message on its own transaction and the
 * `outbox` backend feature delivers it afterwards, at least once.
 */

import { text, integer, jsonb, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { systemSchema } from '../schemas';

export const OUTBOX_STATUSES = [
  'pending',
  'processing',
  'delivered',
  'exhausted',
  'expired',
] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export const outbox = systemSchema.table(
  'outbox',
  {
    /** Derived from the business fact, e.g. `order-accepted:FE-ABC123`; makes enqueue idempotent. */
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    /** Ids only (e.g. `{ orderId }`); content is rendered at send time. */
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    status: text('status').$type<OutboxStatus>().notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).defaultNow().notNull(),
    leaseToken: text('lease_token'),
    leaseUntil: timestamp('lease_until', { withTimezone: true }),
    lastError: text('last_error'),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_outbox_due').on(table.status, table.nextAttemptAt),
    check(
      'ck_outbox_status',
      sql`${table.status} in ('pending', 'processing', 'delivered', 'exhausted', 'expired')`,
    ),
  ],
);

export type OutboxRow = typeof outbox.$inferSelect;
export type NewOutboxRow = typeof outbox.$inferInsert;
