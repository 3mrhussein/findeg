/**
 * Permission Service. Implements role-based access control checks against the resolved
 * authorization context so UI and routes never perform role-string checks.
 */
import { userQueries } from '@findeg/db/queries';
import type { ID, PermissionCode, RoleId } from '@findeg/db/types';
import type { IPermissionService } from './types';

export class PermissionService implements IPermissionService {
  async hasPermission(userId: ID, permission: PermissionCode): Promise<boolean> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.permissionCodes.includes(permission);
    } catch (error) {
      console.error(`Error checking permission for user ${String(userId)}:`, error);
      return false;
    }
  }

  async hasRole(userId: ID, role: RoleId): Promise<boolean> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.activeRoleIds.includes(role);
    } catch (error) {
      console.error(`Error checking role for user ${String(userId)}:`, error);
      return false;
    }
  }

  async getUserPermissions(userId: ID): Promise<PermissionCode[]> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.permissionCodes;
    } catch (error) {
      console.error(`Error getting permissions for user ${String(userId)}:`, error);
      return [];
    }
  }

  async getUserRoles(userId: ID): Promise<RoleId[]> {
    try {
      const authContext = await userQueries.getAuthorizationContext(userId);
      return authContext.activeRoleIds;
    } catch (error) {
      console.error(`Error getting roles for user ${String(userId)}:`, error);
      return [];
    }
  }
}
