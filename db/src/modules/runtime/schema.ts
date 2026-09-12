/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { auditLog } from '../../schema/system/audit-log.js';
export { serverLogs } from '../../schema/system/server-logs.js';
export { notifications } from '../../schema/system/notifications.js';

import { jsonb, text, timestamp } from 'drizzle-orm/pg-core';
import { systemSchema } from '../../schema/schemas.js';

export const checkoutOutbox = systemSchema.table('checkout_outbox', {
	id: text('id').primaryKey(),
	kind: text('kind').notNull(),
	payload: jsonb('payload').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
