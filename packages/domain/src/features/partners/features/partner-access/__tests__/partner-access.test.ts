import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';
import {
  BUSINESS_PARTNER_STATUSES,
  PARTNER_ACTIONS,
  PARTNER_MEMBERSHIP_STATUSES,
  PARTNER_ROLES,
  RESERVED_PARTNER_ROLES,
  canManagePartnerMembers,
  canReadPartnerReport,
  isActivePartnerAdministrator,
  partnerStatusAllows,
  requirePartnerRole,
  type BusinessPartnerStatus,
  type PartnerAction,
  type PartnerRole,
} from '@findeg/domain';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code as string;
    throw error;
  }
}

// The ADR-0012 / PA-3 table, ported from partner-membership's partner-access tests.
const ACTION_ALLOWED: Record<PartnerAction, readonly BusinessPartnerStatus[]> = {
  read: ['onboarding', 'active', 'suspended'],
  reports: ['onboarding', 'active', 'suspended', 'closed'],
  'membership-change': ['onboarding', 'active'],
};

const EVERY_STATUS_AND_ACTION = BUSINESS_PARTNER_STATUSES.flatMap((status) =>
  PARTNER_ACTIONS.map(
    (action) => [status, action, ACTION_ALLOWED[action].includes(status)] as const,
  ),
);

describe('ADR-0012 partner action table', () => {
  it('names the three action classes', () => {
    expect(PARTNER_ACTIONS).toEqual(['read', 'reports', 'membership-change']);
  });

  it.each(EVERY_STATUS_AND_ACTION)('a %s partner allows %s: %s', (status, action, allowed) => {
    expect(partnerStatusAllows(status, action)).toBe(allowed);
  });

  it('leaves a closed partner Reports only', () => {
    expect(PARTNER_ACTIONS.filter((action) => partnerStatusAllows('closed', action))).toEqual([
      'reports',
    ]);
  });
});

describe('requirePartnerRole', () => {
  it.each(EVERY_STATUS_AND_ACTION)(
    'a member holding the role in a %s partner, for %s: allowed %s',
    (status, action, allowed) => {
      const run = () => {
        requirePartnerRole({ status }, { roles: ['report-viewer'] }, ['report-viewer'], action);
      };
      expect(codeOf(run)).toBe(allowed ? undefined : 'PARTNER_STATUS_NOT_ALLOWED');
    },
  );

  it('refuses a member who holds none of the roles', () => {
    expect(
      codeOf(() => {
        requirePartnerRole(
          { status: 'active' },
          { roles: ['list-manager'] },
          ['report-viewer'],
          'read',
        );
      }),
    ).toBe('PARTNER_ROLE_NOT_HELD');
  });

  it('checks the role before the partner status', () => {
    expect(
      codeOf(() => {
        requirePartnerRole(
          { status: 'closed' },
          { roles: ['list-manager'] },
          ['partner-administrator'],
          'read',
        );
      }),
    ).toBe('PARTNER_ROLE_NOT_HELD');
  });

  it('accepts a member holding any one of several roles', () => {
    expect(
      codeOf(() => {
        requirePartnerRole(
          { status: 'active' },
          { roles: ['list-manager', 'report-viewer'] },
          ['partner-administrator', 'report-viewer'],
          'reports',
        );
      }),
    ).toBeUndefined();
  });

  it.each(PARTNER_ROLES)("accepts a member holding only %s for 'any' role", (role) => {
    expect(
      codeOf(() => {
        requirePartnerRole({ status: 'active' }, { roles: [role] }, 'any', 'read');
      }),
    ).toBeUndefined();
  });
});

describe('Partner Role permissions (PA-6, PA-13)', () => {
  const membership = (roles: readonly PartnerRole[], status = 'active' as const) => ({
    roles,
    status,
  });

  it.each(PARTNER_MEMBERSHIP_STATUSES)(
    'only an active membership holding partner-administrator is an active Partner Administrator (%s)',
    (status) => {
      expect(isActivePartnerAdministrator({ roles: ['partner-administrator'], status })).toBe(
        status === 'active',
      );
      expect(isActivePartnerAdministrator({ roles: ['report-viewer'], status })).toBe(false);
    },
  );

  it.each([
    [['partner-administrator'], true],
    [['report-viewer'], false],
    [['list-manager'], false],
    [['collection-staff'], false],
    [['list-manager', 'partner-administrator'], true],
  ] as const)('a member holding %j manages memberships and invitations: %s', (roles, allowed) => {
    expect(canManagePartnerMembers(membership(roles))).toBe(allowed);
  });

  it.each(['suspended', 'ended'] as const)(
    'a %s Partner Administrator manages nothing',
    (status) => {
      expect(canManagePartnerMembers({ roles: ['partner-administrator'], status })).toBe(false);
    },
  );

  // Ported from partner-sales' report access tests.
  it.each([
    [['partner-administrator'], 'active', true],
    [['report-viewer'], 'active', true],
    [['list-manager'], 'active', false],
    [['collection-staff'], 'active', false],
    [['list-manager', 'report-viewer'], 'active', true],
    [['report-viewer'], 'suspended', false],
    [['partner-administrator'], 'ended', false],
  ] as const)(
    'a member holding %j with a %s membership reads reports: %s',
    (roles, status, allowed) => {
      expect(canReadPartnerReport({ roles, status })).toBe(allowed);
    },
  );

  it('reserves list-manager and collection-staff: they grant nothing yet', () => {
    expect(RESERVED_PARTNER_ROLES).toEqual(['list-manager', 'collection-staff']);
    const reserved = membership(RESERVED_PARTNER_ROLES);
    expect(canManagePartnerMembers(reserved)).toBe(false);
    expect(canReadPartnerReport(reserved)).toBe(false);
    expect(isActivePartnerAdministrator(reserved)).toBe(false);
  });
});
