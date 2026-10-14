import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import {
  BUSINESS_PARTNER_STATUSES,
  allowedPartnerStatusChanges,
  changePartnerStatus,
  type BusinessPartnerStatus,
} from '@findeg/domain/partners';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code as string;
    throw error;
  }
}

// Ported from partner-membership's partner-status tests (PA-1, PA-17, ADR-0012).
const ALLOWED: readonly (readonly [BusinessPartnerStatus, BusinessPartnerStatus])[] = [
  ['onboarding', 'active'],
  ['onboarding', 'closed'],
  ['active', 'suspended'],
  ['active', 'closed'],
  ['suspended', 'active'],
  ['suspended', 'closed'],
];

const EVERY_PAIR = BUSINESS_PARTNER_STATUSES.flatMap((from) =>
  BUSINESS_PARTNER_STATUSES.map((to) => [from, to] as const),
);
const isAllowed = (from: string, to: string) =>
  ALLOWED.some(([allowedFrom, allowedTo]) => allowedFrom === from && allowedTo === to);

describe('Business Partner status changes', () => {
  const withAdministrator = { activePartnerAdministrators: 1 };

  it.each(EVERY_PAIR.filter(([from, to]) => isAllowed(from, to)))(
    'moves a partner from %s to %s',
    (from, to) => {
      const partner = { code: 'nile-school', status: from };
      expect(changePartnerStatus(partner, to, withAdministrator)).toEqual({
        code: 'nile-school',
        status: to,
      });
    },
  );

  // A same-status change is refused like any other move outside the table, as today.
  it.each(EVERY_PAIR.filter(([from, to]) => !isAllowed(from, to)))(
    'refuses %s to %s',
    (from, to) => {
      expect(codeOf(() => changePartnerStatus({ status: from }, to, withAdministrator))).toBe(
        'INVALID_PARTNER_STATUS_CHANGE',
      );
    },
  );

  it('never changes the partner it is given', () => {
    const partner = { status: 'onboarding' as const };
    changePartnerStatus(partner, 'active', withAdministrator);
    expect(partner.status).toBe('onboarding');
  });

  it('keeps closed final', () => {
    expect(allowedPartnerStatusChanges('closed')).toEqual([]);
  });

  it.each([
    ['onboarding', ['active', 'closed']],
    ['active', ['suspended', 'closed']],
    ['suspended', ['active', 'closed']],
  ] as const)('lists the moves allowed from %s', (from, expected) => {
    expect(allowedPartnerStatusChanges(from)).toEqual(expected);
  });

  describe('activation needs an active Partner Administrator', () => {
    it.each(['onboarding', 'suspended'] as const)(
      'refuses to activate from %s without one',
      (from) => {
        expect(
          codeOf(() =>
            changePartnerStatus({ status: from }, 'active', { activePartnerAdministrators: 0 }),
          ),
        ).toBe('NO_ACTIVE_PARTNER_ADMINISTRATOR');
      },
    );

    it.each([
      ['active', 'suspended'],
      ['active', 'closed'],
      ['onboarding', 'closed'],
      ['suspended', 'closed'],
    ] as const)('needs no administrator to move from %s to %s', (from, to) => {
      expect(
        changePartnerStatus({ status: from }, to, { activePartnerAdministrators: 0 }).status,
      ).toBe(to);
    });

    it('checks the move before the administrator', () => {
      expect(
        codeOf(() =>
          changePartnerStatus({ status: 'closed' }, 'active', { activePartnerAdministrators: 0 }),
        ),
      ).toBe('INVALID_PARTNER_STATUS_CHANGE');
    });
  });
});
