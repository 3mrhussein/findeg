/**
 * Admin User Management Service Interface
 *
 * Defines the contract for managing admin users, their roles, and
 * per-user permission overrides. Only accessible to system admins.
 */

export interface AdminUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roles: { id: number; code: string; name: string }[];
  permissionOverrides: { permissionCode: string; action: 'grant' | 'revoke' }[];
  createdAt: Date;
}

export interface CreateAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds: number[];
}

export interface UpdateAdminInput {
  firstName?: string;
  lastName?: string;
  roleIds?: number[];
  isActive?: boolean;
}

export interface PermissionOverrideInput {
  permissionId: number;
  action: 'grant' | 'revoke';
}

export interface IAdminUserService {
  /** Returns all users assigned to at least one admin role */
  listAdmins(): Promise<AdminUser[]>;
  /** Returns a single admin user by ID, or null if not found */
  getAdmin(userId: number): Promise<AdminUser | null>;
  /** Creates a new admin user and assigns the given roles */
  createAdmin(input: CreateAdminInput): Promise<AdminUser>;
  /** Updates admin profile and/or role assignments */
  updateAdmin(userId: number, input: UpdateAdminInput): Promise<AdminUser>;
  /** Sets isActive = false; user cannot log in */
  deactivateAdmin(userId: number): Promise<void>;
  /** Replaces per-user permission overrides (upsert all, delete removed) */
  setPermissionOverrides(
    userId: number,
    overrides: PermissionOverrideInput[],
    grantedBy: number,
  ): Promise<void>;
}
