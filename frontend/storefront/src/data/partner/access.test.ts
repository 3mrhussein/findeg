import { describe, expect, it } from 'vitest';
import type { PartnerContext } from '@findeg/backend/features/partner-membership';
import { decidePartnerPageAccess, partnerIndexDestination } from './access';

const context = (status: PartnerContext['partner']['status'], code = 'school'): PartnerContext => ({
  partner: { id: 1, code, nameEn: 'School', nameAr: 'مدرسة', status },
  membership: {
    id: 1,
    businessPartnerId: 1,
    userId: 1,
    invitationId: 1,
    roles: ['list-manager'],
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
