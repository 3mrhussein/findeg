import { and, eq, sql } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import {
  businessPartners,
  partnerMemberships,
  partnerInvitations,
  partnerAccessHistory,
} from '@findeg/db/modules/partner-management';
import type { PartnerStore, Invitation } from '../public.js';
import type {
  BusinessPartner,
  PartnerMembership,
  PartnerRole,
  PartnerStatus,
  MembershipStatus,
} from '../contracts.js';

function partner(row: typeof businessPartners.$inferSelect): BusinessPartner {
  return { ...row, status: row.status as PartnerStatus };
}
function membership(row: typeof partnerMemberships.$inferSelect): PartnerMembership {
  return { ...row, status: row.status as MembershipStatus, roles: row.roles as PartnerRole[] };
}
const invitationFields = {
  id: partnerInvitations.id,
  businessPartnerId: partnerInvitations.businessPartnerId,
  email: partnerInvitations.email,
  roles: partnerInvitations.roles,
  expiresAt: partnerInvitations.expiresAt,
  status: partnerInvitations.status,
  inviterId: partnerInvitations.inviterId,
  createdAt: partnerInvitations.createdAt,
};
function invitation(row: Omit<Invitation, 'roles'> & { roles: string[] }): Invitation {
  return { ...row, roles: row.roles as PartnerRole[] };
}
export function bindPartnerStore(database: TransactionDatabase): PartnerStore {
  return {
    async createPartner(input) {
      const [row] = await database
        .insert(businessPartners)
        .values(input)
        .onConflictDoNothing()
        .returning();
      return row && partner(row);
    },
    async lockPartner(id) {
      const [row] = await database
        .select()
        .from(businessPartners)
        .where(eq(businessPartners.id, id))
        .for('update');
      return row && partner(row);
    },
    async eligibleWorkspaces(userId) {
      const rows = await database
        .select({ partner: businessPartners, membership: partnerMemberships })
        .from(partnerMemberships)
        .innerJoin(businessPartners, eq(businessPartners.id, partnerMemberships.businessPartnerId))
        .where(
          and(
            eq(partnerMemberships.userId, userId),
            eq(partnerMemberships.status, 'active'),
            eq(businessPartners.status, 'active'),
          ),
        );
      return rows.map((row) => ({
        partner: partner(row.partner),
        membership: membership(row.membership),
      }));
    },
    async memberships(partnerId) {
      return (
        await database
          .select()
          .from(partnerMemberships)
          .where(eq(partnerMemberships.businessPartnerId, partnerId))
      ).map(membership);
    },
    async changePartnerStatus(id, status) {
      await database
        .update(businessPartners)
        .set({ status, authorizationVersion: sql`${businessPartners.authorizationVersion} + 1` })
        .where(eq(businessPartners.id, id));
    },
    async issueInvitation(input) {
      const revoked = await database
        .update(partnerInvitations)
        .set({ status: 'revoked' })
        .where(
          and(
            eq(partnerInvitations.businessPartnerId, input.businessPartnerId),
            eq(partnerInvitations.email, input.email),
            eq(partnerInvitations.status, 'pending'),
          ),
        )
        .returning(invitationFields);
      const [issued] = await database
        .insert(partnerInvitations)
        .values({ ...input, roles: [...input.roles] })
        .returning(invitationFields);
      return { issued: invitation(issued!), revoked: revoked.map(invitation) };
    },
    async invitation(digest) {
      // Serialize acceptance with issuance and membership changes on the Business Partner.
      const [reference] = await database
        .select({ partnerId: partnerInvitations.businessPartnerId })
        .from(partnerInvitations)
        .where(eq(partnerInvitations.tokenDigest, digest));
      if (!reference) return undefined;
      await database
        .select()
        .from(businessPartners)
        .where(eq(businessPartners.id, reference.partnerId))
        .for('update');
      const [row] = await database
        .select(invitationFields)
        .from(partnerInvitations)
        .where(eq(partnerInvitations.tokenDigest, digest))
        .for('update');
      return row && invitation(row);
    },
    async acceptInvitation(invitation, userId) {
      const [row] = await database
        .insert(partnerMemberships)
        .values({
          invitationId: invitation.id,
          businessPartnerId: invitation.businessPartnerId,
          userId,
          roles: [...invitation.roles],
        })
        .returning();
      await database
        .update(partnerInvitations)
        .set({ status: 'accepted' })
        .where(eq(partnerInvitations.id, invitation.id));
      return membership(row!);
    },
    async invitations(partnerId) {
      return (
        await database
          .select(invitationFields)
          .from(partnerInvitations)
          .where(eq(partnerInvitations.businessPartnerId, partnerId))
      ).map(invitation);
    },
    async revokeInvitation(partnerId, invitationId) {
      const [row] = await database
        .update(partnerInvitations)
        .set({ status: 'revoked' })
        .where(
          and(
            eq(partnerInvitations.id, invitationId),
            eq(partnerInvitations.businessPartnerId, partnerId),
            eq(partnerInvitations.status, 'pending'),
          ),
        )
        .returning(invitationFields);
      return row && invitation(row);
    },
    async updateMembership(id, roles, status) {
      await database
        .update(partnerMemberships)
        .set({
          roles: [...roles],
          status,
          authorizationVersion: sql`${partnerMemberships.authorizationVersion} + 1`,
        })
        .where(eq(partnerMemberships.id, id));
    },
    async accessHistory(partnerId) {
      return database
        .select({
          actorId: partnerAccessHistory.actorId,
          action: partnerAccessHistory.action,
          before: partnerAccessHistory.before,
          after: partnerAccessHistory.after,
          createdAt: partnerAccessHistory.createdAt,
        })
        .from(partnerAccessHistory)
        .where(eq(partnerAccessHistory.businessPartnerId, partnerId))
        .orderBy(partnerAccessHistory.id);
    },
    async audit(businessPartnerId, actorId, action, before, after) {
      await database
        .insert(partnerAccessHistory)
        .values({ businessPartnerId, actorId, action, before, after });
    },
  };
}
