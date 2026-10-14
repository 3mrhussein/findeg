import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import {
  BUSINESS_PARTNER_STATUSES,
  changePartnerCode,
  isPartnerCode,
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

// Ported from partner-membership's partners tests and PartnerService's code schema (PA-2).
describe('Partner Code format', () => {
  it.each(['nile-school', 'ab', 'a1-b2-c3', '2026', 'x'.repeat(120)])('accepts %s', (code) => {
    expect(isPartnerCode(code)).toBe(true);
  });

  it.each([
    ['a slug with spaces and capitals', 'Not A Slug'],
    ['one character', 'a'],
    ['more than 120 characters', 'x'.repeat(121)],
    ['capitals', 'Nile-School'],
    ['a leading hyphen', '-nile'],
    ['a trailing hyphen', 'nile-'],
    ['a double hyphen', 'nile--school'],
    ['an underscore', 'nile_school'],
    ['surrounding spaces', ' nile '],
    ['nothing', ''],
  ])('refuses %s', (_name, code) => {
    expect(isPartnerCode(code)).toBe(false);
  });
});

describe('Partner Code changes only while onboarding', () => {
  it('changes the code of an onboarding partner', () => {
    expect(changePartnerCode({ code: 'old-code', status: 'onboarding' }, 'new-code')).toEqual({
      code: 'new-code',
      status: 'onboarding',
    });
  });

  it.each(['active', 'suspended', 'closed'] as const)(
    'locks the code of a %s partner',
    (status) => {
      expect(codeOf(() => changePartnerCode({ code: 'locked', status }, 'unlocked'))).toBe(
        'PARTNER_CODE_LOCKED',
      );
    },
  );

  it.each(BUSINESS_PARTNER_STATUSES)('keeps the same code of a %s partner as a no-op', (status) => {
    const partner = { code: 'same-code', status };
    expect(changePartnerCode(partner, 'same-code')).toBe(partner);
  });

  it.each(BUSINESS_PARTNER_STATUSES)('refuses a malformed code for a %s partner', (status) => {
    expect(codeOf(() => changePartnerCode({ code: 'nile', status }, 'Not A Slug'))).toBe(
      'INVALID_PARTNER_CODE',
    );
  });
});
