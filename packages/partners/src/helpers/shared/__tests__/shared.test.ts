import { expect, it } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { canManagePartners, canViewPartners, fail, ok } from '../index';

it('wraps successes and failures in the result shape', () => {
  expect(ok(1)).toEqual({ success: true, data: 1 });
  expect(fail('invalid-input')).toEqual({ success: false, error: 'invalid-input' });
});

it('lets a system administrator or a partners.manage holder manage partners', () => {
  expect(canManagePartners({ kind: 'staff', userId: 1, activeRoleIds: ['system_admin'] })).toBe(
    true,
  );
  expect(
    canManagePartners({
      kind: 'staff',
      userId: 1,
      permissionCodes: [PERMISSION_CODES.PARTNERS_MANAGE],
    }),
  ).toBe(true);
  expect(canManagePartners({ kind: 'staff', userId: 1, permissionCodes: [] })).toBe(false);
});

it('lets report readers view the partner directory without managing it', () => {
  const reportsOnly = {
    kind: 'staff' as const,
    userId: 1,
    permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW],
  };
  expect(canViewPartners(reportsOnly)).toBe(true);
  expect(canManagePartners(reportsOnly)).toBe(false);
});
