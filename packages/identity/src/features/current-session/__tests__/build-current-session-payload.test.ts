import { describe, it, expect, vi } from 'vitest';

vi.mock('@findeg/db/queries', () => ({ userQueries: {} }));
import { PERMISSION_CODES } from '../../contracts';
import { buildCurrentSessionPayload } from '../helpers';
import type { CurrentSessionUser } from '../types';

const baseUser: CurrentSessionUser = {
  id: 7,
  email: 'person@example.com',
  firstName: 'Per',
  lastName: 'Son',
  portalRole: 'customer',
  authorizationVersion: 3,
};

describe('buildCurrentSessionPayload', () => {
  it('grants the admin portal to staff', () => {
    const payload = buildCurrentSessionPayload(
      { ...baseUser, portalRole: 'staff' },
      { activeRoleIds: [], permissionCodes: [] },
    );

    expect(payload.permissionCodes).toContain(PERMISSION_CODES.ADMIN_PORTAL);
  });

  it('does not grant the admin portal to customers', () => {
    const payload = buildCurrentSessionPayload(baseUser, {
      activeRoleIds: [],
      permissionCodes: ['orders.read'],
    });

    expect(payload.permissionCodes).toEqual(['orders.read']);
  });

  it('does not duplicate an admin portal permission that staff already hold', () => {
    const payload = buildCurrentSessionPayload(
      { ...baseUser, portalRole: 'staff' },
      { activeRoleIds: [], permissionCodes: [PERMISSION_CODES.ADMIN_PORTAL] },
    );

    expect(payload.permissionCodes).toEqual([PERMISSION_CODES.ADMIN_PORTAL]);
  });
});
