import { expect, it } from 'vitest';
import { DomainError, requirePartnerRole as requireDomainPartnerRole } from '@findeg/domain';
import { partnerFailure } from '../index';

function domainError(): unknown {
  try {
    requireDomainPartnerRole(
      { status: 'active' },
      { roles: [] },
      ['partner-administrator'],
      'membership-change',
    );
  } catch (error) {
    return error;
  }
  throw new Error('expected the domain to refuse the role');
}

it('maps a partner domain error to its application failure', () => {
  expect(partnerFailure(domainError())).toEqual({ success: false, error: 'role-not-held' });
});

it('rethrows errors that are not partner domain errors', () => {
  const unexpected = new Error('database unavailable');
  expect(() => partnerFailure(unexpected)).toThrow(unexpected);
});

it('maps known partner codes even outside the caller expected type', () => {
  expect(partnerFailure<'invalid-input'>(domainError())).toEqual({
    success: false,
    error: 'role-not-held',
  });
});

class FixtureDomainError extends DomainError {}

it.each([
  ['INVALID_PARTNER_STATUS_CHANGE', 'invalid-transition'],
  ['LAST_PARTNER_ADMINISTRATOR', 'last-administrator'],
  ['INVITATION_EXPIRED', 'invitation-expired'],
])('maps %s without changing its application meaning', (code, expected) => {
  expect(partnerFailure(new FixtureDomainError(code, 'fixture'))).toEqual({
    success: false,
    error: expected,
  });
});

it.each(['UNKNOWN_PARTNER_CODE', 'toString', '__proto__'])(
  'rethrows unmapped domain code %s by identity',
  (code) => {
    const error = new FixtureDomainError(code, 'fixture');
    expect.assertions(1);
    try {
      partnerFailure(error);
    } catch (caught) {
      expect(caught).toBe(error);
    }
  },
);

it('does not map a plain object carrying a known domain code', () => {
  const error = { code: 'PARTNER_ROLE_NOT_HELD' };
  try {
    partnerFailure(error);
  } catch (caught) {
    expect(caught).toBe(error);
    return;
  }
  throw new Error('expected the original object to be rethrown');
});
