/**
 * Admin User Service
 *
 * Manages admin users, their role assignments, and per-user permission overrides.
 * All operations require system_admin privileges (enforced at the API layer).
 */

import bcrypt from 'bcryptjs';
import {
  createAdminUserRaw,
  deactivateAdminUserRaw,
  getAdminUsersSnapshotRaw,
  listAdminUserIdsRaw,
  setAdminPermissionOverridesRaw,
  updateAdminUserRaw,
} from '@findeg/db/queries';

import type {
  AdminUser,
  CreateAdminInput,
  UpdateAdminInput,
  PermissionOverrideInput,
  IAdminUserService,
} from '../interfaces/IAdminUserService';

/**
 *
 */
export class AdminUserService implements IAdminUserService {
  /**
   * Returns all users who have at least one admin role assigned.
   */
  async listAdmins(): Promise<AdminUser[]> {
    const ids = await listAdminUserIdsRaw();

    if (ids.length === 0) return [];

    return this.fetchAdminUsers(ids);
  }

  /**
   * Returns a single admin user with roles and permission overrides.
   */
  async getAdmin(userId: number): Promise<AdminUser | null> {
    const results = await this.fetchAdminUsers([userId]);
    return results[0] ?? null;
  }

  /**
   * Creates a new admin user with hashed password and assigns roles.
   */
  async createAdmin(input: CreateAdminInput): Promise<AdminUser> {
    const passwordHash = await bcrypt.hash(input.password, 12);

    const userId = await createAdminUserRaw({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash,
      roleIds: input.roleIds,
    });

    const result = await this.getAdmin(userId);
    if (!result) throw new Error('Failed to fetch created admin user');
    return result;
  }

  /**
   * Updates an admin's profile and/or role assignments.
   * If roleIds is provided, replaces all existing role assignments.
   */
  async updateAdmin(userId: number, input: UpdateAdminInput): Promise<AdminUser> {
    await updateAdminUserRaw(userId, input);

    const result = await this.getAdmin(userId);
    if (!result) throw new Error('Admin user not found after update');
    return result;
  }

  /**
   * Deactivates an admin account. The user cannot log in afterwards.
   */
  async deactivateAdmin(userId: number): Promise<void> {
    await deactivateAdminUserRaw(userId);
  }

  /**
   * Replaces all per-user permission overrides for a user.
   * Deletes existing overrides, then inserts the new set.
   */
  async setPermissionOverrides(
    userId: number,
    overrides: PermissionOverrideInput[],
    grantedBy: number,
  ): Promise<void> {
    await setAdminPermissionOverridesRaw(userId, overrides, grantedBy);
  }

  /**
   * Internal helper — fetches full AdminUser shape for the given user IDs.
   */
  private async fetchAdminUsers(userIds: number[]): Promise<AdminUser[]> {
    const snapshot = await getAdminUsersSnapshotRaw(userIds);

    return snapshot.users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: snapshot.roles
        .filter((r) => r.userId === user.id)
        .map((r) => ({ id: r.roleId, code: r.roleCode, name: r.roleName })),
      permissionOverrides: snapshot.permissionOverrides
        .filter((o) => o.userId === user.id)
        .map((o) => ({
          permissionCode: o.permissionCode,
          action: o.action as 'grant' | 'revoke',
        })),
    }));
  }
}
