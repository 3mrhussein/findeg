import {
  boolean,
  integer,
  serial,
  text,
  timestamp,
  decimal,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { identitySchema } from '../../schema/schemas.js';
import { businessPartners } from '../partner-management/schema.js';

export const partnerRewardEvents = identitySchema.table(
  'partner_reward_events',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id),
    orderReference: text('order_reference').notNull(),
    eventType: text('event_type').notNull(),
    points: integer('points').notNull(),
    pendingPoints: integer('pending_points'),
    earnedPoints: integer('earned_points'),
    conversionRate: decimal('conversion_rate', { precision: 12, scale: 4 }),
    fulfillment: text('fulfillment'),
    fulfillmentCompleted: boolean('fulfillment_completed'),
    verifiedBankAccountId: text('verified_bank_account_id'),
    settlementReference: text('settlement_reference'),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'partner_reward_event_type',
      sql`${table.eventType} in ('accepted', 'paid', 'refund', 'cancellation', 'reversal', 'adjustment', 'settlement')`,
    ),
    check(
      'partner_reward_fulfillment',
      sql`${table.fulfillment} is null or ${table.fulfillment} in ('delivery', 'collection')`,
    ),
    index('partner_reward_events_partner_order').on(table.businessPartnerId, table.orderReference),
  ],
);
