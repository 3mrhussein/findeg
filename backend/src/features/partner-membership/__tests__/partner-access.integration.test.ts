import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  businessPartners,
  partnerMemberships,
  users,
  type PartnerMembershipStatus,
  type PartnerStatus,
} from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createPartnerMembershipServices,
  type PartnerAction,
  type PartnerRole,
  type PartnerServices,
  type PartnerSession,
  type StaffActor,
} from '..';

const PARTNER_STATUSES: PartnerStatus[] = ['onboarding', 'active', 'suspended', 'closed'];
const MEMBERSHIP_STATUSES: PartnerMembershipStatus[] = ['active', 'suspended', 'ended'];
const ACTIONS: PartnerAction[] = ['read', 'reports', 'membership-change', 'business'];

/** The #175 partner-status table: which Business Partner statuses allow each action class. */
const ACTION_ALLOWED: Record<PartnerAction, PartnerStatus[]> = {
  read: ['onboarding', 'active', 'suspended'],
  reports: ['onboarding', 'active', 'suspended', 'closed'],
  'membership-change': ['onboarding', 'active'],
  business: ['active'],
};

describe('Partner access check', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let sequence = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({ db: testDb.db });
    const [staffUser] = await testDb.db
      .insert(users)
      .values({ email: 'access-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staff = { kind: 'staff', userId: staffUser.id, permissionCodes: ['partners.manage'] };
  });

  afterAll(async () => testDb.close());

  async function member(
    roles: PartnerRole[],
    partnerStatus: PartnerStatus,
    membershipStatus: PartnerMembershipStatus,
  ) {
    sequence += 1;
    const email = `access-member-${sequence}@findeg.test`;
    const partnerResult = await services.partners.createPartner(staff, {
      code: `access-partner-${sequence}`,
      nameEn: 'Access School',
      nameAr: 'مدرسة الوصول',
    });
    if (!partnerResult.success) throw new Error(partnerResult.error);
    const [user] = await testDb.db.insert(users).values({ email }).returning();
    const invitation = await services.invitations.invite(staff, partnerResult.data.id, {
      email,
      roles,
    });
    if (!invitation.success) throw new Error(invitation.error);
    const session: PartnerSession = { userId: user.id, user: { email } };
    const accepted = await services.memberships.acceptInvitation(invitation.data.token, session);
    if (!accepted.success) throw new Error(accepted.error);
    await setStatuses(partnerResult.data.id, accepted.data.membership.id, {
      partnerStatus,
      membershipStatus,
    });
    return { partner: partnerResult.data, session, membershipId: accepted.data.membership.id };
  }

  // changePartnerStatus and updateMembership are separate features; arrange the states directly.
  async function setStatuses(
    partnerId: number,
    membershipId: number,
    next: { partnerStatus?: PartnerStatus; membershipStatus?: PartnerMembershipStatus },
  ) {
    if (next.partnerStatus) {
      await testDb.db
        .update(businessPartners)
        .set({ status: next.partnerStatus })
        .where(eq(businessPartners.id, partnerId));
    }
    if (next.membershipStatus) {
      await testDb.db
        .update(partnerMemberships)
        .set({ status: next.membershipStatus })
        .where(eq(partnerMemberships.id, membershipId));
    }
  }

  describe('resolvePartnerContext', () => {
    for (const partnerStatus of PARTNER_STATUSES) {
      for (const membershipStatus of MEMBERSHIP_STATUSES) {
        const expected =
          membershipStatus === 'active'
            ? 'member'
            : membershipStatus === 'suspended'
              ? 'suspended'
              : 'not-found';
        it(`${membershipStatus} member of a ${partnerStatus} partner resolves to ${expected}`, async () => {
          const { partner, session } = await member(
            ['list-manager'],
            partnerStatus,
            membershipStatus,
          );

          const result = await services.memberships.resolvePartnerContext(session, partner.code);

          if (expected === 'member') {
            expect(result).toMatchObject({
              success: true,
              data: {
                partner: { code: partner.code, status: partnerStatus },
                membership: { status: 'active', roles: ['list-manager'] },
              },
            });
          } else {
            expect(result).toEqual({ success: false, error: expected });
          }
        });
      }
    }

    it('returns not-found without a session, for an unknown code, and for a non-member', async () => {
      const { partner } = await member(['list-manager'], 'active', 'active');
      const [stranger] = await testDb.db
        .insert(users)
        .values({ email: `stranger-${sequence}@findeg.test` })
        .returning();

      expect(await services.memberships.resolvePartnerContext(null, partner.code)).toEqual({
        success: false,
        error: 'not-found',
      });
      expect(
        await services.memberships.resolvePartnerContext(
          { userId: stranger.id, user: { email: stranger.email } },
          partner.code,
        ),
      ).toEqual({ success: false, error: 'not-found' });
      expect(
        await services.memberships.resolvePartnerContext(
          { userId: stranger.id, user: { email: stranger.email } },
          'no-such-partner',
        ),
      ).toEqual({ success: false, error: 'not-found' });
    });

    it('applies a role or status change on the very next resolution', async () => {
      const { partner, session, membershipId } = await member(['list-manager'], 'active', 'active');
      const first = await services.memberships.resolvePartnerContext(session, partner.code);
      expect(first.success).toBe(true);

      await testDb.db
        .update(partnerMemberships)
        .set({ roles: ['report-viewer'] })
        .where(eq(partnerMemberships.id, membershipId));
      const afterRoleChange = await services.memberships.resolvePartnerContext(
        session,
        partner.code,
      );
      expect(afterRoleChange).toMatchObject({
        success: true,
        data: { membership: { roles: ['report-viewer'] } },
      });

      await setStatuses(partner.id, membershipId, { membershipStatus: 'suspended' });
      expect(await services.memberships.resolvePartnerContext(session, partner.code)).toEqual({
        success: false,
        error: 'suspended',
      });
    });

    it('rejects a session for a deactivated account', async () => {
      const { partner, session } = await member(['list-manager'], 'active', 'active');
      await testDb.db.update(users).set({ isActive: false }).where(eq(users.id, session.userId));

      expect(await services.memberships.resolvePartnerContext(session, partner.code)).toEqual({
        success: false,
        error: 'not-found',
      });
    });
  });

  describe('requireRole', () => {
    for (const partnerStatus of PARTNER_STATUSES) {
      for (const action of ACTIONS) {
        const allowed = ACTION_ALLOWED[action].includes(partnerStatus);
        it(`${action} on a ${partnerStatus} partner is ${allowed ? 'allowed' : 'refused'} for an active member holding the role`, async () => {
          const { partner, session } = await member(['list-manager'], partnerStatus, 'active');
          const context = await services.memberships.resolvePartnerContext(session, partner.code);
          if (!context.success) throw new Error(context.error);

          expect(services.memberships.requireRole(context.data, ['list-manager'], action)).toEqual(
            allowed
              ? { success: true, data: context.data }
              : { success: false, error: 'partner-status-not-allowed' },
          );
        });
      }
    }

    it('refuses a member who holds none of the required roles, whatever the status', async () => {
      const { partner, session } = await member(['report-viewer'], 'active', 'active');
      const context = await services.memberships.resolvePartnerContext(session, partner.code);
      if (!context.success) throw new Error(context.error);

      for (const action of ACTIONS) {
        expect(
          services.memberships.requireRole(context.data, ['partner-administrator'], action),
        ).toEqual({
          success: false,
          error: 'role-not-held',
        });
      }
    });

    it("accepts every Partner Role when roles is 'any', still applying the status table", async () => {
      const { partner, session } = await member(['report-viewer'], 'suspended', 'active');
      const context = await services.memberships.resolvePartnerContext(session, partner.code);
      if (!context.success) throw new Error(context.error);

      expect(services.memberships.requireRole(context.data, 'any', 'read').success).toBe(true);
      expect(services.memberships.requireRole(context.data, 'any', 'business')).toEqual({
        success: false,
        error: 'partner-status-not-allowed',
      });
    });

    it('accepts any one of several required roles', async () => {
      const { partner, session } = await member(
        ['collection-staff', 'report-viewer'],
        'active',
        'active',
      );
      const context = await services.memberships.resolvePartnerContext(session, partner.code);
      if (!context.success) throw new Error(context.error);

      expect(
        services.memberships.requireRole(
          context.data,
          ['partner-administrator', 'report-viewer'],
          'business',
        ).success,
      ).toBe(true);
    });
  });

  describe('listActiveMemberships', () => {
    it('lists only active memberships of the signed-in user', async () => {
      const active = await member(['list-manager'], 'active', 'active');
      const suspended = await member(['list-manager'], 'active', 'suspended');

      const activeList = await services.memberships.listActiveMemberships(active.session);
      expect(activeList.map((context) => context.partner.code)).toEqual([active.partner.code]);
      expect(await services.memberships.listActiveMemberships(suspended.session)).toEqual([]);
      expect(await services.memberships.listActiveMemberships(null)).toEqual([]);
    });
  });
});
