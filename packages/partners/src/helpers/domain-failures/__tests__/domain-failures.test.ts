import { expect, it } from 'vitest';
import { requirePartnerRole as requireDomainPartnerRole } from '@findeg/domain';
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
  expect(
    partnerFailure(domainError(), (code): code is 'role-not-held' => code === 'role-not-held'),
  ).toEqual({ success: false, error: 'role-not-held' });
});

it('rethrows errors that are not partner domain errors', () => {
  const unexpected = new Error('database unavailable');
  expect(() =>
    partnerFailure(unexpected, (code): code is 'role-not-held' => code === 'role-not-held'),
  ).toThrow(unexpected);
});
