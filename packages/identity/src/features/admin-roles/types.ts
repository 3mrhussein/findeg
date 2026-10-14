/**
 * Admin Role Management Service Interface
 *
 * Defines the contract for managing roles and their permission assignments.
 * Only accessible to system admins.
 */

export interface PermissionItem {
  id: number;
  code: string;
  name: string;
}

export interface RoleWithPermissions {
  id: number;
  code: string;
  name: string;
  permissions: PermissionItem[];
  userCount: number;
}

export interface IAdminRoleService {
  /** Returns all roles with their assigned permissions and assigned user count */
  listRoles(): Promise<RoleWithPermissions[]>;
  /** Returns a single role by ID or null if not found */
  getRole(roleId: number): Promise<RoleWithPermissions | null>;
  /** Creates a new custom role with the given permission IDs */
  createRole(code: string, name: string, permissionIds: number[]): Promise<RoleWithPermissions>;
  /** Replaces the full permission set for a role */
  updateRolePermissions(roleId: number, permissionIds: number[]): Promise<RoleWithPermissions>;
  /** Deletes a role. Throws if any users are currently assigned to it */
  deleteRole(roleId: number): Promise<void>;
  /** Returns the complete list of all available permission codes */
  listPermissions(): Promise<PermissionItem[]>;
}
