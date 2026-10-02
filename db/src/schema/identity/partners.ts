import { sql } from 'drizzle-orm';
import { check, index, integer, jsonb, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { identitySchema } from '../schemas';
import { users } from './users';

export const PARTNER_STATUSES = ['onboarding', 'active', 'suspended', 'closed'] as const;
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

export const PARTNER_ACTOR_KINDS = ['staff', 'partner', 'self'] as const;
export type PartnerActorKind = (typeof PARTNER_ACTOR_KINDS)[number];

export const PARTNER_ACCESS_ACTIONS = [
  'partner.created',
  'partner.updated',
  'partner.status_changed',
  'invitation.issued',
  'invitation.resent',
  'invitation.revoked',
  'membership.accepted',
  'membership.roles_changed',
  'membership.suspended',
  'membership.reactivated',
  'membership.ended',
  'membership.left',
] as const;
export type PartnerAccessAction = (typeof PARTNER_ACCESS_ACTIONS)[number];

const inList = (values: readonly string[]) =>
  sql.raw(values.map((value) => `'${value}'`).join(', '));

/**
 * Business Partner: the organization a Partner Workspace belongs to.
 * `code` is the URL segment of its workspace; the service only lets it change
 * while the partner is `onboarding`.
 */
export const businessPartners = identitySchema.table(
  'business_partners',
  {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 120 }).notNull().unique(),
    nameEn: varchar('name_en', { length: 255 }).notNull(),
    nameAr: varchar('name_ar', { length: 255 }).notNull(),
    status: varchar('status', { length: 20 })
      .$type<PartnerStatus>()
      .notNull()
      .default('onboarding'),
    authorizationVersion: integer('authorization_version').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    check('ck_business_partners_status', sql`${table.status} in (${inList(PARTNER_STATUSES)})`),
    check('ck_business_partners_code_format', sql`${table.code} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ],
);

/**
 * Append-only audit trail of Partner Membership changes. A trigger (see the
 * migration) rejects UPDATE and DELETE.
 * `membershipId` / `invitationId` become foreign keys when those tables exist.
 */
export const partnerAccessHistory = identitySchema.table(
  'partner_access_history',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    membershipId: integer('membership_id'),
    invitationId: integer('invitation_id'),
    actorUserId: integer('actor_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    actorKind: varchar('actor_kind', { length: 20 }).$type<PartnerActorKind>().notNull(),
    action: varchar('action', { length: 40 }).$type<PartnerAccessAction>().notNull(),
    before: jsonb('before'),
    after: jsonb('after'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_partner_access_history_partner').on(table.businessPartnerId, table.createdAt),
    check(
      'ck_partner_access_history_actor_kind',
      sql`${table.actorKind} in (${inList(PARTNER_ACTOR_KINDS)})`,
    ),
    check(
      'ck_partner_access_history_action',
      sql`${table.action} in (${inList(PARTNER_ACCESS_ACTIONS)})`,
    ),
  ],
);
