/**
 * User Service Implementation
 *
 * Manages users, role assignments, and data aggregation for profile/dashboard.
 * Coordinates between Identity, Catalog, and Order domains.
 */

import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { db } from "@findeg/db";
import {
  users,
  userRoles,
  userPermissions,
  roles,
  permissions,
  passwordCredentials,
} from "@findeg/db/schema";

import { NotAuthenticatedError, ResourceNotFoundError } from "../../../core/domain/errors";
import { resolveLocale } from "../../../core/domain/value-objects";
import { createCatalogServices } from "../../../catalog";
import { createOrderServices } from "../../../order";
import { IUserRepository } from "../interfaces/IUserRepository";
import {
  AdminUser,
  CreateAdminInput,
  UpdateAdminInput,
  PermissionOverrideInput,
  IUserService,
  DashboardData,
} from "../interfaces/IUserService";
import { User } from "../../domain/entities/User";
import { Order } from "../../../order/domain/entities/Order";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Returns all users who have at least one admin role assigned.
   */
  async listAdmins(): Promise<AdminUser[]> {
    const adminUserIds = await db
      .selectDistinct({ userId: userRoles.userId })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId));

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
   * Creates a new admin user.
   */
  async createAdmin(input: CreateAdminInput): Promise<AdminUser> {
    const passwordHash = await bcrypt.hash(input.password, 12);

    const newUser = await this.userRepository.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      portalRole: "staff",
      isActive: true,
    });

    await this.userRepository.upsertPasswordCredentials(newUser.id, {
      passwordHash,
      hashStrategy: "bcrypt",
    });

    if (input.roleIds.length > 0) {
      await db.insert(userRoles).values(
        input.roleIds.map((roleId) => ({
          userId: newUser.id,
          roleId,
          scope: "global" as const,
        })),
      );
    }

    const result = await this.getAdmin(newUser.id);
    if (!result) throw new Error("Failed to fetch created admin user");
    return result;
  }

  /**
   * Updates an admin user.
   */
  async updateAdmin(userId: number, input: UpdateAdminInput): Promise<AdminUser> {
    const updates: Partial<User> = {};
    if (input.firstName !== undefined) updates.firstName = input.firstName;
    if (input.lastName !== undefined) updates.lastName = input.lastName;
    if (input.isActive !== undefined) updates.isActive = input.isActive;

    if (Object.keys(updates).length > 0) {
      await this.userRepository.update(userId, updates);
    }

    if (input.roleIds !== undefined) {
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
      if (input.roleIds.length > 0) {
        await db.insert(userRoles).values(
          input.roleIds.map((roleId) => ({
            userId,
            roleId,
            scope: "global" as const,
          })),
        );
      }
    }

    const result = await this.getAdmin(userId);
    if (!result) throw new Error("Admin user not found after update");
    return result;
  }

  /**
   * Deactivates an admin account.
   */
  async deactivateAdmin(userId: number): Promise<void> {
    await this.userRepository.update(userId, { isActive: false });
  }

  /**
   * Sets permission overrides.
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
   * Retrieves profile and order summary for "My Account".
   */
  async getProfileData(userId: number): Promise<{ user: User; orders: Order[] }> {
    const { orders } = createOrderServices();
    const [user, userOrders] = await Promise.all([
      this.userRepository.getById(userId),
      orders.getByUserId(userId),
    ]);

    if (!user) {
      throw new ResourceNotFoundError("User", userId);
    }

    return { user, orders: userOrders };
  }

  /**
   * Aggregates data for the user dashboard.
   */
  async getDashboardData(locale: string, userId: number): Promise<DashboardData> {
    const resolvedLocale = resolveLocale(locale);
    const { products, schoolLists } = createCatalogServices();
    const { orders } = createOrderServices();

    const [allProducts, userOrders, allSchoolLists] = await Promise.all([
      products.getAll(resolvedLocale),
      orders.getByUserId(userId),
      schoolLists.getAllLists(),
    ]);

    return {
      products: allProducts,
      orders: userOrders,
      schoolLists: allSchoolLists,
    };
  }

  /**
   * Internal helper — fetches full AdminUser shape.
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
          action: o.action as "grant" | "revoke",
        })),
    }));
  }
}
