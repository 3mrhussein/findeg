import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../schema';

/**
 * Partner Membership queries.
 *
 * Unlike most query modules these never import `connection.ts`: callers pass the
 * executor (a database or an open transaction), so the module is usable with any
 * connection, including the integration-test database.
 */

export type PartnerDatabase = PostgresJsDatabase<typeof schema>;
export type PartnerTransaction = Parameters<Parameters<PartnerDatabase['transaction']>[0]>[0];
export type PartnerExecutor = PartnerDatabase | PartnerTransaction;

const {
  businessPartners,
  partnerAccessHistory,
  partnerInvitations,
  partnerInvitationTokens,
  partnerMemberships,
  users,
} = schema;

export type BusinessPartnerRow = typeof businessPartners.$inferSelect;
export type NewBusinessPartnerRow = Pick<
  typeof businessPartners.$inferInsert,
  'code' | 'nameEn' | 'nameAr'
>;
export type BusinessPartnerPatch = Partial<Pick<BusinessPartnerRow, 'code' | 'nameEn' | 'nameAr'>>;
export type NewPartnerAccessHistoryRow = typeof partnerAccessHistory.$inferInsert;

const BUSINESS_PARTNER_CODE_CONSTRAINT = 'business_partners_code_unique';

/** True when `error` is the unique-violation on `business_partners.code`. */
export function isPartnerCodeTakenError(error: unknown): boolean {
  let current = error;
  while (current && typeof current === 'object') {
    const { code, constraint_name, cause } = current as {
      code?: string;
      constraint_name?: string;
      cause?: unknown;
    };
    if (code === '23505' && constraint_name === BUSINESS_PARTNER_CODE_CONSTRAINT) return true;
    current = cause;
  }
  return false;
}

export async function listBusinessPartners(executor: PartnerExecutor) {
  return executor.select().from(businessPartners).orderBy(asc(businessPartners.code));
}

export async function getBusinessPartnerById(
  executor: PartnerExecutor,
  id: number,
): Promise<BusinessPartnerRow | undefined> {
  const [row] = await executor.select().from(businessPartners).where(eq(businessPartners.id, id));
  return row;
}

export async function getBusinessPartnerByCode(
  executor: PartnerExecutor,
  code: string,
): Promise<BusinessPartnerRow | undefined> {
  const [row] = await executor
    .select()
    .from(businessPartners)
    .where(eq(businessPartners.code, code));
  return row;
}

/** Locks the row (`SELECT … FOR UPDATE`) so changes to one partner run one at a time. */
export async function lockBusinessPartnerById(
  executor: PartnerTransaction,
  id: number,
): Promise<BusinessPartnerRow | undefined> {
  const [row] = await executor
    .select()
    .from(businessPartners)
    .where(eq(businessPartners.id, id))
    .for('update');
  return row;
}

export async function insertBusinessPartner(
  executor: PartnerTransaction,
  values: NewBusinessPartnerRow,
): Promise<BusinessPartnerRow> {
  const [row] = await executor.insert(businessPartners).values(values).returning();
  return row;
}

export async function updateBusinessPartner(
  executor: PartnerTransaction,
  id: number,
  patch: BusinessPartnerPatch,
): Promise<BusinessPartnerRow> {
  const [row] = await executor
    .update(businessPartners)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(businessPartners.id, id))
    .returning();
  return row;
}

export async function insertPartnerAccessHistory(
  executor: PartnerTransaction,
  row: NewPartnerAccessHistoryRow,
): Promise<void> {
  await executor.insert(partnerAccessHistory).values(row);
}

export type PartnerInvitationRow = typeof partnerInvitations.$inferSelect;
export type NewPartnerInvitationRow = Pick<
  typeof partnerInvitations.$inferInsert,
  'businessPartnerId' | 'email' | 'roles' | 'invitedByUserId' | 'expiresAt'
>;

export async function getPartnerInvitationById(
  executor: PartnerExecutor,
  id: number,
): Promise<PartnerInvitationRow | undefined> {
  const [row] = await executor
    .select()
    .from(partnerInvitations)
    .where(eq(partnerInvitations.id, id));
  return row;
}

export async function listPendingPartnerInvitations(
  executor: PartnerExecutor,
  businessPartnerId: number,
): Promise<PartnerInvitationRow[]> {
  return executor
    .select()
    .from(partnerInvitations)
    .where(
      and(
        eq(partnerInvitations.businessPartnerId, businessPartnerId),
        eq(partnerInvitations.status, 'pending'),
      ),
    )
    .orderBy(asc(partnerInvitations.createdAt), asc(partnerInvitations.id));
}

export async function getPendingPartnerInvitationByEmail(
  executor: PartnerTransaction,
  businessPartnerId: number,
  email: string,
): Promise<PartnerInvitationRow | undefined> {
  const [row] = await executor
    .select()
    .from(partnerInvitations)
    .where(
      and(
        eq(partnerInvitations.businessPartnerId, businessPartnerId),
        eq(partnerInvitations.email, email),
        eq(partnerInvitations.status, 'pending'),
      ),
    );
  return row;
}

export async function insertPartnerInvitation(
  executor: PartnerTransaction,
  values: NewPartnerInvitationRow,
): Promise<PartnerInvitationRow> {
  const [row] = await executor.insert(partnerInvitations).values(values).returning();
  return row;
}

export async function setPartnerInvitationStatus(
  executor: PartnerTransaction,
  id: number,
  status: PartnerInvitationRow['status'],
): Promise<PartnerInvitationRow> {
  const [row] = await executor
    .update(partnerInvitations)
    .set({ status })
    .where(eq(partnerInvitations.id, id))
    .returning();
  return row;
}

export async function setPartnerInvitationExpiry(
  executor: PartnerTransaction,
  id: number,
  expiresAt: Date,
): Promise<PartnerInvitationRow> {
  const [row] = await executor
    .update(partnerInvitations)
    .set({ expiresAt })
    .where(eq(partnerInvitations.id, id))
    .returning();
  return row;
}

export async function insertPartnerInvitationToken(
  executor: PartnerTransaction,
  invitationId: number,
  tokenDigest: string,
): Promise<void> {
  await executor.insert(partnerInvitationTokens).values({ invitationId, tokenDigest });
}

/** The invitation a token digest belongs to, whatever its state. */
export async function getPartnerInvitationByTokenDigest(
  executor: PartnerExecutor,
  tokenDigest: string,
): Promise<PartnerInvitationRow | undefined> {
  const [row] = await executor
    .select({ invitation: partnerInvitations })
    .from(partnerInvitationTokens)
    .innerJoin(partnerInvitations, eq(partnerInvitations.id, partnerInvitationTokens.invitationId))
    .where(eq(partnerInvitationTokens.tokenDigest, tokenDigest));
  return row?.invitation;
}

export type PartnerMembershipRow = typeof partnerMemberships.$inferSelect;
export type NewPartnerMembershipRow = Pick<
  typeof partnerMemberships.$inferInsert,
  'businessPartnerId' | 'userId' | 'invitationId' | 'roles'
>;

export async function getCurrentPartnerMembership(
  executor: PartnerExecutor,
  businessPartnerId: number,
  userId: number,
): Promise<PartnerMembershipRow | undefined> {
  const [row] = await executor
    .select()
    .from(partnerMemberships)
    .where(
      and(
        eq(partnerMemberships.businessPartnerId, businessPartnerId),
        eq(partnerMemberships.userId, userId),
        ne(partnerMemberships.status, 'ended'),
      ),
    );
  return row;
}

export async function insertPartnerMembership(
  executor: PartnerTransaction,
  values: NewPartnerMembershipRow,
): Promise<PartnerMembershipRow> {
  const [row] = await executor.insert(partnerMemberships).values(values).returning();
  return row;
}

export async function verifyUserEmailIfUnset(
  executor: PartnerTransaction,
  userId: number,
  verifiedAt: Date,
): Promise<void> {
  await executor
    .update(users)
    .set({ emailVerified: verifiedAt, updatedAt: verifiedAt })
    .where(and(eq(users.id, userId), isNull(users.emailVerified)));
}

export async function getPartnerUserById(
  executor: PartnerExecutor,
  userId: number,
): Promise<
  { id: number; email: string; isActive: boolean; authorizationVersion: number } | undefined
> {
  const [row] = await executor
    .select({
      id: users.id,
      email: users.email,
      isActive: users.isActive,
      authorizationVersion: users.authorizationVersion,
    })
    .from(users)
    .where(eq(users.id, userId));
  return row;
}

export type ActivePartnerMembershipRow = {
  membership: PartnerMembershipRow;
  partner: BusinessPartnerRow;
};

/** A user's active memberships with their Business Partners, ordered by partner code. */
export async function listActivePartnerMembershipsForUser(
  executor: PartnerExecutor,
  userId: number,
): Promise<ActivePartnerMembershipRow[]> {
  return executor
    .select({ membership: partnerMemberships, partner: businessPartners })
    .from(partnerMemberships)
    .innerJoin(businessPartners, eq(businessPartners.id, partnerMemberships.businessPartnerId))
    .where(and(eq(partnerMemberships.userId, userId), eq(partnerMemberships.status, 'active')))
    .orderBy(asc(businessPartners.code));
}
