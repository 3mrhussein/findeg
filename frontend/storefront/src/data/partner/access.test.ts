import { describe, expect, it } from 'vitest';
import type { PartnerContext, PartnerRole } from '@findeg/backend/features/partner-membership';
import { PARTNER_REPORT_ROLES } from '@findeg/backend/features/partner-sales';
import { decidePartnerPageAccess, partnerIndexDestination } from './access';

const context = (
  status: PartnerContext['partner']['status'],
  code = 'school',
  roles: PartnerRole[] = ['list-manager'],
): PartnerContext => ({
  partner: { id: 1, code, nameEn: 'School', nameAr: 'مدرسة', status },
  membership: {
    id: 1,
    businessPartnerId: 1,
    userId: 1,
    invitationId: 1,
    roles,
    status: 'active',
    authorizationVersion: 1,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
});

describe('decidePartnerPageAccess', () => {
  it('renders the access-suspended outcome for a suspended membership, not not-found', () => {
    expect(decidePartnerPageAccess({ success: false, error: 'suspended' }, 'any', 'read')).toEqual({
      kind: 'suspended',
    });
  });

  it('maps unknown, non-member and ended members to not-found', () => {
    expect(decidePartnerPageAccess({ success: false, error: 'not-found' }, 'any', 'read')).toEqual({
      kind: 'not-found',
    });
  });

  it('allows an active member on an active partner', () => {
    const active = context('active');
    expect(decidePartnerPageAccess({ success: true, data: active }, 'any', 'read')).toEqual({
      kind: 'allowed',
      context: active,
    });
  });

  it('refuses home-page reads on a closed partner for a status reason, not a role reason', () => {
    expect(
      decidePartnerPageAccess({ success: true, data: context('closed') }, 'any', 'read'),
    ).toMatchObject({ kind: 'refused', reason: 'partner-status-not-allowed' });
  });

  it('reports a role reason when the member lacks the required role', () => {
    expect(
      decidePartnerPageAccess(
        { success: true, data: context('active') },
        ['partner-administrator'],
        'read',
      ),
    ).toMatchObject({ kind: 'refused', reason: 'role-not-held' });
  });
});

describe('Partner Reports page access (ADR-0010, ADR-0012)', () => {
  const statuses = ['onboarding', 'active', 'suspended', 'closed'] as const;

  it.each(
    statuses.flatMap((status) =>
      (['partner-administrator', 'report-viewer'] as const).map((role) => [role, status] as const),
    ),
  )('allows %s while the Business Partner is %s', (role, status) => {
    const reader = context(status, 'school', [role]);
    expect(
      decidePartnerPageAccess({ success: true, data: reader }, PARTNER_REPORT_ROLES, 'reports'),
    ).toEqual({ kind: 'allowed', context: reader });
  });

  it.each(
    statuses.flatMap((status) =>
      (['list-manager', 'collection-staff'] as const).map((role) => [role, status] as const),
    ),
  )('refuses %s while the Business Partner is %s', (role, status) => {
    expect(
      decidePartnerPageAccess(
        { success: true, data: context(status, 'school', [role]) },
        PARTNER_REPORT_ROLES,
        'reports',
      ),
    ).toMatchObject({ kind: 'refused', reason: 'role-not-held' });
  });

  it('refuses suspended and ended memberships before roles are considered', () => {
    expect(
      decidePartnerPageAccess(
        { success: false, error: 'suspended' },
        PARTNER_REPORT_ROLES,
        'reports',
      ),
    ).toEqual({ kind: 'suspended' });
    expect(
      decidePartnerPageAccess(
        { success: false, error: 'not-found' },
        PARTNER_REPORT_ROLES,
        'reports',
      ),
    ).toEqual({ kind: 'not-found' });
  });
});

describe('partnerIndexDestination', () => {
  it('goes straight into the workspace for exactly one membership', () => {
    expect(partnerIndexDestination([context('active', 'only-school')])).toEqual({
      redirectTo: '/partner/only-school',
    });
  });

  it('lists workspaces for none or several memberships', () => {
    expect(partnerIndexDestination([])).toEqual({ list: [] });
    const two = [context('active', 'a'), context('active', 'b')];
    expect(partnerIndexDestination(two)).toEqual({ list: two });
  });
});
