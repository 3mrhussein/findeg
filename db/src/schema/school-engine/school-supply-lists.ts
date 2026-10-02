import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { businessPartners } from '../identity/partners';
import { productVariants } from '../catalog/product-variants';
import type { TranslationMap } from '../catalog/types';
import { schoolEngineSchema } from '../schemas';

export const SUPPLY_LIST_STATUSES = ['draft', 'published', 'archived'] as const;
export type SupplyListStatus = (typeof SUPPLY_LIST_STATUSES)[number];

export interface SupplyListSpecification {
  categoryId: number;
  attributes: Record<string, string>;
}

/** A Business Partner's school-specific profile, separate from its lists. */
export const partnerSchoolProfiles = schoolEngineSchema.table('partner_school_profiles', {
  businessPartnerId: integer('business_partner_id')
    .primaryKey()
    .references(() => businessPartners.id, { onDelete: 'restrict' }),
  governorate: text('governorate'),
  area: text('area'),
  schoolType: text('school_type'),
  academicSystem: text('academic_system'),
  logoUrl: text('logo_url'),
});

/** A School Supply List owned by a Partner School, moving through draft, published and archived. */
export const schoolSupplyLists = schoolEngineSchema.table(
  'school_supply_lists',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    grade: text('grade').notNull(),
    academicYear: text('academic_year').notNull(),
    localizedTitle: jsonb('localized_title').$type<TranslationMap>().notNull(),
    localizedDescription: jsonb('localized_description').$type<TranslationMap>(),
    heroImageUrl: text('hero_image_url'),
    status: text('status').$type<SupplyListStatus>().notNull().default('draft'),
    publicCode: text('public_code').unique(),
    sourceListId: integer('source_list_id').references((): AnyPgColumn => schoolSupplyLists.id, {
      onDelete: 'restrict',
    }),
    replacesListId: integer('replaces_list_id').references(
      (): AnyPgColumn => schoolSupplyLists.id,
      {
        onDelete: 'restrict',
      },
    ),
    replacedById: integer('replaced_by_id').references((): AnyPgColumn => schoolSupplyLists.id, {
      onDelete: 'restrict',
    }),
    publishedAt: timestamp('published_at'),
    archivedAt: timestamp('archived_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    check('ck_supply_list_status', sql`${table.status} in ('draft', 'published', 'archived')`),
    check(
      'ck_supply_list_publication',
      sql`(${table.status} = 'draft' and ${table.publicCode} is null and ${table.publishedAt} is null and ${table.archivedAt} is null)
        or (${table.status} = 'published' and ${table.publicCode} ~ '^[0-9a-f]{32}$' and ${table.publicCode} is not null and ${table.publishedAt} is not null and ${table.archivedAt} is null)
        or (${table.status} = 'archived' and ${table.publicCode} ~ '^[0-9a-f]{32}$' and ${table.publicCode} is not null and ${table.publishedAt} is not null and ${table.archivedAt} is not null)`,
    ),
    uniqueIndex('uq_supply_list_published_slot')
      .on(table.businessPartnerId, table.academicYear, table.grade)
      .where(sql`${table.status} = 'published'`),
    index('idx_supply_list_partner').on(table.businessPartnerId),
  ],
);

export const schoolSupplyListItems = schoolEngineSchema.table(
  'school_supply_list_items',
  {
    id: serial('id').primaryKey(),
    listId: integer('list_id')
      .notNull()
      .references(() => schoolSupplyLists.id, { onDelete: 'cascade' }),
    // A draft may be incomplete. Deleting a published default is prevented by the freeze trigger.
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    exactItem: boolean('exact_item').notNull().default(false),
    specification: jsonb('specification').$type<SupplyListSpecification>(),
    required: boolean('required').notNull().default(true),
    quantity: integer('quantity').notNull().default(1),
    localizedLabel: jsonb('localized_label').$type<TranslationMap>().notNull(),
    localizedNote: jsonb('localized_note').$type<TranslationMap>(),
    sortOrder: integer('sort_order').notNull().default(0),
    productNameEnSnapshot: text('product_name_en_snapshot'),
    productNameArSnapshot: text('product_name_ar_snapshot'),
    skuSnapshot: text('sku_snapshot'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    check('ck_supply_list_item_quantity', sql`${table.quantity} between 1 and 999`),
    index('idx_supply_list_item_list').on(table.listId),
  ],
);

export type SchoolSupplyListRow = typeof schoolSupplyLists.$inferSelect;
export type SchoolSupplyListItemRow = typeof schoolSupplyListItems.$inferSelect;
