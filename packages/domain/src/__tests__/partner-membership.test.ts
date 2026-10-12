import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import {
  BUSINESS_PARTNER_STATUSES,
  PARTNER_MEMBERSHIP_STATUSES,
  changePartnerMembership,
  leavePartnerMembership,
  type PartnerMembershipStatus,
  type PartnerRole,
} from '@findeg/domain/partners';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

const member = (
  roles: readonly PartnerRole[] = ['list-manager'],
  status: PartnerMembershipStatus = 'active',
) => ({ customerId: 7, roles, status });

/** An open partner where another active Partner Administrator exists. */
const open = { partnerStatus: 'active', otherActivePartnerAdministrators: 1 } as const;

// Ported from partner-membership's membership-management tests (ADR-0003, PA-7, PA-8).
describe('Partner Membership status changes', () => {
  const EVERY_PAIR = PARTNER_MEMBERSHIP_STATUSES.flatMap((from) =>
    PARTNER_MEMBERSHIP_STATUSES.map((to) => [from, to] as const),
  );

  it.each(EVERY_PAIR.filter(([from, to]) => from !== 'ended' && from !== to))(
    'moves a membership from %s to %s',
    (from, to) => {
      const result = changePartnerMembership(member(['list-manager'], from), { status: to }, open);
      expect(result).toEqual({ membership: member(['list-manager'], to), changed: true });
    },
  );

  // A same-status change is a no-op, as today: the Backend drops a field that does not differ.
  it.each(['active', 'suspended'] as const)('keeps %s to %s as a no-op', (status) => {
    const current = member(['list-manager'], status);
    expect(changePartnerMembership(current, { status }, open)).toEqual({
      membership: current,
      changed: false,
    });
  });

  it.each(PARTNER_MEMBERSHIP_STATUSES)('refuses any change from ended, even to %s', (to) => {
    expect(
      codeOf(() =>
        changePartnerMembership(member(['list-manager'], 'ended'), { status: to }, open),
      ),
    ).toBe('PARTNER_MEMBERSHIP_ENDED');
  });

  it('refuses a role change from ended', () => {
    expect(
      codeOf(() =>
        changePartnerMembership(
          member(['list-manager'], 'ended'),
          { roles: ['report-viewer'] },
          open,
        ),
      ),
    ).toBe('PARTNER_MEMBERSHIP_ENDED');
  });

  it('never changes the membership it is given', () => {
    const current = member();
    changePartnerMembership(current, { status: 'suspended', roles: ['report-viewer'] }, open);
    expect(current).toEqual(member());
  });
});

describe('Partner Membership roles', () => {
  it('changes roles and status together', () => {
    expect(
      changePartnerMembership(member(), { roles: ['report-viewer'], status: 'suspended' }, open),
    ).toEqual({ membership: member(['report-viewer'], 'suspended'), changed: true });
  });

  it('removes repeated roles', () => {
    expect(
      changePartnerMembership(member(), { roles: ['report-viewer', 'report-viewer'] }, open)
        .membership.roles,
    ).toEqual(['report-viewer']);
  });

  it('treats the same roles in another order as a no-op', () => {
    const current = member(['list-manager', 'report-viewer']);
    expect(
      changePartnerMembership(current, { roles: ['report-viewer', 'list-manager'] }, open),
    ).toEqual({ membership: current, changed: false });
  });

  it('treats a change that changes nothing as a no-op', () => {
    const current = member();
    expect(
      changePartnerMembership(current, { roles: ['list-manager'], status: 'active' }, open),
    ).toEqual({ membership: current, changed: false });
  });

  it('needs at least one role', () => {
    expect(codeOf(() => changePartnerMembership(member(), { roles: [] }, open))).toBe(
      'PARTNER_ROLE_REQUIRED',
    );
  });

  it('refuses an unknown role', () => {
    expect(
      codeOf(() =>
        changePartnerMembership(member(), { roles: ['superuser' as PartnerRole] }, open),
      ),
    ).toBe('UNKNOWN_PARTNER_ROLE');
  });

  it('checks the roles before the partner status', () => {
    expect(
      codeOf(() =>
        changePartnerMembership(member(), { roles: [] }, { ...open, partnerStatus: 'closed' }),
      ),
    ).toBe('PARTNER_ROLE_REQUIRED');
  });
});

describe('membership changes follow the partner status (ADR-0012)', () => {
  it.each(BUSINESS_PARTNER_STATUSES)('a %s partner', (partnerStatus) => {
    const run = () =>
      changePartnerMembership(member(), { status: 'suspended' }, { ...open, partnerStatus });
    const allowed = partnerStatus === 'onboarding' || partnerStatus === 'active';
    expect(codeOf(run)).toBe(allowed ? undefined : 'PARTNER_NOT_OPEN');
  });

  it('checks the partner status before the ended membership', () => {
    expect(
      codeOf(() =>
        changePartnerMembership(
          member(['list-manager'], 'ended'),
          { status: 'active' },
          { ...open, partnerStatus: 'suspended' },
        ),
      ),
    ).toBe('PARTNER_NOT_OPEN');
  });
});

describe('the last active Partner Administrator (PA-7)', () => {
  const lastAdmin = { partnerStatus: 'active', otherActivePartnerAdministrators: 0 } as const;
  const admin = member(['partner-administrator']);

  it.each([
    ['dropping the administrator role', { roles: ['report-viewer'] }],
    ['suspending', { status: 'suspended' }],
    ['ending', { status: 'ended' }],
  ] as const)('is never removed by %s', (_name, change) => {
    expect(codeOf(() => changePartnerMembership(admin, change, lastAdmin))).toBe(
      'LAST_PARTNER_ADMINISTRATOR',
    );
  });

  it('is never removed by leaving', () => {
    expect(codeOf(() => leavePartnerMembership(admin, lastAdmin))).toBe(
      'LAST_PARTNER_ADMINISTRATOR',
    );
  });

  it('steps down when another active Partner Administrator exists', () => {
    expect(
      changePartnerMembership(admin, { roles: ['report-viewer'] }, open).membership.roles,
    ).toEqual(['report-viewer']);
  });

  it('keeps the administrator role while changing other roles', () => {
    expect(
      changePartnerMembership(
        admin,
        { roles: ['partner-administrator', 'report-viewer'] },
        lastAdmin,
      ).membership.roles,
    ).toEqual(['partner-administrator', 'report-viewer']);
  });

  it('reactivates a suspended administrator even when no other is active', () => {
    expect(
      changePartnerMembership(
        member(['partner-administrator'], 'suspended'),
        { status: 'active' },
        lastAdmin,
      ).membership.status,
    ).toBe('active');
  });

  it('ends a suspended administrator, who is not counted as active', () => {
    expect(
      changePartnerMembership(
        member(['partner-administrator'], 'suspended'),
        { status: 'ended' },
        lastAdmin,
      ).membership.status,
    ).toBe('ended');
  });

  it('reports a closed partner before the last administrator', () => {
    expect(
      codeOf(() => leavePartnerMembership(admin, { ...lastAdmin, partnerStatus: 'closed' })),
    ).toBe('PARTNER_NOT_OPEN');
  });
});

describe('leaving a Business Partner', () => {
  it.each(['active', 'suspended'] as const)('ends a %s membership', (status) => {
    expect(leavePartnerMembership(member(['list-manager'], status), open)).toEqual(
      member(['list-manager'], 'ended'),
    );
  });

  it('is refused once the membership has ended', () => {
    expect(codeOf(() => leavePartnerMembership(member(['list-manager'], 'ended'), open))).toBe(
      'PARTNER_MEMBERSHIP_ENDED',
    );
  });

  it.each(['suspended', 'closed'] as const)(
    'is refused while the partner is %s',
    (partnerStatus) => {
      expect(codeOf(() => leavePartnerMembership(member(), { ...open, partnerStatus }))).toBe(
        'PARTNER_NOT_OPEN',
      );
    },
  );
});
