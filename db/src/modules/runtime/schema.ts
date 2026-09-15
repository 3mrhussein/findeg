/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { auditLog } from '../../schema/system/audit-log.js';
export { serverLogs } from '../../schema/system/server-logs.js';
export { notifications } from '../../schema/system/notifications.js';

import { index, integer, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { systemSchema } from '../../schema/schemas.js';

export const checkoutOutbox = systemSchema.table(
  'checkout_outbox',
  {
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    payload: jsonb('payload').notNull(),
    status: text('status').notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).defaultNow().notNull(),
    leaseToken: uuid('lease_token'),
    leaseUntil: timestamp('lease_until', { withTimezone: true }),
    lastError: text('last_error'),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('checkout_outbox_due').on(table.status, table.nextAttemptAt, table.leaseUntil)],
);

export const notificationSink = systemSchema.table('notification_sink', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  payload: jsonb('payload').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
});
