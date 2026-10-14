import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import * as q from '@findeg/db/queries/partners';
import { MembershipService } from '../index';

vi.mock('@findeg/db/queries/partners', () => ({
  countOtherActivePartnerAdministrators: vi.fn(),
  getBusinessPartnerByCode: vi.fn(),
  getCurrentPartnerMembership: vi.fn(),
  getPartnerInvitationByTokenDigest: vi.fn(),
  getPartnerMembershipById: vi.fn(),
  getPartnerUserById: vi.fn(),
  insertPartnerAccessHistory: vi.fn(),
  insertPartnerMembership: vi.fn(),
  listActivePartnerMembershipsForUser: vi.fn(),
  listCurrentPartnerMembers: vi.fn(),
  lockBusinessPartnerById: vi.fn(),
  setPartnerInvitationStatus: vi.fn(),
  updatePartnerMembership: vi.fn(),
  verifyUserEmailIfUnset: vi.fn(),
}));

const NOW = new Date('2026-10-14T10:00:00Z');
const mq = vi.mocked(q);
const executor = { transaction: (run: (tx: unknown) => unknown) => run(executor) };
const partner = { id: 5, code: 'sch-100', nameEn: 'Nile', nameAr: 'النيل', status: 'active' };
const staff = {
  kind: 'staff' as const,
  userId: 1,
  permissionCodes: [PERMISSION_CODES.PARTNERS_MANAGE],
};
const admin = { kind: 'partner' as const, userId: 7 };
const session = { userId: 7, user: { email: 'admin@example.com' }, tokenVersion: 3 };

function membership(overrides: Record<string, unknown> = {}) {
  return {
    id: 20,
    businessPartnerId: 5,
    userId: 7,
    invitationId: 11,
    roles: ['partner-administrator'],
    status: 'active',
    authorizationVersion: 2,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

const token = 'raw-invite-token';
const invitation = {
  id: 11,
  businessPartnerId: 5,
  email: 'admin@example.com',
  roles: ['partner-administrator'],
  status: 'pending',
  expiresAt: new Date('2026-10-30T00:00:00Z'),
  createdAt: NOW,
};

const service = () =>
  new MembershipService(
    () => Promise.resolve().then(() => executor as never),
    () => NOW,
  );

beforeEach(() => {
  vi.resetAllMocks();
  mq.insertPartnerAccessHistory.mockResolvedValue(undefined);
  mq.lockBusinessPartnerById.mockResolvedValue(partner as never);
  mq.getPartnerUserById.mockResolvedValue({
    id: 7,
    email: 'admin@example.com',
    isActive: true,
    authorizationVersion: 3,
  });
  mq.getCurrentPartnerMembership.mockResolvedValue(undefined);
  mq.getPartnerMembershipById.mockResolvedValue(membership() as never);
  mq.countOtherActivePartnerAdministrators.mockResolvedValue(1);
  mq.updatePartnerMembership.mockImplementation((_tx, _id, patch) =>
    Promise.resolve().then(() => membership({ ...patch, authorizationVersion: 3 }) as never),
  );
});

describe('acceptInvitation', () => {
  it('needs a signed-in session', async () => {
    expect(await service().acceptInvitation(token, null)).toEqual({
      success: false,
      error: 'not-authenticated',
    });
  });

  it('reports not-found for an unknown token, before and after the lock', async () => {
    mq.getPartnerInvitationByTokenDigest.mockResolvedValueOnce(undefined);
    expect(await service().acceptInvitation(token, session)).toEqual({
      success: false,
      error: 'not-found',
    });
    mq.getPartnerInvitationByTokenDigest
      .mockResolvedValueOnce(invitation as never)
      .mockResolvedValueOnce(undefined);
    expect(await service().acceptInvitation(token, session)).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('reports not-found when the partner is gone and invitation-not-pending when it was revoked meanwhile', async () => {
    mq.getPartnerInvitationByTokenDigest.mockResolvedValue(invitation as never);
    mq.lockBusinessPartnerById.mockResolvedValueOnce(undefined);
    expect(await service().acceptInvitation(token, session)).toEqual({
      success: false,
      error: 'not-found',
    });
    mq.getPartnerInvitationByTokenDigest
      .mockResolvedValueOnce(invitation as never)
      .mockResolvedValueOnce(invitation as never)
      .mockResolvedValueOnce(undefined);
    expect(await service().acceptInvitation(token, session)).toEqual({
      success: false,
      error: 'invitation-not-pending',
    });
  });

  it('refuses an inactive account', async () => {
    mq.getPartnerInvitationByTokenDigest.mockResolvedValue(invitation as never);
    mq.getPartnerUserById.mockResolvedValue({ isActive: false } as never);
    expect(await service().acceptInvitation(token, session)).toEqual({
      success: false,
      error: 'not-authenticated',
    });
  });

  it('maps a domain refusal (partner not open) to its application error', async () => {
    mq.getPartnerInvitationByTokenDigest.mockResolvedValue(invitation as never);
    mq.lockBusinessPartnerById.mockResolvedValue({ ...partner, status: 'closed' } as never);
    expect(await service().acceptInvitation(token, session)).toEqual({
      success: false,
      error: 'partner-not-open',
    });
  });

  it('refuses an account whose stored email is not the invited one', async () => {
    mq.getPartnerInvitationByTokenDigest.mockResolvedValue(invitation as never);
    mq.getPartnerUserById.mockResolvedValue({ isActive: true, email: 'someone@else.com' } as never);
    expect(
      await service().acceptInvitation(token, { ...session, user: { email: 'admin@example.com' } }),
    ).toEqual({ success: false, error: 'email-mismatch' });
  });

  it('creates the membership, accepts the invitation and audits it', async () => {
    mq.getPartnerInvitationByTokenDigest.mockResolvedValue(invitation as never);
    mq.getPartnerUserById.mockResolvedValue({
      isActive: true,
      email: 'admin@example.com',
    } as never);
    mq.insertPartnerMembership.mockResolvedValue(membership() as never);
    const result = await service().acceptInvitation(token, session);
    expect(result).toMatchObject({
      success: true,
      data: { partner: { code: 'sch-100' }, membership: { status: 'active' } },
    });
    expect(mq.setPartnerInvitationStatus).toHaveBeenCalledWith(executor, 11, 'accepted');
    expect(mq.verifyUserEmailIfUnset).toHaveBeenCalled();
    expect(mq.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({ action: 'membership.accepted', actorKind: 'self' }),
    );
  });
});

describe('updateMembership', () => {
  it('rejects an invalid patch before reading', async () => {
    expect(await service().updateMembership(admin, 20, { status: 'bogus' } as never, 2)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(mq.getPartnerMembershipById).not.toHaveBeenCalled();
  });

  it('refuses a missing membership and actors who cannot manage members', async () => {
    mq.getPartnerMembershipById.mockResolvedValueOnce(undefined);
    expect(await service().updateMembership(staff, 20, { roles: ['list-manager'] }, 2)).toEqual({
      success: false,
      error: 'forbidden',
    });
    mq.getPartnerMembershipById.mockResolvedValue(membership() as never);
    mq.getCurrentPartnerMembership.mockResolvedValue(
      membership({ roles: ['list-manager'] }) as never,
    );
    expect(await service().updateMembership(admin, 20, { roles: ['list-manager'] }, 2)).toEqual({
      success: false,
      error: 'forbidden',
    });
  });

  it('maps a domain refusal (removing the last administrator) to its application error', async () => {
    mq.countOtherActivePartnerAdministrators.mockResolvedValue(0);
    expect(await service().updateMembership(staff, 20, { roles: ['list-manager'] }, 2)).toEqual({
      success: false,
      error: 'last-administrator',
    });
  });

  it('refuses a stale expected version', async () => {
    expect(
      await service().updateMembership(
        staff,
        20,
        { roles: ['list-manager', 'partner-administrator'] },
        9,
      ),
    ).toEqual({ success: false, error: 'stale-membership' });
  });

  it('returns the membership unchanged when nothing differs', async () => {
    const result = await service().updateMembership(
      staff,
      20,
      { roles: ['partner-administrator'] },
      2,
    );
    expect(result).toMatchObject({ success: true, data: { authorizationVersion: 2 } });
    expect(mq.updatePartnerMembership).not.toHaveBeenCalled();
  });

  it('changes roles and records a roles_changed audit row', async () => {
    const result = await service().updateMembership(
      staff,
      20,
      { roles: ['partner-administrator', 'list-manager'] },
      2,
    );
    expect(result.success).toBe(true);
    expect(mq.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({ action: 'membership.roles_changed', actorKind: 'staff' }),
    );
  });

  it('suspends a membership, then reactivates it, with the matching audit actions', async () => {
    mq.countOtherActivePartnerAdministrators.mockResolvedValue(2);
    await service().updateMembership(staff, 20, { status: 'suspended' }, 2);
    expect(mq.insertPartnerAccessHistory).toHaveBeenLastCalledWith(
      executor,
      expect.objectContaining({ action: 'membership.suspended' }),
    );
    mq.getPartnerMembershipById.mockResolvedValue(membership({ status: 'suspended' }) as never);
    await service().updateMembership(staff, 20, { status: 'active' }, 2);
    expect(mq.insertPartnerAccessHistory).toHaveBeenLastCalledWith(
      executor,
      expect.objectContaining({ action: 'membership.reactivated' }),
    );
  });

  it('ends a membership with the ended audit action', async () => {
    mq.countOtherActivePartnerAdministrators.mockResolvedValue(2);
    await service().updateMembership(staff, 20, { status: 'ended' }, 2);
    expect(mq.insertPartnerAccessHistory).toHaveBeenLastCalledWith(
      executor,
      expect.objectContaining({ action: 'membership.ended' }),
    );
  });
});

describe('leave', () => {
  it("refuses a member leaving someone else's membership or an unknown one", async () => {
    expect(await service().leave({ kind: 'partner', userId: 99 }, 20)).toEqual({
      success: false,
      error: 'forbidden',
    });
    mq.getPartnerMembershipById.mockResolvedValueOnce(undefined);
    expect(await service().leave(admin, 20)).toEqual({ success: false, error: 'forbidden' });
  });

  it('maps leaving as the last administrator to its application error', async () => {
    mq.countOtherActivePartnerAdministrators.mockResolvedValue(0);
    expect(await service().leave(admin, 20)).toEqual({
      success: false,
      error: 'last-administrator',
    });
  });

  it("ends the caller's own membership and audits it as left", async () => {
    const result = await service().leave(admin, 20);
    expect(result.success).toBe(true);
    expect(mq.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({ action: 'membership.left', actorKind: 'self' }),
    );
  });
});

describe('listMembers', () => {
  it('lists the members for an authorized actor and refuses others', async () => {
    mq.listCurrentPartnerMembers.mockResolvedValue([
      membership({ email: 'admin@example.com', firstName: 'A', lastName: 'B' }),
    ] as never);
    const result = await service().listMembers(staff, 5);
    expect(result).toMatchObject({
      success: true,
      data: [{ email: 'admin@example.com', firstName: 'A' }],
    });
    expect(await service().listMembers({ kind: 'staff', userId: 9 }, 5)).toEqual({
      success: false,
      error: 'forbidden',
    });
    mq.getCurrentPartnerMembership.mockResolvedValue(
      membership({ roles: ['list-manager'] }) as never,
    );
    expect(await service().listMembers(admin, 5)).toEqual({ success: false, error: 'forbidden' });
  });
});

describe('resolvePartnerContext and reads', () => {
  it('resolves nothing without a current session account', async () => {
    expect(await service().resolvePartnerContext(null, 'sch-100')).toEqual({
      success: false,
      error: 'not-found',
    });
    mq.getPartnerUserById.mockResolvedValueOnce({ isActive: false } as never);
    expect(await service().resolvePartnerContext(session, 'sch-100')).toEqual({
      success: false,
      error: 'not-found',
    });
    mq.getPartnerUserById.mockResolvedValueOnce({
      isActive: true,
      id: 7,
      authorizationVersion: 9,
    } as never);
    expect(await service().resolvePartnerContext(session, 'sch-100')).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('refuses a session issued before the account authorization changed', async () => {
    mq.getPartnerUserById.mockResolvedValue({
      isActive: true,
      id: 7,
      authorizationVersion: 4,
    } as never);
    expect(await service().resolvePartnerContext(session, 'sch-100')).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('resolves an active membership, reports suspended, and treats ended as not-found', async () => {
    mq.getPartnerUserById.mockResolvedValue({
      isActive: true,
      id: 7,
      authorizationVersion: 3,
    } as never);
    mq.getBusinessPartnerByCode.mockResolvedValue(partner as never);
    mq.getCurrentPartnerMembership
      .mockResolvedValueOnce(membership() as never)
      .mockResolvedValueOnce(membership({ status: 'suspended' }) as never)
      .mockResolvedValueOnce(membership({ status: 'ended' }) as never);
    expect(await service().resolvePartnerContext(session, 'sch-100')).toMatchObject({
      success: true,
      data: { partner: { code: 'sch-100' } },
    });
    expect(await service().resolvePartnerContext(session, 'sch-100')).toEqual({
      success: false,
      error: 'suspended',
    });
    expect(await service().resolvePartnerContext(session, 'sch-100')).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('reports not-found for an unknown partner or with no membership', async () => {
    mq.getPartnerUserById.mockResolvedValue({
      isActive: true,
      id: 7,
      authorizationVersion: 3,
    } as never);
    mq.getBusinessPartnerByCode.mockResolvedValueOnce(undefined);
    expect(await service().resolvePartnerContext(session, 'nope')).toEqual({
      success: false,
      error: 'not-found',
    });
    mq.getBusinessPartnerByCode.mockResolvedValueOnce(partner as never);
    expect(await service().resolvePartnerContext(session, 'sch-100')).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('lists only active memberships of an active session account', async () => {
    expect(await service().listActiveMemberships(null)).toEqual([]);
    mq.getPartnerUserById.mockResolvedValue({
      isActive: true,
      id: 7,
      authorizationVersion: 3,
    } as never);
    mq.listActivePartnerMembershipsForUser.mockResolvedValue([
      { partner, membership: membership() },
    ] as never);
    const contexts = await service().listActiveMemberships(session);
    expect(contexts).toHaveLength(1);
    expect(contexts[0].partner.code).toBe('sch-100');
  });

  it('delegates role checks to the domain-backed requireRole', () => {
    const context = {
      partner: { ...partner, status: 'active' },
      membership: { ...membership(), roles: ['partner-administrator'] },
    } as never;
    expect(
      service().requireRole(context, ['partner-administrator'], 'membership-change').success,
    ).toBe(true);
  });
});
