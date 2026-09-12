import { relations, sql } from 'drizzle-orm';
import { check, index, integer, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { businessPartners } from '../../modules/partner-management/schema.js';
import { users } from '../identity/users.js';
import { schoolEngineSchema } from '../schemas.js';

export const schoolSupplyLists = schoolEngineSchema.table(
  'school_supply_lists',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id),
    sourceListId: integer('source_list_id'),
    replacesListId: integer('replaces_list_id'),
    replacedById: integer('replaced_by_id'),
    status: text('status').notNull().default('draft'),
    academicYear: text('academic_year').notNull(),
    schoolName: text('school_name').notNull(),
    grade: text('grade').notNull(),
    titleEn: text('title_en').notNull(),
    titleAr: text('title_ar').notNull(),
    publicCode: text('public_code'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('school_supply_list_status', sql`${table.status} in ('draft', 'published', 'archived')`),
    uniqueIndex('school_supply_list_public_code').on(table.publicCode),
    index('school_supply_lists_partner').on(table.businessPartnerId, table.status),
  ],
);

export const schoolSupplyListItems = schoolEngineSchema.table(
  'school_supply_list_items',
  {
    id: serial('id').primaryKey(),
    listId: integer('list_id')
      .notNull()
      .references(() => schoolSupplyLists.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id').notNull(),
    quantity: integer('quantity').notNull(),
    exactItem: integer('exact_item').notNull().default(0),
    productNameEn: text('product_name_en').notNull().default(''),
    productNameAr: text('product_name_ar').notNull().default(''),
    sku: text('sku').notNull().default(''),
    labelEn: text('label_en').notNull(),
    labelAr: text('label_ar').notNull(),
    unitPrice: text('unit_price').notNull().default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('school_supply_list_items_list').on(table.listId)],
);

export const schoolSupplyListsRelations = relations(schoolSupplyLists, ({ many }) => ({
  items: many(schoolSupplyListItems),
}));

export const schoolSupplyListItemsRelations = relations(schoolSupplyListItems, ({ one }) => ({
  list: one(schoolSupplyLists, {
    fields: [schoolSupplyListItems.listId],
    references: [schoolSupplyLists.id],
  }),
}));

export type SchoolSupplyList = typeof schoolSupplyLists.$inferSelect;
export type SchoolSupplyListItem = typeof schoolSupplyListItems.$inferSelect;
