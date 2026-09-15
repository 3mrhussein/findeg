/** Approved privacy-limited, non-updatable views. Source owners retain every write. */
import { integer, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { identitySchema } from '../../schema/schemas.js';
export const partnerReportEvents = identitySchema
  .view('partner_report_events', {
    id: integer('id').notNull(),
    businessPartnerId: integer('business_partner_id').notNull(),
    orderReference: text('order_reference').notNull(),
    eventType: text('event_type').notNull(),
    points: integer('points').notNull(),
    pendingPoints: integer('pending_points'),
    earnedPoints: integer('earned_points'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    value: numeric('value'),
  })
  .existing();
export const partnerReportSales = identitySchema
  .view('partner_report_sales', {
    businessPartnerId: integer('business_partner_id').notNull(),
    day: text('day').notNull(),
    listId: integer('list_id').notNull(),
    listItemId: integer('list_item_id').notNull(),
    variantId: integer('variant_id').notNull(),
    count: integer('count').notNull(),
    subtotal: numeric('subtotal').notNull(),
  })
  .existing();
