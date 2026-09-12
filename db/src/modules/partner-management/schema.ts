/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { organizations, organizationMemberships } from '../../schema/identity/identity-access.js';

import {
  serial,
  integer,
  text,
  varchar,
  timestamp,
  jsonb,
  check,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { identitySchema } from '../../schema/schemas.js';
import { users } from '../../schema/identity/users.js';

export const businessPartners = identitySchema.table(
  'business_partners',
  {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 120 }).notNull().unique(),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar').notNull(),
    status: text('status').notNull().default('onboarding'),
    authorizationVersion: integer('authorization_version').notNull().default(1),
  },
  (table) => [
    check(
      'partner_status',
      sql`${table.status} in ('onboarding', 'active', 'suspended', 'closed')`,
    ),
  ],
);

export const partnerInvitations = identitySchema.table(
  'partner_invitations',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id),
    email: varchar('email', { length: 255 }).notNull(),
    roles: text('roles').array().notNull(),
    tokenDigest: varchar('token_digest', { length: 64 }).notNull().unique(),
    inviterId: integer('inviter_id')
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('invitation_status', sql`${table.status} in ('pending', 'accepted', 'revoked')`),
    check(
      'invitation_roles',
      sql`cardinality(${table.roles}) > 0 and ${table.roles} <@ ARRAY['partner-administrator', 'list-manager', 'collection-staff', 'report-viewer']::text[]`,
    ),
    uniqueIndex('one_pending_partner_invitation')
      .on(table.businessPartnerId, table.email)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export const partnerMemberships = identitySchema.table(
  'partner_memberships',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    invitationId: integer('invitation_id')
      .notNull()
      .unique()
      .references(() => partnerInvitations.id),
    roles: text('roles').array().notNull(),
    status: text('status').notNull().default('active'),
    authorizationVersion: integer('authorization_version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('membership_status', sql`${table.status} in ('active', 'suspended', 'ended')`),
    check(
      'membership_roles',
      sql`cardinality(${table.roles}) > 0 and ${table.roles} <@ ARRAY['partner-administrator', 'list-manager', 'collection-staff', 'report-viewer']::text[]`,
    ),
    uniqueIndex('one_current_partner_membership')
      .on(table.businessPartnerId, table.userId)
      .where(sql`${table.status} <> 'ended'`),
  ],
);

export const partnerAccessHistory = identitySchema.table('partner_access_history', {
  id: serial('id').primaryKey(),
  businessPartnerId: integer('business_partner_id')
    .notNull()
    .references(() => businessPartners.id),
  actorId: integer('actor_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(),
  before: jsonb('before'),
  after: jsonb('after'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
