/**
 * Permission Service Interface
 *
 * Defines the contract for authorization operations.
 * Implements permission checks and role-based access control without exposing
 * role-string checks in UI layer (Clean Architecture principle).
 */

import { ID } from "@backend/features/core/domain/types/common";
import { PermissionCode, RoleId } from "@backend/features/core/domain/value-objects";

export interface IPermissionService {
  /**
   * Check if user has specific permission
   * @param userId - User ID to check
   * @param permission - Permission code (e.g., 'products:create', 'orders:update')
   * @returns True if user has permission through role or direct grant
   */
  hasPermission(userId: ID, permission: PermissionCode): Promise<boolean>;

  /**
   * Check if user has specific role
   * @param userId - User ID to check
   * @param role - Role code (e.g., 'admin', 'customer', 'warehouse_manager')
   * @returns True if user has role
   */
  hasRole(userId: ID, role: RoleId): Promise<boolean>;

  /**
   * Get all permissions for a user (role-based + direct grants - revocations)
   * @param userId - User ID
   * @returns Array of permission codes
   */
  getUserPermissions(userId: ID): Promise<PermissionCode[]>;

  /**
   * Get all roles for a user
   * @param userId - User ID
   * @returns Array of role codes
   */
  getUserRoles(userId: ID): Promise<RoleId[]>;
}
