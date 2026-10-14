import type { ID, PermissionCode, RoleId } from '@findeg/db/types';

export interface IPermissionService {
  /** Whether the user holds a permission through a role or direct grant. */
  hasPermission(userId: ID, permission: PermissionCode): Promise<boolean>;
  /** Whether the user holds an active role. */
  hasRole(userId: ID, role: RoleId): Promise<boolean>;
  /** Role-based permissions plus direct grants, minus revocations. */
  getUserPermissions(userId: ID): Promise<PermissionCode[]>;
  /** Active role IDs for the user. */
  getUserRoles(userId: ID): Promise<RoleId[]>;
}
