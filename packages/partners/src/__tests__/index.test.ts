import { describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import * as partnerQueries from '@findeg/db/queries/partners';
import { createPartnerMembershipServices } from '../index';

vi.mock('@findeg/db/connection', () => ({
  db: { transaction: (run: (tx: unknown) => unknown) => run({}) },
}));
vi.mock('@findeg/db/queries/partners', () => ({
  listBusinessPartners: vi.fn(() => Promise.resolve().then(() => [])),
  lockBusinessPartnerById: vi.fn(() =>
    Promise.resolve().then(() => ({
      id: 5,
      code: 'sch-100',
      nameEn: 'Nile',
      nameAr: 'النيل',
      status: 'active',
    })),
  ),
  getCurrentPartnerMembershipByEmail: vi.fn(() => Promise.resolve().then(() => undefined)),
  getPendingPartnerInvitationByEmail: vi.fn(() => Promise.resolve().then(() => undefined)),
  insertPartnerAccessHistory: vi.fn(() => Promise.resolve().then(() => undefined)),
  insertPartnerInvitation: vi.fn(() =>
    Promise.resolve().then(() => ({
      id: 11,
      businessPartnerId: 5,
      email: 'teacher@example.com',
      roles: ['list-manager'],
      status: 'pending',
      expiresAt: new Date('2026-10-30T00:00:00Z'),
      createdAt: new Date('2026-10-14T00:00:00Z'),
    })),
  ),
  insertPartnerInvitationToken: vi.fn(() => Promise.resolve().then(() => undefined)),
}));

describe('createPartnerMembershipServices', () => {
  it('uses the injected database, the system clock and the no-op delivery by default', async () => {
    const services = createPartnerMembershipServices({
      db: { transaction: (run: (tx: unknown) => unknown) => run({}) } as never,
    });
    const invited = await services.invitations.invite(
      { kind: 'staff', userId: 1, permissionCodes: [PERMISSION_CODES.PARTNERS_MANAGE] },
      5,
      { email: 'teacher@example.com', roles: ['list-manager'] },
    );
    expect(invited.success).toBe(true);
  });

  it('falls back to the shared connection when no database is injected', async () => {
    const services = createPartnerMembershipServices();
    const listed = await services.partners.listPartners({
      kind: 'staff',
      userId: 1,
      permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW],
    });
    expect(listed).toEqual({ success: true, data: [] });
    expect(partnerQueries.listBusinessPartners).toHaveBeenCalled();
  });
});
