import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { Sql } from 'postgres';
import * as schema from '@findeg/db/schema';
import {
  businessPartners,
  partnerAccessHistory,
  partnerMemberships,
  users,
} from '@findeg/db/schema';
import {
  connectToTestDatabase,
  runConcurrently,
  type TestDatabase,
} from '../../../testing/postgres';
import {
  createPartnerMembershipServices,
  PARTNER_ADMINISTRATOR,
  type PartnerActor,
  type PartnerRole,
  type PartnerServices,
  type StaffActor,
} from '..';

const ADMIN = PARTNER_ADMINISTRATOR;

describe('Partner Membership management', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let sequence = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({ db: testDb.db });
    const [staffUser] = await testDb.db
      .insert(users)
      .values({ email: 'management-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staff = { kind: 'staff', userId: staffUser.id, permissionCodes: ['partners.manage'] };
  });

  afterAll(async () => testDb.close());

  async function newPartner() {
    sequence += 1;
    const created = await services.partners.createPartner(staff, {
      code: `management-partner-${sequence}`,
      nameEn: 'Management School',
      nameAr: 'مدرسة الإدارة',
    });
    if (!created.success) throw new Error(created.error);
    return created.data;
  }

  /** A member created through the real invite and accept path. */
  async function addMember(partnerId: number, roles: PartnerRole[] = [ADMIN]) {
    sequence += 1;
    const email = `member-${sequence}@findeg.test`;
    const [user] = await testDb.db.insert(users).values({ email }).returning();
    const invited = await services.invitations.invite(staff, partnerId, { email, roles });
    if (!invited.success) throw new Error(invited.error);
    const accepted = await services.memberships.acceptInvitation(invited.data.token, {
      userId: user.id,
      user: { email },
    });
    if (!accepted.success) throw new Error(accepted.error);
    const actor: PartnerActor = { kind: 'partner', userId: user.id };
    return { user, actor, membership: accepted.data.membership };
  }

  async function setPartnerStatus(
    partnerId: number,
    status: 'onboarding' | 'active' | 'suspended' | 'closed',
  ) {
    await testDb.db
      .update(businessPartners)
      .set({ status })
      .where(eq(businessPartners.id, partnerId));
  }

  const history = async (membershipId: number) =>
    testDb.db
      .select()
      .from(partnerAccessHistory)
      .where(eq(partnerAccessHistory.membershipId, membershipId))
      .orderBy(asc(partnerAccessHistory.id));

  async function reload(membershipId: number) {
    const [row] = await testDb.db
      .select()
      .from(partnerMemberships)
      .where(eq(partnerMemberships.id, membershipId));
    return row;
  }

  describe('updateMembership', () => {
    it('changes roles, bumps the version and audits before and after', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['list-manager']);

      const result = await services.memberships.updateMembership(
        admin.actor,
        member.membership.id,
        { roles: ['report-viewer', 'collection-staff'] },
        member.membership.authorizationVersion,
      );

      expect(result).toMatchObject({
        success: true,
        data: { roles: ['report-viewer', 'collection-staff'], authorizationVersion: 2 },
      });
      const [, change] = await history(member.membership.id);
      expect(change).toMatchObject({
        action: 'membership.roles_changed',
        actorKind: 'partner',
        actorUserId: admin.user.id,
        businessPartnerId: partner.id,
        before: { roles: ['list-manager'], authorizationVersion: 1 },
        after: { roles: ['report-viewer', 'collection-staff'], authorizationVersion: 2 },
      });
    });

    it('suspends, reactivates and ends, auditing each', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['list-manager']);
      const id = member.membership.id;

      const suspended = await services.memberships.updateMembership(
        admin.actor,
        id,
        { status: 'suspended' },
        1,
      );
      expect(suspended).toMatchObject({
        success: true,
        data: { status: 'suspended', authorizationVersion: 2 },
      });
      expect(
        await services.memberships.resolvePartnerContext(
          { userId: member.user.id, user: { email: member.user.email } },
          partner.code,
        ),
      ).toEqual({ success: false, error: 'suspended' });

      const reactivated = await services.memberships.updateMembership(
        admin.actor,
        id,
        { status: 'active' },
        2,
      );
      expect(reactivated).toMatchObject({
        success: true,
        data: { status: 'active', authorizationVersion: 3 },
      });

      const ended = await services.memberships.updateMembership(
        admin.actor,
        id,
        { status: 'ended' },
        3,
      );
      expect(ended).toMatchObject({
        success: true,
        data: { status: 'ended', authorizationVersion: 4 },
      });

      expect((await history(id)).map((row) => [row.action, row.actorKind])).toEqual([
        ['membership.accepted', 'self'],
        ['membership.suspended', 'partner'],
        ['membership.reactivated', 'partner'],
        ['membership.ended', 'partner'],
      ]);
    });

    it('returns stale-membership for an out-of-date version and leaves the member untouched', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['list-manager']);
      await services.memberships.updateMembership(
        admin.actor,
        member.membership.id,
        { status: 'suspended' },
        1,
      );

      const stale = await services.memberships.updateMembership(
        admin.actor,
        member.membership.id,
        { roles: ['report-viewer'] },
        1,
      );

      expect(stale).toEqual({ success: false, error: 'stale-membership' });
      expect(await reload(member.membership.id)).toMatchObject({
        roles: ['list-manager'],
        status: 'suspended',
        authorizationVersion: 2,
      });
    });

    it('refuses any change to an ended membership', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['list-manager']);
      await services.memberships.updateMembership(
        admin.actor,
        member.membership.id,
        { status: 'ended' },
        1,
      );

      for (const input of [{ status: 'active' as const }, { roles: ['report-viewer' as const] }]) {
        expect(
          await services.memberships.updateMembership(admin.actor, member.membership.id, input, 2),
        ).toEqual({ success: false, error: 'membership-ended' });
      }
      expect((await reload(member.membership.id)).status).toBe('ended');
    });

    it('requires an active Partner Administrator of the same Business Partner', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const target = await addMember(partner.id, ['list-manager']);
      const otherRole = await addMember(partner.id, ['list-manager', 'report-viewer']);
      const otherPartnerAdmin = await addMember((await newPartner()).id);
      const suspendedAdmin = await addMember(partner.id);
      await services.memberships.updateMembership(
        admin.actor,
        suspendedAdmin.membership.id,
        { status: 'suspended' },
        1,
      );
      const stranger: PartnerActor = { kind: 'partner', userId: staff.userId };

      for (const actor of [
        otherRole.actor,
        otherPartnerAdmin.actor,
        suspendedAdmin.actor,
        stranger,
      ]) {
        expect(
          await services.memberships.updateMembership(
            actor,
            target.membership.id,
            { status: 'suspended' },
            1,
          ),
        ).toEqual({ success: false, error: 'forbidden' });
      }
      expect(
        await services.memberships.updateMembership(admin.actor, 0, { status: 'suspended' }, 1),
      ).toEqual({ success: false, error: 'forbidden' });
      expect((await reload(target.membership.id)).status).toBe('active');
    });

    it.each(['suspended', 'closed'] as const)(
      'is refused while the Business Partner is %s',
      async (status) => {
        const partner = await newPartner();
        const admin = await addMember(partner.id);
        const member = await addMember(partner.id, ['list-manager']);
        await setPartnerStatus(partner.id, status);

        expect(
          await services.memberships.updateMembership(
            admin.actor,
            member.membership.id,
            { status: 'suspended' },
            1,
          ),
        ).toEqual({ success: false, error: 'partner-not-open' });
      },
    );

    it.each(['onboarding', 'active'] as const)(
      'is allowed while the Business Partner is %s',
      async (status) => {
        const partner = await newPartner();
        const admin = await addMember(partner.id);
        const member = await addMember(partner.id, ['list-manager']);
        await setPartnerStatus(partner.id, status);

        expect(
          await services.memberships.updateMembership(
            admin.actor,
            member.membership.id,
            { status: 'suspended' },
            1,
          ),
        ).toMatchObject({ success: true });
      },
    );

    it('rejects an empty or unknown role set', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['list-manager']);
      for (const roles of [[], ['superuser']] as unknown as PartnerRole[][]) {
        expect(
          await services.memberships.updateMembership(
            admin.actor,
            member.membership.id,
            { roles },
            1,
          ),
        ).toEqual({ success: false, error: 'invalid-input' });
      }
    });

    it('treats a change that changes nothing as a no-op without a version bump or audit row', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['list-manager']);

      const result = await services.memberships.updateMembership(
        admin.actor,
        member.membership.id,
        { roles: ['list-manager'], status: 'active' },
        1,
      );

      expect(result).toMatchObject({ success: true, data: { authorizationVersion: 1 } });
      expect(await history(member.membership.id)).toHaveLength(1);
    });
  });

  describe('final-administrator protection', () => {
    it('refuses to let the last administrator drop their own admin role', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id, [ADMIN, 'list-manager']);

      expect(
        await services.memberships.updateMembership(
          admin.actor,
          admin.membership.id,
          { roles: ['list-manager'] },
          1,
        ),
      ).toEqual({ success: false, error: 'last-administrator' });
      expect((await reload(admin.membership.id)).roles).toEqual([ADMIN, 'list-manager']);
    });

    it.each(['suspended', 'ended'] as const)(
      'refuses to let the last administrator be %s',
      async (status) => {
        const partner = await newPartner();
        const admin = await addMember(partner.id);
        await addMember(partner.id, ['list-manager']);

        expect(
          await services.memberships.updateMembership(
            admin.actor,
            admin.membership.id,
            { status },
            1,
          ),
        ).toEqual({ success: false, error: 'last-administrator' });
      },
    );

    it('refuses to let the last administrator leave', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);

      expect(await services.memberships.leave(admin.actor, admin.membership.id)).toEqual({
        success: false,
        error: 'last-administrator',
      });
      expect((await reload(admin.membership.id)).status).toBe('active');
    });

    it('does not count a suspended administrator as another administrator', async () => {
      const partner = await newPartner();
      const first = await addMember(partner.id);
      const second = await addMember(partner.id);
      await services.memberships.updateMembership(
        first.actor,
        second.membership.id,
        { status: 'suspended' },
        1,
      );

      expect(await services.memberships.leave(first.actor, first.membership.id)).toEqual({
        success: false,
        error: 'last-administrator',
      });
    });

    it('allows an administrator to step down once another active administrator exists', async () => {
      const partner = await newPartner();
      const first = await addMember(partner.id, [ADMIN, 'list-manager']);
      await addMember(partner.id);

      expect(
        await services.memberships.updateMembership(
          first.actor,
          first.membership.id,
          { roles: ['list-manager'] },
          1,
        ),
      ).toMatchObject({ success: true });
    });

    it('lets two administrators who end each other leave at least one active', async () => {
      const partner = await newPartner();
      const first = await addMember(partner.id);
      const second = await addMember(partner.id);
      const as = (sql: Sql) =>
        createPartnerMembershipServices({ db: drizzle(sql, { schema }) }).memberships;

      const results = await runConcurrently(
        (sql) =>
          as(sql).updateMembership(first.actor, second.membership.id, { status: 'ended' }, 1),
        (sql) =>
          as(sql).updateMembership(second.actor, first.membership.id, { status: 'ended' }, 1),
      );

      expect(results.filter((result) => result.success)).toHaveLength(1);
      const statuses = [await reload(first.membership.id), await reload(second.membership.id)].map(
        (row) => row.status,
      );
      expect(statuses.filter((status) => status === 'active')).toHaveLength(1);
    });

    it('lets only one of two last administrators leave at the same time', async () => {
      const partner = await newPartner();
      const first = await addMember(partner.id);
      const second = await addMember(partner.id);
      const as = (sql: Sql) =>
        createPartnerMembershipServices({ db: drizzle(sql, { schema }) }).memberships;

      const results = await runConcurrently(
        (sql) => as(sql).leave(first.actor, first.membership.id),
        (sql) => as(sql).leave(second.actor, second.membership.id),
      );

      expect(results.filter((result) => result.success)).toHaveLength(1);
      expect(results.find((result) => !result.success)).toEqual({
        success: false,
        error: 'last-administrator',
      });
    });
  });

  describe('leave', () => {
    it('ends the member’s own membership and audits it as left by self', async () => {
      const partner = await newPartner();
      await addMember(partner.id);
      const member = await addMember(partner.id, ['report-viewer']);

      const result = await services.memberships.leave(member.actor, member.membership.id);

      expect(result).toMatchObject({
        success: true,
        data: { status: 'ended', authorizationVersion: 2 },
      });
      const [, left] = await history(member.membership.id);
      expect(left).toMatchObject({
        action: 'membership.left',
        actorKind: 'self',
        actorUserId: member.user.id,
        before: { status: 'active' },
        after: { status: 'ended' },
      });
    });

    it('lets a suspended member leave', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['report-viewer']);
      await services.memberships.updateMembership(
        admin.actor,
        member.membership.id,
        { status: 'suspended' },
        1,
      );

      expect(await services.memberships.leave(member.actor, member.membership.id)).toMatchObject({
        success: true,
      });
    });

    it('only lets members leave for themselves, and not twice', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['report-viewer']);

      expect(await services.memberships.leave(admin.actor, member.membership.id)).toEqual({
        success: false,
        error: 'forbidden',
      });
      await services.memberships.leave(member.actor, member.membership.id);
      expect(await services.memberships.leave(member.actor, member.membership.id)).toEqual({
        success: false,
        error: 'membership-ended',
      });
    });

    it('is refused while the Business Partner is not open', async () => {
      const partner = await newPartner();
      await addMember(partner.id);
      const member = await addMember(partner.id, ['report-viewer']);
      await setPartnerStatus(partner.id, 'suspended');

      expect(await services.memberships.leave(member.actor, member.membership.id)).toEqual({
        success: false,
        error: 'partner-not-open',
      });
    });
  });

  describe('listMembers', () => {
    it('lists current members with identity to administrators only', async () => {
      const partner = await newPartner();
      const admin = await addMember(partner.id);
      const member = await addMember(partner.id, ['list-manager']);
      const gone = await addMember(partner.id, ['report-viewer']);
      await services.memberships.leave(gone.actor, gone.membership.id);

      const result = await services.memberships.listMembers(admin.actor, partner.id);

      expect(result).toMatchObject({ success: true });
      if (!result.success) throw new Error(result.error);
      expect(result.data.map((row) => [row.email, row.roles, row.status])).toEqual([
        [admin.user.email, [ADMIN], 'active'],
        [member.user.email, ['list-manager'], 'active'],
      ]);
      expect(await services.memberships.listMembers(member.actor, partner.id)).toEqual({
        success: false,
        error: 'forbidden',
      });
    });
  });
});
