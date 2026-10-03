import { sql } from 'drizzle-orm';
import { check, integer, timestamp } from 'drizzle-orm/pg-core';
import { salesSchema } from '../schemas';
import { schoolSupplyLists } from '../school-engine/school-supply-lists';

/**
 * A List Offer: a percentage discount on one School Supply List (ADR-0007).
 * One row per list; a list with no row has no offer. It sits outside the list's publish
 * freeze, so Staff can change it without republishing.
 */
export const listOffers = salesSchema.table(
  'list_offers',
  {
    listId: integer('list_id')
      .primaryKey()
      .references(() => schoolSupplyLists.id, { onDelete: 'cascade' }),
    /** Discount in basis points, 0 to 10000 (100%). */
    basisPoints: integer('basis_points').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    /** Null means open-ended. */
    endsAt: timestamp('ends_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('ck_list_offers_basis_points', sql`${table.basisPoints} between 0 and 10000`),
    check(
      'ck_list_offers_window',
      sql`${table.endsAt} is null or ${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export type ListOffer = typeof listOffers.$inferSelect;
export type NewListOffer = typeof listOffers.$inferInsert;
