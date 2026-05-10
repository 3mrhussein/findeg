/**
 * Admin User Service
 *
 * Manages admin users, their role assignments, and per-user permission overrides.
 * All operations require system_admin privileges (enforced at the API layer).
 */

import bcrypt from 'bcryptjs';
import { eq, inArray } from 'drizzle-orm';

import { db } from '@findeg/db/connection';
import {
  users,
  userRoles,
  userPermissions,
  roles,
  permissions,
  passwordCredentials,
} from '@findeg/db/schema';

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
    // Get all user IDs that have any role (not 'user' role)
    const adminUserIds = await db
      .selectDistinct({ userId: userRoles.userId })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(roles.code, 'system_admin'))
      .union(
        db
          .selectDistinct({ userId: userRoles.userId })
          .from(userRoles)
          .innerJoin(roles, eq(roles.id, userRoles.roleId)),
      );

    if (adminUserIds.length === 0) return [];

    const ids = adminUserIds.map((r) => r.userId);
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

    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        portalRole: 'staff',
        isActive: true,
      })
      .returning({ id: users.id });

    // Store hashed password
    await db.insert(passwordCredentials).values({
      userId: newUser.id,
      passwordHash,
      hashStrategy: 'bcrypt',
    });

    // Assign roles
    if (input.roleIds.length > 0) {
      await db.insert(userRoles).values(
        input.roleIds.map((roleId) => ({
          userId: newUser.id,
          roleId,
          scope: 'global' as const,
        })),
      );
    }

    const result = await this.getAdmin(newUser.id);
    if (!result) throw new Error('Failed to fetch created admin user');
    return result;
  }

  /**
   * Updates an admin's profile and/or role assignments.
   * If roleIds is provided, replaces all existing role assignments.
   */
  async updateAdmin(userId: number, input: UpdateAdminInput): Promise<AdminUser> {
    if (
      input.firstName !== undefined ||
      input.lastName !== undefined ||
      input.isActive !== undefined
    ) {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.firstName !== undefined) updates.firstName = input.firstName;
      if (input.lastName !== undefined) updates.lastName = input.lastName;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db
        .update(users)
        .set(updates as Partial<typeof users.$inferInsert>)
        .where(eq(users.id, userId));
    }

    if (input.roleIds !== undefined) {
      // Replace all role assignments
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
      if (input.roleIds.length > 0) {
        await db.insert(userRoles).values(
          input.roleIds.map((roleId) => ({
            userId,
            roleId,
            scope: 'global' as const,
          })),
        );
      }
    }

    const result = await this.getAdmin(userId);
    if (!result) throw new Error('Admin user not found after update');
    return result;
  }

  /**
   * Deactivates an admin account. The user cannot log in afterwards.
   */
  async deactivateAdmin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() } as Partial<typeof users.$inferInsert>)
      .where(eq(users.id, userId));
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
    await db.delete(userPermissions).where(eq(userPermissions.userId, userId));

    if (overrides.length > 0) {
      await db.insert(userPermissions).values(
        overrides.map((o) => ({
          userId,
          permissionId: o.permissionId,
          action: o.action,
          grantedBy,
        })),
      );
    }
  }

  /**
   * Internal helper — fetches full AdminUser shape for the given user IDs.
   */
  private async fetchAdminUsers(userIds: number[]): Promise<AdminUser[]> {
    if (userIds.length === 0) return [];

    const [userRows, roleRows, overrideRows] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(inArray(users.id, userIds)),
      db
        .select({
          userId: userRoles.userId,
          roleId: roles.id,
          roleCode: roles.code,
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(inArray(userRoles.userId, userIds)),
      db
        .select({
          userId: userPermissions.userId,
          permissionCode: permissions.code,
          action: userPermissions.action,
        })
        .from(userPermissions)
        .innerJoin(permissions, eq(permissions.id, userPermissions.permissionId))
        .where(inArray(userPermissions.userId, userIds)),
    ]);

    return userRows.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: roleRows
        .filter((r) => r.userId === user.id)
        .map((r) => ({ id: r.roleId, code: r.roleCode, name: r.roleName })),
      permissionOverrides: overrideRows
        .filter((o) => o.userId === user.id)
        .map((o) => ({
          permissionCode: o.permissionCode,
          action: o.action as 'grant' | 'revoke',
        })),
    }));
  }
}
