import { expect, it } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { canViewPartnerReports, READ_SNAPSHOT } from '../index';

it('lets staff with partner.reports.view read Partner Reports', () => {
  expect(
    canViewPartnerReports({ userId: 1, permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW] }),
  ).toBe(true);
});

it('lets a system administrator read Partner Reports', () => {
  expect(canViewPartnerReports({ userId: 1, activeRoleIds: ['system_admin'] })).toBe(true);
});

it('refuses staff without the report permission or the system administrator role', () => {
  expect(canViewPartnerReports({ userId: 1, permissionCodes: [] })).toBe(false);
});

it('reads Partner Reports from one repeatable-read snapshot', () => {
  expect(READ_SNAPSHOT).toEqual({ isolationLevel: 'repeatable read', accessMode: 'read only' });
});
