/**
 * Permission Service
 *
 * Implements authorization checks for role-based access control (RBAC).
 * Retrieves user permissions from UserRepository and validates against requested permissions.
 * This ensures UI/routes never perform role-string checks (Clean Architecture principle).
 */

import { ID } from '../../../core/domain/types/common';
import { PermissionCode, RoleId } from '../../../core/domain/value-objects';
import { IPermissionService } from '../interfaces/IPermissionService';
import { userQueries } from '@findeg/db/queries';

export class PermissionService implements IPermissionService {

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: ID, permission: PermissionCode): Promise<boolean> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.permissionCodes.includes(permission);
    } catch (error) {
      console.error(`Error checking permission for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: ID, role: RoleId): Promise<boolean> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.activeRoleIds.includes(role);
    } catch (error) {
      console.error(`Error checking role for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: ID): Promise<PermissionCode[]> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.permissionCodes;
    } catch (error) {
      console.error(`Error getting permissions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: ID): Promise<RoleId[]> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.activeRoleIds;
    } catch (error) {
      console.error(`Error getting roles for user ${userId}:`, error);
      return [];
    }
  }
}
