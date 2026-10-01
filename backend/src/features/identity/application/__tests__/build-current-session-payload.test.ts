import { describe, it, expect } from 'vitest';
import { PERMISSION_CODES } from '../../../core/domain/auth/authorization';
import {
  buildCurrentSessionPayload,
  type CurrentSessionUser,
} from '../services/buildCurrentSessionPayload';

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
