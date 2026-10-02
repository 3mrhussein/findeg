import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { asc, eq } from 'drizzle-orm';
import { businessPartners, partnerAccessHistory, users } from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createPartnerMembershipServices,
  type PartnerActor,
  type PartnerRole,
  type PartnerServices,
  type StaffActor,
} from '..';

describe('Partner Invitations by a Partner Administrator', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let sequence = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({ db: testDb.db });
    const [staffUser] = await testDb.db
      .insert(users)
      .values({ email: 'partner-invitations-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staff = { kind: 'staff', userId: staffUser.id, permissionCodes: ['partners.manage'] };
  });

  afterAll(async () => testDb.close());

  async function newPartner() {
    sequence += 1;
    const created = await services.partners.createPartner(staff, {
      code: `partner-invitations-${sequence}`,
      nameEn: 'Invitation School',
      nameAr: 'مدرسة الدعوات',
    });
    if (!created.success) throw new Error(created.error);
    return created.data;
  }

  async function addMember(partnerId: number, roles: PartnerRole[]) {
    sequence += 1;
    const email = `invitation-member-${sequence}@findeg.test`;
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

  const setStatus = (partnerId: number, status: 'active' | 'suspended' | 'closed') =>
    testDb.db.update(businessPartners).set({ status }).where(eq(businessPartners.id, partnerId));

  const history = (partnerId: number) =>
    testDb.db
      .select()
      .from(partnerAccessHistory)
      .where(eq(partnerAccessHistory.businessPartnerId, partnerId))
      .orderBy(asc(partnerAccessHistory.id));

  it('lets an administrator invite, resend and revoke, audited as a partner actor', async () => {
    const partner = await newPartner();
    const admin = await addMember(partner.id, ['partner-administrator']);

    const invited = await services.invitations.invite(admin.actor, partner.id, {
      email: 'New.Colleague@findeg.test',
      roles: ['list-manager'],
    });
    expect(invited).toMatchObject({
      success: true,
      data: { invitation: { email: 'new.colleague@findeg.test', roles: ['list-manager'] } },
    });
    if (!invited.success) throw new Error(invited.error);
    const id = invited.data.invitation.id;

    expect(await services.invitations.resendInvitation(admin.actor, id)).toMatchObject({
      success: true,
    });
    expect(
      await services.invitations.listPendingInvitations(admin.actor, partner.id),
    ).toMatchObject({
      success: true,
      data: [{ id }],
    });
    expect(await services.invitations.revokeInvitation(admin.actor, id)).toMatchObject({
      success: true,
      data: { status: 'revoked' },
    });

    const rows = (await history(partner.id)).filter((row) => row.invitationId === id);
    expect(rows.map((row) => [row.action, row.actorKind, row.actorUserId])).toEqual([
      ['invitation.issued', 'partner', admin.user.id],
      ['invitation.resent', 'partner', admin.user.id],
      ['invitation.revoked', 'partner', admin.user.id],
    ]);
  });

  it('refuses members without partner-administrator, other partners’ administrators, and suspended administrators', async () => {
    const partner = await newPartner();
    const admin = await addMember(partner.id, ['partner-administrator']);
    const lister = await addMember(partner.id, ['list-manager', 'report-viewer']);
    const otherAdmin = await addMember((await newPartner()).id, ['partner-administrator']);
    const suspended = await addMember(partner.id, ['partner-administrator']);
    await services.memberships.updateMembership(
      admin.actor,
      suspended.membership.id,
      { status: 'suspended' },
      1,
    );
    const pending = await services.invitations.invite(admin.actor, partner.id, {
      email: 'pending@findeg.test',
      roles: ['report-viewer'],
    });
    if (!pending.success) throw new Error(pending.error);
    const pendingId = pending.data.invitation.id;

    for (const actor of [lister.actor, otherAdmin.actor, suspended.actor]) {
      const forbidden = { success: false, error: 'forbidden' };
      expect(
        await services.invitations.invite(actor, partner.id, {
          email: 'x@findeg.test',
          roles: ['list-manager'],
        }),
      ).toEqual(forbidden);
      expect(await services.invitations.resendInvitation(actor, pendingId)).toEqual(forbidden);
      expect(await services.invitations.revokeInvitation(actor, pendingId)).toEqual(forbidden);
      expect(await services.invitations.listPendingInvitations(actor, partner.id)).toEqual(
        forbidden,
      );
    }
    expect(
      await services.invitations.listPendingInvitations(admin.actor, partner.id),
    ).toMatchObject({
      success: true,
      data: [{ id: pendingId, status: 'pending' }],
    });
  });

  it('does not reveal whether a partner or invitation exists to a partner actor', async () => {
    const partner = await newPartner();
    const admin = await addMember(partner.id, ['partner-administrator']);
    const forbidden = { success: false, error: 'forbidden' };

    expect(
      await services.invitations.invite(admin.actor, 0, {
        email: 'x@findeg.test',
        roles: ['list-manager'],
      }),
    ).toEqual(forbidden);
    expect(await services.invitations.resendInvitation(admin.actor, 0)).toEqual(forbidden);
    expect(await services.invitations.revokeInvitation(admin.actor, 0)).toEqual(forbidden);
  });

  it('returns already-member for an email with an active or suspended membership, whoever invites', async () => {
    const partner = await newPartner();
    const admin = await addMember(partner.id, ['partner-administrator']);
    const active = await addMember(partner.id, ['list-manager']);
    const suspended = await addMember(partner.id, ['report-viewer']);
    await services.memberships.updateMembership(
      admin.actor,
      suspended.membership.id,
      { status: 'suspended' },
      1,
    );

    for (const member of [active, suspended]) {
      const input = {
        email: member.user.email.toUpperCase(),
        roles: ['collection-staff' as const],
      };
      expect(await services.invitations.invite(admin.actor, partner.id, input)).toEqual({
        success: false,
        error: 'already-member',
      });
      expect(await services.invitations.invite(staff, partner.id, input)).toEqual({
        success: false,
        error: 'already-member',
      });
    }
  });

  it('allows inviting someone whose membership has ended', async () => {
    const partner = await newPartner();
    const admin = await addMember(partner.id, ['partner-administrator']);
    const former = await addMember(partner.id, ['list-manager']);
    await services.memberships.leave(former.actor, former.membership.id);

    expect(
      await services.invitations.invite(admin.actor, partner.id, {
        email: former.user.email,
        roles: ['list-manager'],
      }),
    ).toMatchObject({ success: true });
  });

  it('requires at least one valid role', async () => {
    const partner = await newPartner();
    const admin = await addMember(partner.id, ['partner-administrator']);

    expect(
      await services.invitations.invite(admin.actor, partner.id, {
        email: 'x@findeg.test',
        roles: [],
      }),
    ).toEqual({ success: false, error: 'invalid-input' });
  });

  it.each(['suspended', 'closed'] as const)(
    'refuses invite, resend and revoke while the Business Partner is %s',
    async (status) => {
      const partner = await newPartner();
      const admin = await addMember(partner.id, ['partner-administrator']);
      const pending = await services.invitations.invite(admin.actor, partner.id, {
        email: 'pending@findeg.test',
        roles: ['report-viewer'],
      });
      if (!pending.success) throw new Error(pending.error);
      await setStatus(partner.id, status);

      const refused = { success: false, error: 'partner-not-open' };
      expect(
        await services.invitations.invite(admin.actor, partner.id, {
          email: 'y@findeg.test',
          roles: ['list-manager'],
        }),
      ).toEqual(refused);
      expect(
        await services.invitations.resendInvitation(admin.actor, pending.data.invitation.id),
      ).toEqual(refused);
      expect(
        await services.invitations.revokeInvitation(admin.actor, pending.data.invitation.id),
      ).toEqual(refused);
    },
  );

  it('allows invitations while the Business Partner is active', async () => {
    const partner = await newPartner();
    const admin = await addMember(partner.id, ['partner-administrator']);
    await setStatus(partner.id, 'active');

    expect(
      await services.invitations.invite(admin.actor, partner.id, {
        email: 'z@findeg.test',
        roles: ['list-manager'],
      }),
    ).toMatchObject({ success: true });
  });
});
