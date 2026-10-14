import { expect, it } from 'vitest';
import { requirePartnerRole } from '../index';
import type { PartnerContext } from '../../membership/types';

function context(roles: PartnerContext['membership']['roles']): PartnerContext {
  return {
    partner: { id: 1, code: 'P1', nameEn: 'Partner', nameAr: 'شريك', status: 'active' },
    membership: {
      id: 1,
      businessPartnerId: 1,
      userId: 7,
      invitationId: 1,
      roles,
      status: 'active',
      authorizationVersion: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    },
  };
}

it('passes the context through when the member holds a required role', () => {
  const held = context(['partner-administrator']);
  expect(requirePartnerRole(held, ['partner-administrator'], 'membership-change')).toEqual({
    success: true,
    data: held,
  });
});

it('fails with role-not-held when the member holds none of the required roles', () => {
  expect(requirePartnerRole(context([]), ['partner-administrator'], 'membership-change')).toEqual({
    success: false,
    error: 'role-not-held',
  });
});

it('refuses membership changes when the Business Partner status disallows them', () => {
  const closed = context(['partner-administrator']);
  closed.partner.status = 'closed';
  expect(requirePartnerRole(closed, ['partner-administrator'], 'membership-change')).toEqual({
    success: false,
    error: 'partner-status-not-allowed',
  });
});
