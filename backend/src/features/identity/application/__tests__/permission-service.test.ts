/**
 * Permission Service Unit Tests
 *
 * Tests authorization checks through db query primitives.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PermissionService } from '../services/PermissionService';
import { ID } from '@findeg/backend/features/core/domain/types/common';
import { PermissionCode, RoleId } from '@findeg/backend/features/core/domain/value-objects';
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
        activeRoleIds: ['admin' as RoleId],
        permissionCodes: ['products:create' as PermissionCode, 'products:update' as PermissionCode],
        organizationId: undefined,
      });

      const result = await permissionService.hasPermission(
        123 as ID,
        'products:create' as PermissionCode,
      );

      expect(result).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['customer' as RoleId],
        permissionCodes: ['products:read' as PermissionCode],
        organizationId: undefined,
      });

      const result = await permissionService.hasPermission(
        123 as ID,
        'products:delete' as PermissionCode,
      );

      expect(result).toBe(false);
    });

    it('should return false and log error on exception', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      mockGetAuthorizationContext.mockRejectedValue(new Error('Database error'));

      const result = await permissionService.hasPermission(
        123 as ID,
        'products:create' as PermissionCode,
      );

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', async () => {
      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['admin' as RoleId, 'warehouse_manager' as RoleId],
        permissionCodes: [],
        organizationId: undefined,
      });

      const result = await permissionService.hasRole(123 as ID, 'admin' as RoleId);

      expect(result).toBe(true);
    });

    it('should return false when user lacks role', async () => {
      mockGetAuthorizationContext.mockResolvedValue({
        activeRoleIds: ['customer' as RoleId],
        permissionCodes: [],
        organizationId: undefined,
      });

      const result = await permissionService.hasRole(123 as ID, 'admin' as RoleId);

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
        activeRoleIds: ['admin' as RoleId],
        permissionCodes: expectedPermissions,
        organizationId: undefined,
      });

      const result = await permissionService.getUserPermissions(123 as ID);

      expect(result).toEqual(expectedPermissions);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      mockGetAuthorizationContext.mockRejectedValue(new Error('Database error'));

      const result = await permissionService.getUserPermissions(123 as ID);

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

      const result = await permissionService.getUserRoles(123 as ID);

      expect(result).toEqual(expectedRoles);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      mockGetAuthorizationContext.mockRejectedValue(new Error('Database error'));

      const result = await permissionService.getUserRoles(123 as ID);

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });
});
