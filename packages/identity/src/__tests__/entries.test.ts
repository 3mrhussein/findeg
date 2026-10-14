import { describe, it, expect, vi } from 'vitest';
import * as root from '../index';
import * as types from '../types';

vi.mock('@findeg/db/queries', () => ({
  userQueries: {},
  listAdminUserIdsRaw: vi.fn(),
  getAdminUsersSnapshotRaw: vi.fn(),
}));

describe('@findeg/identity entries', () => {
  it('root entry publishes the services, facades and contracts', () => {
    expect(typeof root.createIdentityServices).toBe('function');
    expect(typeof root.login).toBe('function');
    expect(typeof root.getMyAccountData).toBe('function');
    expect(root.PERMISSION_CODES.ADMIN_PORTAL).toBeDefined();
    expect(typeof root.createUserVO).toBe('function');
  });

  it('types entry publishes the pure contract without services', () => {
    expect(types.PERMISSION_CODES).toBe(root.PERMISSION_CODES);
    expect(types.AUTH_ERROR_CATALOG.AUTH_INVALID_CREDENTIALS.httpStatus).toBe(401);
    expect(types).not.toHaveProperty('createIdentityServices');
  });

  it('creates services and facades that delegate to them', async () => {
    const services = root.createIdentityServices();
    expect(Object.keys(services).sort()).toEqual(
      ['adminRoles', 'adminUsers', 'auth', 'permissions', 'userService'].sort(),
    );
    await expect(root.logout()).resolves.toEqual({ success: true });
  });
});
