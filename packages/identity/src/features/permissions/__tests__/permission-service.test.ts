/**
 * Permission Service Unit Tests
 *
 * Tests authorization checks through db query primitives.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PermissionService } from '../helpers';
import { PermissionCode, RoleId } from '@findeg/db/types';
import { userQueries } from '@findeg/db/queries';

vi.mock('@findeg/db/queries', () => ({
  userQueries: {
    getAuthorizationContext: vi.fn(),
  },
}));

describe('PermissionService', () => {
  let permissionService: PermissionService;
  const mockGetAuthorizationContext = vi.mocked(userQueries.getAuthorizationContext);

  beforeEach(() => {
    permissionService = new PermissionService();
    mockGetAuthorizationContext.mockReset();
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', async () => {
      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['admin'],
        permissionCodes: ['products:create', 'products:update'],
        organizationId: undefined,
      });

      const result = await permissionService.hasPermission(123, 'products:create');

      expect(result).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['customer'],
        permissionCodes: ['products:read'],
        organizationId: undefined,
      });

      const result = await permissionService.hasPermission(123, 'products:delete');

      expect(result).toBe(false);
    });

    it('should return false and log error on exception', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetAuthorizationContext.mockRejectedValue(new Error('Database error'));

      const result = await permissionService.hasPermission(123, 'products:create');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', async () => {
      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['admin', 'warehouse_manager'],
        permissionCodes: [],
        organizationId: undefined,
      });

      const result = await permissionService.hasRole(123, 'admin');

      expect(result).toBe(true);
    });

    it('should return false when user lacks role', async () => {
      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['customer'],
        permissionCodes: [],
        organizationId: undefined,
      });

      const result = await permissionService.hasRole(123, 'admin');

      expect(result).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return all user permissions', async () => {
      const expectedPermissions = [
        'products:create',
        'products:update',
        'products:read',
      ] as PermissionCode[];

      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['admin'],
        permissionCodes: expectedPermissions,
        organizationId: undefined,
      });

      const result = await permissionService.getUserPermissions(123);

      expect(result).toEqual(expectedPermissions);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetAuthorizationContext.mockRejectedValue(new Error('Database error'));

      const result = await permissionService.getUserPermissions(123);

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserRoles', () => {
    it('should return all user roles', async () => {
      const expectedRoles = ['admin', 'warehouse_manager'] as RoleId[];

      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: expectedRoles,
        permissionCodes: [],
        organizationId: undefined,
      });

      const result = await permissionService.getUserRoles(123);

      expect(result).toEqual(expectedRoles);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetAuthorizationContext.mockRejectedValue(new Error('Database error'));

      const result = await permissionService.getUserRoles(123);

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });
});
