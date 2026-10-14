/**
 * Account service: Customer and Staff profiles, admin user operations and the "My Account"
 * read model. Order history comes from the Orders package; catalogue data is not read here.
 */
import bcrypt from 'bcryptjs';
import {
  createAdminUserRaw,
  getAdminUsersSnapshotRaw,
  listAdminUserIdsRaw,
  setAdminPermissionOverridesRaw,
  updateAdminUserRaw,
  userQueries,
} from '@findeg/db/queries';
import { createOrders, type Order } from '@findeg/orders';
import { ResourceNotFoundError } from '@findeg/domain-errors';
import type {
  AdminUser,
  CreateAdminInput,
  PermissionOverrideInput,
  UpdateAdminInput,
} from '../admin-users';
import type { IUserService, User } from './types';

/** Derives a full name from a user's `firstName` and `lastName`. Empty when neither is set. */
export const getUserFullName = (user: Pick<User, 'firstName' | 'lastName'>) => {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
};

export class UserService implements IUserService {
  async listAdmins(): Promise<AdminUser[]> {
    const ids = await listAdminUserIdsRaw();
    if (ids.length === 0) return [];
    return this.fetchAdminUsers(ids);
  }

  async getAdmin(userId: number): Promise<AdminUser | null> {
    const results = await this.fetchAdminUsers([userId]);
    return results[0] ?? null;
  }

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

  async updateAdmin(userId: number, input: UpdateAdminInput): Promise<AdminUser> {
    await updateAdminUserRaw(userId, input);

    const result = await this.getAdmin(userId);
    if (!result) throw new Error('Admin user not found after update');
    return result;
  }

  async deactivateAdmin(userId: number): Promise<void> {
    await userQueries.update(userId, { isActive: false });
  }

  async setPermissionOverrides(
    userId: number,
    overrides: PermissionOverrideInput[],
    grantedBy: number,
  ): Promise<void> {
    await setAdminPermissionOverridesRaw(userId, overrides, grantedBy);
  }

  async updateProfile(
    userId: number,
    input: { firstName?: string; lastName?: string; phone?: string },
  ): Promise<void> {
    await userQueries.update(userId, input);
  }

  /** Returns current profile contacts independently from Order history. */
  async getProfile(userId: number): Promise<User> {
    const user = await userQueries.getById(userId);
    if (!user) throw new ResourceNotFoundError('User', userId);
    return user as User;
  }

  /** Retrieves profile and order summary for "My Account". */
  async getProfileData(userId: number): Promise<{ user: User; orders: Order[] }> {
    const orders = createOrders();
    const [user, userOrders] = await Promise.all([
      userQueries.getById(userId),
      orders.listForCustomer(userId),
    ]);

    if (!user) throw new ResourceNotFoundError('User', userId);

    return { user: user as User, orders: userOrders };
  }

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
