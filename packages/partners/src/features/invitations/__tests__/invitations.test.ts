import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import * as q from '@findeg/db/queries/partners';
import { InvitationService } from '../index';

vi.mock('@findeg/db/queries/partners', () => ({
  getBusinessPartnerById: vi.fn(),
  getCurrentPartnerMembershipByEmail: vi.fn(),
  getPartnerInvitationById: vi.fn(),
  getPartnerInvitationByTokenDigest: vi.fn(),
  getPendingPartnerInvitationByEmail: vi.fn(),
  insertPartnerAccessHistory: vi.fn(),
  insertPartnerInvitation: vi.fn(),
  insertPartnerInvitationToken: vi.fn(),
  listPendingPartnerInvitations: vi.fn(),
  lockBusinessPartnerById: vi.fn(),
  setPartnerInvitationExpiry: vi.fn(),
  setPartnerInvitationStatus: vi.fn(),
  getPartnerUserById: vi.fn(),
  getCurrentPartnerMembership: vi.fn(),
}));

const NOW = new Date('2026-10-14T10:00:00Z');
const later = new Date('2026-10-30T10:00:00Z');
const staff = {
  kind: 'staff' as const,
  userId: 1,
  permissionCodes: [PERMISSION_CODES.PARTNERS_MANAGE],
};
const partnerAdmin = { kind: 'partner' as const, userId: 7 };
const executor = { transaction: (run: (tx: unknown) => unknown) => run(executor) };
const partner = { id: 5, code: 'sch-100', nameEn: 'Nile', nameAr: 'النيل', status: 'active' };

function invitationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 11,
    businessPartnerId: 5,
    email: 'teacher@example.com',
    roles: ['list-manager'],
    status: 'pending',
    expiresAt: later,
    createdAt: NOW,
    invitedByUserId: 1,
    ...overrides,
  };
}

const enqueue = vi.fn();
function service(clock = () => NOW) {
  return new InvitationService(async () => executor as never, clock, enqueue);
}

const mq = vi.mocked(q);

beforeEach(() => {
  vi.resetAllMocks();
  mq.insertPartnerAccessHistory.mockResolvedValue(undefined as never);
  mq.insertPartnerInvitationToken.mockResolvedValue(undefined as never);
  mq.getCurrentPartnerMembershipByEmail.mockResolvedValue(undefined);
  mq.getPendingPartnerInvitationByEmail.mockResolvedValue(undefined);
  mq.lockBusinessPartnerById.mockResolvedValue(partner as never);
  mq.getPartnerUserById.mockResolvedValue({ isActive: true } as never);
  mq.getCurrentPartnerMembership.mockResolvedValue({
    roles: ['partner-administrator'],
    status: 'active',
  } as never);
});

describe('invite', () => {
  it('refuses staff without the permission and partners that are not Staff-visible', async () => {
    expect(
      await service().invite({ kind: 'staff', userId: 9 }, 5, {
        email: 'a@b.co',
        roles: ['list-manager'],
      }),
    ).toEqual({ success: false, error: 'forbidden' });
    mq.lockBusinessPartnerById.mockResolvedValue(undefined);
    expect(await service().invite(staff, 99, { email: 'a@b.co', roles: ['list-manager'] })).toEqual(
      { success: false, error: 'not-found' },
    );
  });

  it('issues an invitation, revokes the pending one it replaces, and enqueues delivery', async () => {
    mq.getPendingPartnerInvitationByEmail.mockResolvedValue(invitationRow({ id: 10 }) as never);
    mq.setPartnerInvitationStatus.mockResolvedValue(
      invitationRow({ id: 10, status: 'revoked' }) as never,
    );
    mq.insertPartnerInvitation.mockResolvedValue(invitationRow() as never);
    const result = await service().invite(staff, 5, {
      email: 'Teacher@Example.com',
      roles: ['list-manager'],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.invitation).toMatchObject({ id: 11, roles: ['list-manager'] });
    expect(result.data.token).toHaveLength(43);
    expect(enqueue).toHaveBeenCalledWith(
      executor,
      { kind: 'partner-invitation', invitationId: 11 },
      { token: result.data.token },
    );
    expect(mq.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({ action: 'invitation.revoked' }),
    );
  });

  it('lets an active partner administrator invite and rejects other partner members', async () => {
    mq.insertPartnerInvitation.mockResolvedValue(invitationRow() as never);
    const ok = await service().invite(partnerAdmin, 5, {
      email: 'teacher@example.com',
      roles: ['list-manager'],
    });
    expect(ok.success).toBe(true);
    mq.getCurrentPartnerMembership.mockResolvedValue({
      roles: ['list-manager'],
      status: 'active',
    } as never);
    expect(
      await service().invite(partnerAdmin, 5, { email: 'x@y.co', roles: ['list-manager'] }),
    ).toEqual({ success: false, error: 'forbidden' });
  });

  it('rejects input that fails the schema', async () => {
    expect(
      await service().invite(staff, 5, { email: 'a@b.co', roles: ['not-a-role'] as never }),
    ).toEqual({ success: false, error: 'invalid-input' });
  });

  it('maps domain refusals: already a member and a partner that is not open', async () => {
    mq.getCurrentPartnerMembershipByEmail.mockResolvedValue({ id: 3 } as never);
    expect(
      await service().invite(staff, 5, { email: 'teacher@example.com', roles: ['list-manager'] }),
    ).toEqual({ success: false, error: 'already-member' });
    mq.getCurrentPartnerMembershipByEmail.mockResolvedValue(undefined);
    mq.lockBusinessPartnerById.mockResolvedValue({ ...partner, status: 'closed' } as never);
    expect(
      await service().invite(staff, 5, { email: 'teacher@example.com', roles: ['list-manager'] }),
    ).toEqual({ success: false, error: 'partner-not-open' });
  });
});

describe('resend and revoke', () => {
  it('resends a pending invitation with a fresh token and expiry', async () => {
    mq.getPartnerInvitationById.mockResolvedValue(invitationRow() as never);
    mq.setPartnerInvitationExpiry.mockResolvedValue(invitationRow({ expiresAt: later }) as never);
    const result = await service().resendInvitation(staff, 11, 5);
    expect(result.success).toBe(true);
    expect(enqueue).toHaveBeenCalled();
    expect(mq.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({ action: 'invitation.resent' }),
    );
  });

  it('reports a missing invitation and one scoped to another partner as not-found or not-pending', async () => {
    mq.getPartnerInvitationById.mockResolvedValue(undefined);
    expect(await service().resendInvitation(staff, 11)).toEqual({
      success: false,
      error: 'not-found',
    });
    mq.getPartnerInvitationById.mockResolvedValue(invitationRow({ businessPartnerId: 6 }) as never);
    expect(await service().revokeInvitation(staff, 11, 5)).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('refuses to resend a non-pending invitation', async () => {
    mq.getPartnerInvitationById
      .mockResolvedValueOnce(invitationRow({ status: 'accepted' }) as never)
      .mockResolvedValueOnce(invitationRow({ status: 'accepted' }) as never);
    expect(await service().resendInvitation(staff, 11)).toEqual({
      success: false,
      error: 'invitation-not-pending',
    });
  });

  it('revokes a pending invitation and audits it', async () => {
    mq.getPartnerInvitationById.mockResolvedValue(invitationRow() as never);
    mq.setPartnerInvitationStatus.mockResolvedValue(invitationRow({ status: 'revoked' }) as never);
    expect(await service().revokeInvitation(staff, 11, 5)).toMatchObject({
      success: true,
      data: { status: 'revoked' },
    });
  });

  it('refuses a partner actor who is not an administrator of the partner', async () => {
    mq.getPartnerInvitationById.mockResolvedValue(invitationRow() as never);
    mq.getCurrentPartnerMembership.mockResolvedValue(undefined as never);
    expect(await service().revokeInvitation(partnerAdmin, 11, 5)).toEqual({
      success: false,
      error: 'forbidden',
    });
  });
});

describe('reads and delivery', () => {
  it('lists pending invitations for an authorized actor and refuses others', async () => {
    mq.listPendingPartnerInvitations.mockResolvedValue([invitationRow()] as never);
    expect(await service().listPendingInvitations(staff, 5)).toMatchObject({
      success: true,
      data: [{ id: 11 }],
    });
    expect(await service().listPendingInvitations({ kind: 'staff', userId: 9 }, 5)).toEqual({
      success: false,
      error: 'forbidden',
    });
  });

  it('issues a delivery token only for a pending, unexpired invitation of an open partner', async () => {
    mq.getPartnerInvitationById.mockResolvedValue(invitationRow() as never);
    const delivery = await service().issueDeliveryToken(11);
    expect(delivery).toMatchObject({ email: 'teacher@example.com', partner: { nameEn: 'Nile' } });
    expect(mq.insertPartnerInvitationToken).toHaveBeenCalledWith(
      executor,
      11,
      createHash('sha256').update(delivery!.token).digest('hex'),
    );
  });

  it('returns null from issueDeliveryToken when the invitation cannot be delivered', async () => {
    mq.getPartnerInvitationById.mockResolvedValue(undefined);
    expect(await service().issueDeliveryToken(11)).toBeNull();
    mq.getPartnerInvitationById.mockResolvedValue(invitationRow({ status: 'accepted' }) as never);
    expect(await service().issueDeliveryToken(11)).toBeNull();
    mq.getPartnerInvitationById.mockResolvedValue(invitationRow() as never);
    expect(await service(() => new Date('2026-12-01T00:00:00Z')).issueDeliveryToken(11)).toBeNull();
    mq.lockBusinessPartnerById.mockResolvedValue({ ...partner, status: 'closed' } as never);
    expect(await service().issueDeliveryToken(11)).toBeNull();
  });

  it('reads an invitation by token digest with its state, and not-found for unknown tokens', async () => {
    mq.getPartnerInvitationByTokenDigest
      .mockResolvedValueOnce(invitationRow() as never)
      .mockResolvedValueOnce(undefined);
    mq.getBusinessPartnerById.mockResolvedValue(partner as never);
    const view = await service().getInvitation('raw-token');
    expect(view).toMatchObject({
      success: true,
      data: { email: 'teacher@example.com', state: 'pending', partner: { code: 'sch-100' } },
    });
    expect(await service().getInvitation('unknown')).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('reports not-found when the partner of a token invitation is gone', async () => {
    mq.getPartnerInvitationByTokenDigest.mockResolvedValue(invitationRow() as never);
    mq.getBusinessPartnerById.mockResolvedValue(undefined);
    expect(await service().getInvitation('raw')).toEqual({ success: false, error: 'not-found' });
  });
});
