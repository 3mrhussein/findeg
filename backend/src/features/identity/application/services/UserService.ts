/**
 * User Service Implementation
 *
 * Manages users, role assignments, and data aggregation for profile/dashboard.
 * Coordinates between Identity, Catalog, and Order domains.
 */

import bcrypt from 'bcryptjs';
import {
  createAdminUserRaw,
  getAdminUsersSnapshotRaw,
  listAdminUserIdsRaw,
  setAdminPermissionOverridesRaw,
  updateAdminUserRaw,
} from '@findeg/db/queries';
import { userQueries } from '@findeg/db/queries';

import { ResourceNotFoundError } from '../../../core/domain/errors';
import { parse } from '../../../core/domain/value-objects';
import { createCatalogServices } from '../../../catalog';
import { createOrderServices } from '../../../order';
import {
  AdminUser,
  CreateAdminInput,
  UpdateAdminInput,
  PermissionOverrideInput,
  IUserService,
  DashboardData,
} from '../interfaces/IUserService';
import { User } from '../../domain/entities/User';
import { Order } from '../../../order/domain/entities/Order';

export class UserService implements IUserService {
  constructor() { }

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
   * Creates a new admin user.
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
   * Updates an admin user.
   */
  async updateAdmin(userId: number, input: UpdateAdminInput): Promise<AdminUser> {
    await updateAdminUserRaw(userId, input);

    const result = await this.getAdmin(userId);
    if (!result) throw new Error('Admin user not found after update');
    return result;
  }

  /**
   * Deactivates an admin account.
   */
  async deactivateAdmin(userId: number): Promise<void> {
    await userQueries.update(userId, { isActive: false });
  }

  /**
   * Sets permission overrides.
   */
  async setPermissionOverrides(
    userId: number,
    overrides: PermissionOverrideInput[],
    grantedBy: number,
  ): Promise<void> {
    await setAdminPermissionOverridesRaw(userId, overrides, grantedBy);
  }

  /**
   * Retrieves profile and order summary for "My Account".
   */
  async getProfileData(userId: number): Promise<{ user: User; orders: Order[] }> {
    const { orders } = createOrderServices();
    const [user, userOrders] = await Promise.all([
      userQueries.getById(userId),
      orders.getByUserId(userId),
    ]);

    if (!user) {
      throw new ResourceNotFoundError('User', userId);
    }

    return { user: user as User, orders: userOrders };
  }

  /**
   * Aggregates data for the user dashboard.
   */
  async getDashboardData(locale: string, userId: number): Promise<DashboardData> {
    const resolvedLocale = parse(locale);
    const { products, schoolLists } = createCatalogServices();
    const { orders } = createOrderServices();
    const [allProducts, userOrders, allSchoolLists, user] = await Promise.all([
      products.getAll(resolvedLocale),
      orders.getByUserId(userId),
      schoolLists.getAllLists(),
      this.getAdmin(userId),
    ]);

    return {
      products: allProducts,
      orders: userOrders,
      schoolLists: allSchoolLists,
      session: user,
    };
  }

  /**
   * Internal helper — fetches full AdminUser shape.
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
