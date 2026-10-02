import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { Sql } from 'postgres';
import * as schema from '@findeg/db/schema';
import {
  businessPartners,
  partnerAccessHistory,
  partnerInvitations,
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
  type PartnerRole,
  type PartnerServices,
  type PartnerSession,
  type StaffActor,
} from '..';

const DAY = 24 * 60 * 60 * 1000;

describe('Partner Invitation acceptance', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let now = new Date('2026-10-02T09:00:00Z');
  let sequence = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({ db: testDb.db, clock: () => now });
    const [staffUser] = await testDb.db
      .insert(users)
      .values({ email: 'acceptance-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staff = { kind: 'staff', userId: staffUser.id, permissionCodes: ['partners.manage'] };
  });

  afterAll(async () => testDb.close());

  async function fixture(
    roles: PartnerRole[] = ['partner-administrator'],
    requestedEmail?: string,
  ) {
    sequence += 1;
    const email = requestedEmail ?? `invitee-${sequence}@findeg.test`;
    const partnerResult = await services.partners.createPartner(staff, {
      code: `acceptance-partner-${sequence}`,
      nameEn: 'Acceptance School',
      nameAr: 'مدرسة القبول',
    });
    if (!partnerResult.success) throw new Error(partnerResult.error);
    const [user] = await testDb.db.insert(users).values({ email }).returning();
    const invitationResult = await services.invitations.invite(staff, partnerResult.data.id, {
      email,
      roles,
    });
    if (!invitationResult.success) throw new Error(invitationResult.error);
    const session: PartnerSession = { userId: user.id, user: { email: user.email } };
    return { partner: partnerResult.data, user, session, ...invitationResult.data };
  }

  it('atomically creates the membership, accepts the invitation, verifies email and audits', async () => {
    const { partner, user, invitation, token, session } = await fixture([
      'list-manager',
      'report-viewer',
    ]);

    const result = await services.memberships.acceptInvitation(token, session);

    expect(result).toMatchObject({
      success: true,
      data: {
        partner: { id: partner.id, code: partner.code },
        membership: {
          businessPartnerId: partner.id,
          userId: user.id,
          invitationId: invitation.id,
          roles: ['list-manager', 'report-viewer'],
          status: 'active',
          authorizationVersion: 1,
        },
      },
    });
    expect(
      (await testDb.db.select().from(users).where(eq(users.id, user.id)))[0].emailVerified,
    ).toEqual(now);
    expect(
      (
        await testDb.db
          .select()
          .from(partnerInvitations)
          .where(eq(partnerInvitations.id, invitation.id))
      )[0].status,
    ).toBe('accepted');
    expect(
      (
        await testDb.db
          .select()
          .from(partnerAccessHistory)
          .where(eq(partnerAccessHistory.businessPartnerId, partner.id))
      ).map((row) => row.action),
    ).toEqual(['partner.created', 'invitation.issued', 'membership.accepted']);
  });

  it('preserves an existing email verification timestamp', async () => {
    const verifiedAt = new Date('2025-01-01T00:00:00Z');
    const item = await fixture();
    await testDb.db
      .update(users)
      .set({ emailVerified: verifiedAt })
      .where(eq(users.id, item.user.id));
    await services.memberships.acceptInvitation(item.token, item.session);
    const [user] = await testDb.db.select().from(users).where(eq(users.id, item.user.id));
    expect(user.emailVerified).toEqual(verifiedAt);
  });

  it('requires a signed-in matching email after normalization', async () => {
    const item = await fixture(['list-manager'], 'Case.Match@findeg.test');
    expect(await services.memberships.acceptInvitation(item.token, null)).toEqual({
      success: false,
      error: 'not-authenticated',
    });
    expect(
      await services.memberships.acceptInvitation(item.token, {
        ...item.session,
        user: { email: 'someone-else@findeg.test' },
      }),
    ).toEqual({ success: false, error: 'email-mismatch' });
    expect(
      await services.memberships.acceptInvitation(item.token, {
        ...item.session,
        user: { email: '  CASE.MATCH@FINDEG.TEST ' },
      }),
    ).toMatchObject({ success: true });
  });

  it('requires a known pending, unexpired invitation', async () => {
    const expired = await fixture();
    now = new Date(now.getTime() + 7 * DAY);
    expect(await services.memberships.acceptInvitation(expired.token, expired.session)).toEqual({
      success: false,
      error: 'invitation-expired',
    });
    now = new Date(now.getTime() - 7 * DAY);

    const revoked = await fixture();
    await services.invitations.revokeInvitation(staff, revoked.invitation.id);
    expect(await services.memberships.acceptInvitation(revoked.token, revoked.session)).toEqual({
      success: false,
      error: 'invitation-not-pending',
    });
    expect(await services.memberships.acceptInvitation('unknown', revoked.session)).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it.each(['suspended', 'closed'] as const)('refuses a %s Business Partner', async (status) => {
    const item = await fixture();
    await testDb.db
      .update(businessPartners)
      .set({ status })
      .where(eq(businessPartners.id, item.partner.id));
    expect(await services.memberships.acceptInvitation(item.token, item.session)).toEqual({
      success: false,
      error: 'partner-not-open',
    });
  });

  it('accepts an invitation while the Business Partner is active', async () => {
    const item = await fixture();
    await testDb.db
      .update(businessPartners)
      .set({ status: 'active' })
      .where(eq(businessPartners.id, item.partner.id));
    expect(await services.memberships.acceptInvitation(item.token, item.session)).toMatchObject({
      success: true,
    });
  });

  it('does not verify a changed account email from a stale signed session', async () => {
    const item = await fixture();
    await testDb.db
      .update(users)
      .set({ email: `changed-${item.user.email}` })
      .where(eq(users.id, item.user.id));
    expect(await services.memberships.acceptInvitation(item.token, item.session)).toEqual({
      success: false,
      error: 'email-mismatch',
    });
  });

  it('rejects an existing non-ended membership', async () => {
    const item = await fixture();
    await services.memberships.acceptInvitation(item.token, item.session);
    const second = await services.invitations.invite(staff, item.partner.id, {
      email: item.user.email,
      roles: ['report-viewer'],
    });
    if (!second.success) throw new Error(second.error);
    expect(await services.memberships.acceptInvitation(second.data.token, item.session)).toEqual({
      success: false,
      error: 'already-member',
    });
  });

  it('creates a fresh membership when a previously ended member is re-invited', async () => {
    const item = await fixture();
    const first = await services.memberships.acceptInvitation(item.token, item.session);
    if (!first.success) throw new Error(first.error);
    await testDb.db
      .update(partnerMemberships)
      .set({ status: 'ended' })
      .where(eq(partnerMemberships.id, first.data.membership.id));
    const secondInvitation = await services.invitations.invite(staff, item.partner.id, {
      email: item.user.email,
      roles: ['report-viewer'],
    });
    if (!secondInvitation.success) throw new Error(secondInvitation.error);

    const second = await services.memberships.acceptInvitation(
      secondInvitation.data.token,
      item.session,
    );
    expect(second).toMatchObject({
      success: true,
      data: { membership: { roles: ['report-viewer'] } },
    });
    if (!second.success) throw new Error(second.error);
    expect(second.data.membership.id).not.toBe(first.data.membership.id);
  });

  it('prevents deleting the user behind a membership', async () => {
    const item = await fixture();
    const accepted = await services.memberships.acceptInvitation(item.token, item.session);
    if (!accepted.success) throw new Error(accepted.error);

    await expect(testDb.db.delete(users).where(eq(users.id, item.user.id))).rejects.toThrow();
    expect(
      await services.memberships.resolvePartnerContext(item.session, item.partner.code),
    ).toMatchObject({
      success: true,
    });
  });

  it('resolves active membership context, suspended for suspended members, otherwise not-found', async () => {
    const item = await fixture();
    expect(
      await services.memberships.resolvePartnerContext(item.session, item.partner.code),
    ).toEqual({
      success: false,
      error: 'not-found',
    });
    const accepted = await services.memberships.acceptInvitation(item.token, item.session);
    if (!accepted.success) throw new Error(accepted.error);
    expect(
      await services.memberships.resolvePartnerContext(item.session, item.partner.code),
    ).toMatchObject({
      success: true,
      data: { partner: { code: item.partner.code }, membership: { status: 'active' } },
    });
    expect(await services.memberships.resolvePartnerContext(null, item.partner.code)).toEqual({
      success: false,
      error: 'not-found',
    });
    await testDb.db
      .update(partnerMemberships)
      .set({ status: 'suspended' })
      .where(eq(partnerMemberships.id, accepted.data.membership.id));
    expect(
      await services.memberships.resolvePartnerContext(item.session, item.partner.code),
    ).toEqual({
      success: false,
      error: 'suspended',
    });
  });

  it('revalidates account state on every request after acceptance', async () => {
    const item = await fixture();
    const accepted = await services.memberships.acceptInvitation(item.token, item.session);
    if (!accepted.success) throw new Error(accepted.error);
    const resolve = (session: PartnerSession) =>
      services.memberships.resolvePartnerContext(session, item.partner.code);

    expect(
      await resolve({ ...item.session, tokenVersion: item.user.authorizationVersion }),
    ).toMatchObject({
      success: true,
    });
    expect(
      await resolve({ ...item.session, tokenVersion: item.user.authorizationVersion + 1 }),
    ).toEqual({
      success: false,
      error: 'not-found',
    });

    await testDb.db.update(users).set({ isActive: false }).where(eq(users.id, item.user.id));
    expect(await resolve(item.session)).toEqual({ success: false, error: 'not-found' });
  });

  it('rejects acceptance by a deactivated user', async () => {
    const item = await fixture();
    await testDb.db.update(users).set({ isActive: false }).where(eq(users.id, item.user.id));
    expect(await services.memberships.acceptInvitation(item.token, item.session)).toEqual({
      success: false,
      error: 'not-authenticated',
    });
  });

  it('serializes two concurrent accepts to exactly one membership', async () => {
    const item = await fixture();
    const accept = () => async (sql: Sql) =>
      createPartnerMembershipServices({
        db: drizzle(sql, { schema }),
        clock: () => now,
      }).memberships.acceptInvitation(item.token, item.session);
    const results = await runConcurrently(accept(), accept());

    expect(results.filter((result) => result.success)).toHaveLength(1);
    expect(results.filter((result) => !result.success)).toEqual([
      { success: false, error: 'invitation-not-pending' },
    ]);
    expect(
      await testDb.db
        .select()
        .from(partnerMemberships)
        .where(eq(partnerMemberships.invitationId, item.invitation.id)),
    ).toHaveLength(1);
  });

  it('serializes accept against revoke so exactly one outcome wins consistently', async () => {
    const item = await fixture();
    const [accept, revoke] = await runConcurrently(
      async (sql: Sql) =>
        createPartnerMembershipServices({
          db: drizzle(sql, { schema }),
          clock: () => now,
        }).memberships.acceptInvitation(item.token, item.session),
      async (sql: Sql) =>
        createPartnerMembershipServices({
          db: drizzle(sql, { schema }),
          clock: () => now,
        }).invitations.revokeInvitation(staff, item.invitation.id),
    );
    expect([accept.success, revoke.success].filter(Boolean)).toHaveLength(1);
    const [invitation] = await testDb.db
      .select()
      .from(partnerInvitations)
      .where(eq(partnerInvitations.id, item.invitation.id));
    const memberships = await testDb.db
      .select()
      .from(partnerMemberships)
      .where(eq(partnerMemberships.invitationId, item.invitation.id));
    expect(invitation.status === 'accepted' ? memberships.length : 0).toBe(memberships.length);
    expect(invitation.status === 'revoked' ? memberships.length : 0).toBe(0);
  });
});
