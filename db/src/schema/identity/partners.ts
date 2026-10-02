import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
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
 * `membershipId` becomes a foreign key when memberships exist.
 */
export const partnerAccessHistory = identitySchema.table(
  'partner_access_history',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    membershipId: integer('membership_id').references(() => partnerMemberships.id, {
      onDelete: 'restrict',
    }),
    invitationId: integer('invitation_id').references(() => partnerInvitations.id, {
      onDelete: 'restrict',
    }),
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

export const PARTNER_ROLES = [
  'partner-administrator',
  'list-manager',
  'collection-staff',
  'report-viewer',
] as const;
export type PartnerRole = (typeof PARTNER_ROLES)[number];
/** The role that manages a Business Partner's members; every partner must keep one active. */
export const PARTNER_ADMINISTRATOR = 'partner-administrator' satisfies PartnerRole;

export const PARTNER_INVITATION_STATUSES = ['pending', 'accepted', 'revoked'] as const;
export type PartnerInvitationStatus = (typeof PARTNER_INVITATION_STATUSES)[number];

/**
 * A Partner Invitation: an email invited to a Business Partner with one or more
 * Partner Roles. `email` is stored trimmed and lowercased. Only one invitation
 * per (partner, email) may be pending at a time.
 */
export const partnerInvitations = identitySchema.table(
  'partner_invitations',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    email: varchar('email', { length: 255 }).notNull(),
    roles: text('roles').array().$type<PartnerRole[]>().notNull(),
    status: varchar('status', { length: 20 })
      .$type<PartnerInvitationStatus>()
      .notNull()
      .default('pending'),
    invitedByUserId: integer('invited_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    check(
      'ck_partner_invitations_status',
      sql`${table.status} in (${inList(PARTNER_INVITATION_STATUSES)})`,
    ),
    check(
      'ck_partner_invitations_roles',
      sql`cardinality(${table.roles}) > 0 and ${table.roles} <@ array[${inList(PARTNER_ROLES)}]::text[]`,
    ),
    uniqueIndex('uq_partner_invitations_pending')
      .on(table.businessPartnerId, table.email)
      .where(sql`${table.status} = 'pending'`),
  ],
);

/**
 * Digests of the secrets sent for an invitation (ADR-0008: every send carries a
 * fresh secret). Raw tokens are never stored. A token is valid only while its
 * invitation is pending and unexpired.
 */
export const partnerInvitationTokens = identitySchema.table('partner_invitation_tokens', {
  id: serial('id').primaryKey(),
  invitationId: integer('invitation_id')
    .notNull()
    .references(() => partnerInvitations.id, { onDelete: 'cascade' }),
  tokenDigest: varchar('token_digest', { length: 64 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const PARTNER_MEMBERSHIP_STATUSES = ['active', 'suspended', 'ended'] as const;
export type PartnerMembershipStatus = (typeof PARTNER_MEMBERSHIP_STATUSES)[number];

/**
 * A user's access to one Business Partner. Ended memberships remain as history;
 * a later invitation always creates a new membership row.
 */
export const partnerMemberships = identitySchema.table(
  'partner_memberships',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    invitationId: integer('invitation_id')
      .notNull()
      .unique()
      .references(() => partnerInvitations.id, { onDelete: 'restrict' }),
    roles: text('roles').array().$type<PartnerRole[]>().notNull(),
    status: varchar('status', { length: 20 })
      .$type<PartnerMembershipStatus>()
      .notNull()
      .default('active'),
    authorizationVersion: integer('authorization_version').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    check(
      'ck_partner_memberships_status',
      sql`${table.status} in (${inList(PARTNER_MEMBERSHIP_STATUSES)})`,
    ),
    check(
      'ck_partner_memberships_roles',
      sql`cardinality(${table.roles}) > 0 and ${table.roles} <@ array[${inList(PARTNER_ROLES)}]::text[]`,
    ),
    uniqueIndex('uq_partner_memberships_current')
      .on(table.businessPartnerId, table.userId)
      .where(sql`${table.status} <> 'ended'`),
  ],
);
