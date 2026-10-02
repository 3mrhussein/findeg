import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { Sql } from 'postgres';
import * as schema from '@findeg/db/schema';
import {
  businessPartners,
  partnerAccessHistory,
  partnerInvitations,
  partnerInvitationTokens,
  users,
} from '@findeg/db/schema';
import {
  connectToTestDatabase,
  runConcurrently,
  type TestDatabase,
} from '../../../testing/postgres';
import {
  createPartnerMembershipServices,
  type PartnerServices,
  type PartnerInvitationMessage,
  type PartnerRole,
  type StaffActor,
} from '..';

const DAY = 24 * 60 * 60 * 1000;

describe('Partner Invitations (Staff operations)', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let unauthorized: StaffActor;
  let now = new Date('2026-10-01T09:00:00Z');
  const sent: { message: PartnerInvitationMessage; token: string }[] = [];
  let seq = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({
      db: testDb.db,
      clock: () => now,
      enqueue: (message, { token }) => {
        sent.push({ message, token });
      },
    });
    const [user] = await testDb.db
      .insert(users)
      .values({ email: 'invitations-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staff = { kind: 'staff', userId: user.id, permissionCodes: ['partners.manage'] };
    unauthorized = { kind: 'staff', userId: user.id, permissionCodes: [] };
  });

  afterAll(async () => {
    await testDb.close();
  });

  const newPartner = async () => {
    const result = await services.partners.createPartner(staff, {
      code: `inv-school-${++seq}`,
      nameEn: 'Inv School',
      nameAr: 'مدرسة',
    });
    if (!result.success) throw new Error(result.error);
    return result.data;
  };

  const setStatus = (id: number, status: 'active' | 'suspended' | 'closed') =>
    testDb.db.update(businessPartners).set({ status }).where(eq(businessPartners.id, id));

  const invite = async (
    partnerId: number,
    email = 'head@school.eg',
    roles: PartnerRole[] = ['partner-administrator'],
  ) => {
    const result = await services.invitations.invite(staff, partnerId, { email, roles });
    if (!result.success) throw new Error(result.error);
    return result.data;
  };

  const pending = async (partnerId: number) => {
    const result = await services.invitations.listPendingInvitations(staff, partnerId);
    if (!result.success) throw new Error(result.error);
    return result.data;
  };

  const actionsFor = async (partnerId: number) =>
    (
      await testDb.db
        .select()
        .from(partnerAccessHistory)
        .where(eq(partnerAccessHistory.businessPartnerId, partnerId))
        .orderBy(partnerAccessHistory.id)
    ).map((row) => row.action);

  describe('invite', () => {
    it('creates a pending invitation with a 7-day expiry, a token, and an enqueue', async () => {
      const partner = await newPartner();
      sent.length = 0;
      const { invitation, token } = await invite(partner.id);

      expect(invitation).toMatchObject({
        businessPartnerId: partner.id,
        email: 'head@school.eg',
        roles: ['partner-administrator'],
        status: 'pending',
        expiresAt: new Date(now.getTime() + 7 * DAY),
      });
      expect(sent).toEqual([
        { message: { kind: 'partner-invitation', invitationId: invitation.id }, token },
      ]);
      expect(await pending(partner.id)).toHaveLength(1);
      expect(await actionsFor(partner.id)).toEqual(['partner.created', 'invitation.issued']);
    });

    it('stores only token digests, never the raw token', async () => {
      const partner = await newPartner();
      const { invitation, token } = await invite(partner.id);

      const rows = await testDb.db
        .select()
        .from(partnerInvitationTokens)
        .where(eq(partnerInvitationTokens.invitationId, invitation.id));
      expect(rows).toHaveLength(1);
      expect(rows[0].tokenDigest).not.toContain(token);
      expect(rows[0].tokenDigest).toMatch(/^[0-9a-f]{64}$/);
    });

    it('trims and lowercases the email', async () => {
      const partner = await newPartner();
      const { invitation } = await invite(partner.id, '  Head@School.EG ');
      expect(invitation.email).toBe('head@school.eg');
    });

    it('rejects an empty role list and writes nothing', async () => {
      const partner = await newPartner();
      const result = await services.invitations.invite(staff, partner.id, {
        email: 'a@school.eg',
        roles: [],
      });
      expect(result).toEqual({ success: false, error: 'invalid-input' });
      expect(await pending(partner.id)).toHaveLength(0);
      expect(await actionsFor(partner.id)).toEqual(['partner.created']);
    });

    it('rejects an invalid email and unknown roles', async () => {
      const partner = await newPartner();
      expect(
        await services.invitations.invite(staff, partner.id, {
          email: 'nope',
          roles: ['list-manager'],
        }),
      ).toEqual({ success: false, error: 'invalid-input' });
      expect(
        await services.invitations.invite(staff, partner.id, {
          email: 'a@school.eg',
          roles: ['root' as never],
        }),
      ).toEqual({ success: false, error: 'invalid-input' });
    });

    it('replaces a pending invitation for the same email, revoking the old one', async () => {
      const partner = await newPartner();
      const first = await invite(partner.id, 'x@school.eg', ['list-manager']);
      const second = await invite(partner.id, ' X@school.eg ', ['report-viewer']);

      const list = await pending(partner.id);
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({ id: second.invitation.id, roles: ['report-viewer'] });

      const view = await services.invitations.getInvitation(first.token);
      expect(view).toMatchObject({ success: true, data: { state: 'revoked' } });
      expect(await actionsFor(partner.id)).toEqual([
        'partner.created',
        'invitation.issued',
        'invitation.revoked',
        'invitation.issued',
      ]);
    });

    it('keeps invitations for different emails side by side', async () => {
      const partner = await newPartner();
      await invite(partner.id, 'a@school.eg');
      await invite(partner.id, 'b@school.eg');
      expect(await pending(partner.id)).toHaveLength(2);
    });

    it('refuses actors without partners.manage', async () => {
      const partner = await newPartner();
      const result = await services.invitations.invite(unauthorized, partner.id, {
        email: 'a@school.eg',
        roles: ['list-manager'],
      });
      expect(result).toEqual({ success: false, error: 'forbidden' });
      expect(await pending(partner.id)).toHaveLength(0);
    });

    it('returns not-found for an unknown partner', async () => {
      const result = await services.invitations.invite(staff, 999_999, {
        email: 'a@school.eg',
        roles: ['list-manager'],
      });
      expect(result).toEqual({ success: false, error: 'not-found' });
    });

    it.each(['suspended', 'closed'] as const)(
      'is refused while the partner is %s',
      async (status) => {
        const partner = await newPartner();
        await setStatus(partner.id, status);
        const result = await services.invitations.invite(staff, partner.id, {
          email: 'a@school.eg',
          roles: ['list-manager'],
        });
        expect(result).toEqual({ success: false, error: 'partner-not-open' });
        expect(await actionsFor(partner.id)).toEqual(['partner.created']);
      },
    );

    it('is allowed while the partner is active', async () => {
      const partner = await newPartner();
      await setStatus(partner.id, 'active');
      await invite(partner.id);
    });

    it('leaves exactly one pending invitation when two invites race on separate connections', async () => {
      const partner = await newPartner();
      const inviteAs = (roles: ['list-manager'] | ['report-viewer']) => async (sql: Sql) => {
        const racing = createPartnerMembershipServices({
          db: drizzle(sql, { schema }),
          clock: () => now,
        });
        return racing.invitations.invite(staff, partner.id, { email: 'race@school.eg', roles });
      };
      const results = await runConcurrently(
        inviteAs(['list-manager']),
        inviteAs(['report-viewer']),
      );

      expect(results.every((result) => result.success)).toBe(true);
      const all = await testDb.db
        .select()
        .from(partnerInvitations)
        .where(
          and(
            eq(partnerInvitations.businessPartnerId, partner.id),
            eq(partnerInvitations.email, 'race@school.eg'),
          ),
        );
      expect(all.map((row) => row.status).sort()).toEqual(['pending', 'revoked']);
      expect(await pending(partner.id)).toHaveLength(1);
    });
  });

  describe('resendInvitation', () => {
    it('keeps the invitation, resets expiry, adds a token, and earlier tokens stay valid', async () => {
      const partner = await newPartner();
      const first = await invite(partner.id);
      now = new Date(now.getTime() + 3 * DAY);
      sent.length = 0;

      const result = await services.invitations.resendInvitation(staff, first.invitation.id);
      if (!result.success) throw new Error(result.error);

      expect(result.data.invitation.id).toBe(first.invitation.id);
      expect(result.data.invitation.expiresAt).toEqual(new Date(now.getTime() + 7 * DAY));
      expect(result.data.token).not.toBe(first.token);
      expect(sent).toHaveLength(1);
      expect(sent[0].message.invitationId).toBe(first.invitation.id);

      for (const token of [first.token, result.data.token]) {
        expect(await services.invitations.getInvitation(token)).toMatchObject({
          success: true,
          data: { state: 'pending', email: 'head@school.eg' },
        });
      }
      expect(await actionsFor(partner.id)).toEqual([
        'partner.created',
        'invitation.issued',
        'invitation.resent',
      ]);
    });

    it('can revive an expired pending invitation', async () => {
      const partner = await newPartner();
      const { invitation, token } = await invite(partner.id);
      now = new Date(now.getTime() + 8 * DAY);
      expect(await services.invitations.getInvitation(token)).toMatchObject({
        data: { state: 'expired' },
      });

      await services.invitations.resendInvitation(staff, invitation.id);
      expect(await services.invitations.getInvitation(token)).toMatchObject({
        data: { state: 'pending' },
      });
    });

    it('refuses a revoked invitation', async () => {
      const partner = await newPartner();
      const { invitation } = await invite(partner.id);
      await services.invitations.revokeInvitation(staff, invitation.id);
      expect(await services.invitations.resendInvitation(staff, invitation.id)).toEqual({
        success: false,
        error: 'invitation-not-pending',
      });
    });

    it('refuses unauthorized actors, unknown invitations and unopen partners', async () => {
      const partner = await newPartner();
      const { invitation } = await invite(partner.id);
      expect(await services.invitations.resendInvitation(unauthorized, invitation.id)).toEqual({
        success: false,
        error: 'forbidden',
      });
      expect(await services.invitations.resendInvitation(staff, 999_999)).toEqual({
        success: false,
        error: 'not-found',
      });
      await setStatus(partner.id, 'suspended');
      expect(await services.invitations.resendInvitation(staff, invitation.id)).toEqual({
        success: false,
        error: 'partner-not-open',
      });
    });
  });

  describe('revokeInvitation', () => {
    it('revokes the invitation, invalidating all its tokens, and audits it', async () => {
      const partner = await newPartner();
      const first = await invite(partner.id);
      const resent = await services.invitations.resendInvitation(staff, first.invitation.id);
      if (!resent.success) throw new Error(resent.error);

      const result = await services.invitations.revokeInvitation(staff, first.invitation.id);
      expect(result).toMatchObject({ success: true, data: { status: 'revoked' } });

      for (const token of [first.token, resent.data.token]) {
        expect(await services.invitations.getInvitation(token)).toMatchObject({
          data: { state: 'revoked' },
        });
      }
      expect(await pending(partner.id)).toHaveLength(0);
      expect((await actionsFor(partner.id)).at(-1)).toBe('invitation.revoked');
    });

    it('refuses an already revoked invitation and writes no audit row', async () => {
      const partner = await newPartner();
      const { invitation } = await invite(partner.id);
      await services.invitations.revokeInvitation(staff, invitation.id);
      const before = await actionsFor(partner.id);

      expect(await services.invitations.revokeInvitation(staff, invitation.id)).toEqual({
        success: false,
        error: 'invitation-not-pending',
      });
      expect(await actionsFor(partner.id)).toEqual(before);
    });

    it('is refused while the partner is closed', async () => {
      const partner = await newPartner();
      const { invitation } = await invite(partner.id);
      await setStatus(partner.id, 'closed');
      expect(await services.invitations.revokeInvitation(staff, invitation.id)).toEqual({
        success: false,
        error: 'partner-not-open',
      });
    });

    it('refuses actors without partners.manage', async () => {
      const partner = await newPartner();
      const { invitation } = await invite(partner.id);
      expect(await services.invitations.revokeInvitation(unauthorized, invitation.id)).toEqual({
        success: false,
        error: 'forbidden',
      });
    });
  });

  describe('getInvitation', () => {
    it('returns the partner, roles, expiry and state, read-only', async () => {
      const partner = await newPartner();
      const { token } = await invite(partner.id, 'v@school.eg', ['list-manager', 'report-viewer']);
      const before = await actionsFor(partner.id);

      const result = await services.invitations.getInvitation(token);
      expect(result).toEqual({
        success: true,
        data: {
          partner: { code: partner.code, nameEn: 'Inv School', nameAr: 'مدرسة' },
          email: 'v@school.eg',
          roles: ['list-manager', 'report-viewer'],
          expiresAt: new Date(now.getTime() + 7 * DAY),
          state: 'pending',
        },
      });
      expect(await actionsFor(partner.id)).toEqual(before);
    });

    it('reports expiry from the injected clock', async () => {
      const partner = await newPartner();
      const { token } = await invite(partner.id);
      now = new Date(now.getTime() + 7 * DAY - 1);
      expect(await services.invitations.getInvitation(token)).toMatchObject({
        data: { state: 'pending' },
      });
      now = new Date(now.getTime() + 1);
      expect(await services.invitations.getInvitation(token)).toMatchObject({
        data: { state: 'expired' },
      });
    });

    it('returns not-found for an unknown token', async () => {
      expect(await services.invitations.getInvitation('nope')).toEqual({
        success: false,
        error: 'not-found',
      });
    });
  });
});
