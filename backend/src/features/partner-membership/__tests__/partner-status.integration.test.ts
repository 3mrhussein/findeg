import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  partnerAccessHistory,
  partnerMemberships,
  users,
  type PartnerRole,
  type PartnerStatus,
} from '@findeg/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@findeg/db/schema';
import {
  connectToTestDatabase,
  runConcurrently,
  waitUntilBlocked,
  type TestDatabase,
} from '../../../testing/postgres';
import { createPartnerMembershipServices, type PartnerServices, type StaffActor } from '..';

describe('Business Partner status changes', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let unauthorized: StaffActor;
  let staffUserId: number;
  let sequence = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({ db: testDb.db });
    const [user] = await testDb.db
      .insert(users)
      .values({ email: 'status-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staffUserId = user.id;
    staff = { kind: 'staff', userId: user.id, permissionCodes: ['partners.manage'] };
    unauthorized = { kind: 'staff', userId: user.id, permissionCodes: ['admin.brands.write'] };
  });

  afterAll(async () => testDb.close());

  const history = (businessPartnerId: number) =>
    testDb.db
      .select()
      .from(partnerAccessHistory)
      .where(eq(partnerAccessHistory.businessPartnerId, businessPartnerId))
      .orderBy(partnerAccessHistory.id);

  async function createPartner() {
    sequence += 1;
    const result = await services.partners.createPartner(staff, {
      code: `status-partner-${sequence}`,
      nameEn: 'Status School',
      nameAr: 'مدرسة الحالة',
    });
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  /** Invites and accepts a member with `roles`; returns the membership id. */
  async function addMember(partnerId: number, roles: PartnerRole[]) {
    sequence += 1;
    const email = `status-member-${sequence}@findeg.test`;
    const [user] = await testDb.db.insert(users).values({ email }).returning();
    const invited = await services.invitations.invite(staff, partnerId, { email, roles });
    if (!invited.success) throw new Error(invited.error);
    const accepted = await services.memberships.acceptInvitation(invited.data.token, {
      userId: user.id,
      user: { email },
    });
    if (!accepted.success) throw new Error(accepted.error);
    return accepted.data.membership.id;
  }

  /** A partner with an active Partner Administrator, moved to `status`. */
  async function partnerIn(status: PartnerStatus) {
    const partner = await createPartner();
    await addMember(partner.id, ['partner-administrator']);
    const path: Record<PartnerStatus, PartnerStatus[]> = {
      onboarding: [],
      active: ['active'],
      suspended: ['active', 'suspended'],
      closed: ['closed'],
    };
    for (const step of path[status]) {
      const result = await services.partners.changePartnerStatus(staff, partner.id, step);
      if (!result.success) throw new Error(result.error);
    }
    return partner;
  }

  const ALL: PartnerStatus[] = ['onboarding', 'active', 'suspended', 'closed'];
  const ALLOWED: [PartnerStatus, PartnerStatus][] = [
    ['onboarding', 'active'],
    ['active', 'suspended'],
    ['suspended', 'active'],
    ['onboarding', 'closed'],
    ['active', 'closed'],
    ['suspended', 'closed'],
  ];
  const REFUSED = ALL.flatMap((from) => ALL.map((to) => [from, to] as const)).filter(
    ([from, to]) => !ALLOWED.some(([a, b]) => a === from && b === to),
  );

  it.each(ALLOWED)('allows %s -> %s and audits it as a staff change', async (from, to) => {
    const partner = await partnerIn(from);
    const before = (await history(partner.id)).length;

    const result = await services.partners.changePartnerStatus(staff, partner.id, to);

    expect(result).toMatchObject({ success: true, data: { id: partner.id, status: to } });
    const rows = await history(partner.id);
    expect(rows).toHaveLength(before + 1);
    expect(rows.at(-1)).toMatchObject({
      action: 'partner.status_changed',
      actorKind: 'staff',
      actorUserId: staffUserId,
      before: { status: from },
      after: { status: to },
    });
  });

  it.each(REFUSED)(
    'refuses %s -> %s with invalid-transition and writes nothing',
    async (from, to) => {
      const partner = await partnerIn(from);
      const before = (await history(partner.id)).length;

      const result = await services.partners.changePartnerStatus(staff, partner.id, to);

      expect(result).toEqual({ success: false, error: 'invalid-transition' });
      expect(await history(partner.id)).toHaveLength(before);
      const current = await services.partners.getPartner(staff, partner.id);
      expect(current).toMatchObject({ success: true, data: { status: from } });
    },
  );

  it('exposes exactly the allowed targets through allowedStatusChanges', () => {
    for (const from of ALL) {
      const expected = ALLOWED.filter(([a]) => a === from).map(([, to]) => to);
      expect([...services.partners.allowedStatusChanges(from)].sort()).toEqual(expected.sort());
    }
  });

  describe('activation guard', () => {
    it('refuses activation without any membership', async () => {
      const partner = await createPartner();
      expect(await services.partners.changePartnerStatus(staff, partner.id, 'active')).toEqual({
        success: false,
        error: 'last-administrator',
      });
      expect(await history(partner.id)).toHaveLength(1);
    });

    it('refuses activation when only non-administrator members exist', async () => {
      const partner = await createPartner();
      await addMember(partner.id, ['list-manager']);
      expect(await services.partners.changePartnerStatus(staff, partner.id, 'active')).toEqual({
        success: false,
        error: 'last-administrator',
      });
    });

    it('refuses activation when the administrator membership is suspended or ended', async () => {
      const partner = await createPartner();
      const membershipId = await addMember(partner.id, ['partner-administrator']);
      for (const status of ['suspended', 'ended'] as const) {
        await testDb.db
          .update(partnerMemberships)
          .set({ status })
          .where(eq(partnerMemberships.id, membershipId));
        expect(await services.partners.changePartnerStatus(staff, partner.id, 'active')).toEqual({
          success: false,
          error: 'last-administrator',
        });
      }
    });

    it('guards reactivation from suspended too', async () => {
      const partner = await partnerIn('suspended');
      await testDb.db
        .update(partnerMemberships)
        .set({ status: 'suspended' })
        .where(eq(partnerMemberships.businessPartnerId, partner.id));
      expect(await services.partners.changePartnerStatus(staff, partner.id, 'active')).toEqual({
        success: false,
        error: 'last-administrator',
      });
    });

    it('does not require an administrator to suspend or close', async () => {
      const partner = await partnerIn('active');
      await testDb.db
        .update(partnerMemberships)
        .set({ status: 'ended' })
        .where(eq(partnerMemberships.businessPartnerId, partner.id));
      expect(
        await services.partners.changePartnerStatus(staff, partner.id, 'suspended'),
      ).toMatchObject({ success: true });
      expect(
        await services.partners.changePartnerStatus(staff, partner.id, 'closed'),
      ).toMatchObject({ success: true });
    });
  });

  it('requires partners.manage', async () => {
    const partner = await partnerIn('onboarding');
    const before = (await history(partner.id)).length;
    expect(await services.partners.changePartnerStatus(unauthorized, partner.id, 'closed')).toEqual(
      { success: false, error: 'forbidden' },
    );
    expect(await history(partner.id)).toHaveLength(before);
  });

  it('returns not-found for an unknown partner', async () => {
    expect(await services.partners.changePartnerStatus(staff, 999_999_999, 'active')).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  describe('concurrency', () => {
    // Membership removal/demotion does not exist yet. Any such write path must lock the
    // partner row first (README "Adding write paths"), so it is modelled here as a
    // transaction that locks the partner row, ends the only administrator, then commits.
    it('activation queued behind removal of the last administrator is refused', async () => {
      const partner = await createPartner();
      const membershipId = await addMember(partner.id, ['partner-administrator']);
      let locked!: () => void;
      const whenLocked = new Promise<void>((resolve) => (locked = resolve));

      const [, activation] = await runConcurrently(
        async (sql, peer) => {
          await sql.begin(async (tx) => {
            await tx`select id from identity.business_partners where id = ${partner.id} for update`;
            locked();
            await waitUntilBlocked(testDb.sql, peer.pid);
            await tx`update identity.partner_memberships set status = 'ended' where id = ${membershipId}`;
          });
        },
        async (sql) => {
          await whenLocked;
          return createPartnerMembershipServices({
            db: drizzle(sql, { schema }),
          }).partners.changePartnerStatus(staff, partner.id, 'active');
        },
      );

      expect(activation).toEqual({ success: false, error: 'last-administrator' });
      const current = await services.partners.getPartner(staff, partner.id);
      expect(current).toMatchObject({ success: true, data: { status: 'onboarding' } });
    });
  });
});
