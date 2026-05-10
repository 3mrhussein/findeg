import * as schema from '../src/schema/index.ts';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { prepareSeedData, hashPassword, ensureParents } from './helpers';

import { z } from 'zod';

import permissionsData from './data/permissions.json';
import rolesData from './data/roles.json';
import organizationsData from './data/organizations.json';
import usersData from './data/users.json';
import rolePermissionsData from './data/role_permissions.json';
import userRolesData from './data/user_roles.json';
import organizationMembershipsData from './data/organization_memberships.json';
import authAccountsData from './data/auth_accounts.json';
import guestPrincipalsData from './data/guest_principals.json';
import paymentMethodsData from './data/payment_methods.json';
import userPermissionsData from './data/user_permissions.json';
import {
  AuthProviderSchema,
  OrganizationIdSchema,
  PaymentProviderSchema,
  PermissionCodeSchema,
  RoleIdSchema,
} from '../src/types';

interface SeedUser {
  id: number;
  email: string;
  password?: string;
  [key: string]: any;
}

export async function seedIdentity(db: PostgresJsDatabase<typeof schema>) {
  console.log('🌱 Seeding Identity Domain...');

  // 1. Permissions (Independent)
  if (permissionsData.length > 0) {
    console.log('  - Seeding Permissions...');
    await db
      .insert(schema.permissions)
      .values(
        prepareSeedData(
          schema.permissions,
          permissionsData,
          z.object({ code: PermissionCodeSchema }).passthrough(),
        ),
      );
  }

  // 2. Roles (Independent)
  if (rolesData.length > 0) {
    console.log('  - Seeding Roles...');
    await db
      .insert(schema.roles)
      .values(
        prepareSeedData(schema.roles, rolesData, z.object({ code: RoleIdSchema }).passthrough()),
      );
  }

  // 3. Organizations (Independent)
  if (organizationsData.length > 0) {
    console.log('  - Seeding Organizations...');
    await db
      .insert(schema.organizations)
      .values(
        prepareSeedData(
          schema.organizations,
          organizationsData,
          z.object({ code: OrganizationIdSchema }).passthrough(),
        ),
      );
  }

  // 4. Guest Principals (Independent)
  if (guestPrincipalsData.length > 0) {
    console.log('  - Seeding Guest Principals...');
    await db
      .insert(schema.guestPrincipals)
      .values(prepareSeedData(schema.guestPrincipals, guestPrincipalsData));
  }

  // 5. Users & Credentials
  if (usersData.length > 0) {
    console.log('  - Seeding Users & Credentials...');
    for (const user of usersData as SeedUser[]) {
      const [insertedUser] = await db
        .insert(schema.users)
        .values(prepareSeedData(schema.users, [user])[0])
        .returning();

      const password = user.password || 'password123';
      const passwordHash = await hashPassword(password);

      await db.insert(schema.passwordCredentials).values({
        userId: insertedUser.id,
        passwordHash,
        hashStrategy: 'bcrypt',
      });
    }
  }

  // 6. Role-Permissions (Depends on Roles, Permissions)
  if (rolePermissionsData.length > 0) {
    console.log('  - Seeding Role-Permissions...');
    await ensureParents(db, [
      { table: schema.roles, name: '"identity"."roles"' },
      { table: schema.permissions, name: '"identity"."permissions"' },
    ]);
    const rpInsert = await Promise.all(
      rolePermissionsData.map(async (rp) => {
        const foundRole = await db.query.roles.findFirst({
          where: eq(schema.roles.id, rp.roleId),
        });
        const foundPermission = await db.query.permissions.findFirst({
          where: eq(schema.permissions.id, rp.permissionId),
        });

        if (!foundRole || !foundPermission) {
          throw new Error(
            `❌ Logical Validation Error: Invalid Role/Permission mapping: ${rp.roleId} -> ${rp.permissionId}`,
          );
        }

        return {
          roleId: foundRole.id,
          permissionId: foundPermission.id,
          createdAt: rp.createdAt ? new Date(rp.createdAt) : new Date(),
        };
      }),
    );
    await db.insert(schema.rolePermissions).values(rpInsert);
  }

  // 7. Dependent on Users
  if (usersData.length > 0) {
    // Auth Accounts
    if (authAccountsData.length > 0) {
      console.log('  - Seeding Auth Accounts...');
      await db
        .insert(schema.authAccounts)
        .values(
          prepareSeedData(
            schema.authAccounts,
            authAccountsData,
            z.object({ provider: AuthProviderSchema }).passthrough(),
          ),
        );
    }

    // User-Roles
    if (userRolesData.length > 0) {
      console.log('  - Seeding User-Roles...');
      await ensureParents(db, [
        { table: schema.users, name: '"identity"."users"' },
        { table: schema.roles, name: '"identity"."roles"' },
      ]);
      const urInsert = await Promise.all(
        userRolesData.map(async (ur) => {
          const foundUser = await db.query.users.findFirst({
            where: eq(schema.users.id, ur.userId),
          });
          const foundRole = await db.query.roles.findFirst({
            where: eq(schema.roles.id, ur.roleId),
          });

          if (!foundUser || !foundRole) {
            throw new Error(
              `❌ Logical Validation Error: User Role assignment failed for User ${ur.userId} or Role ${ur.roleId}`,
            );
          }

          return {
            userId: foundUser.id,
            roleId: foundRole.id,
            scope: ur.scope as any,
            organizationId: ur.organizationId,
            createdAt: ur.createdAt ? new Date(ur.createdAt) : new Date(),
          };
        }),
      );
      await db.insert(schema.userRoles).values(urInsert);
    }

    // User Permissions (Direct Overrides)
    if (userPermissionsData.length > 0) {
      console.log('  - Seeding User-Permissions...');
      await ensureParents(db, [
        { table: schema.users, name: '"identity"."users"' },
        { table: schema.permissions, name: '"identity"."permissions"' },
      ]);
      await db
        .insert(schema.userPermissions)
        .values(prepareSeedData(schema.userPermissions, userPermissionsData));
    }

    // Organization Memberships
    if (organizationMembershipsData.length > 0) {
      console.log('  - Seeding Organization Memberships...');
      await ensureParents(db, [
        { table: schema.organizations, name: '"identity"."organizations"' },
        { table: schema.users, name: '"identity"."users"' },
      ]);
      const omInsert = await Promise.all(
        organizationMembershipsData.map(async (om) => {
          const foundOrg = await db.query.organizations.findFirst({
            where: eq(schema.organizations.id, om.organizationId),
          });
          const foundUser = await db.query.users.findFirst({
            where: eq(schema.users.id, om.userId),
          });

          if (!foundOrg || !foundUser) {
            throw new Error(
              `❌ Logical Validation Error: Org Membership failed for User ${om.userId} or Org ${om.organizationId}`,
            );
          }

          return {
            organizationId: foundOrg.id,
            userId: foundUser.id,
            status: om.status || 'active',
            createdAt: om.createdAt ? new Date(om.createdAt) : new Date(),
          };
        }),
      );
      await db.insert(schema.organizationMemberships).values(omInsert);
    }

    // Payment Methods
    if (paymentMethodsData.length > 0) {
      console.log('  - Seeding Payment Methods...');
      await db
        .insert(schema.paymentMethods)
        .values(
          prepareSeedData(
            schema.paymentMethods,
            paymentMethodsData,
            z.object({ provider: PaymentProviderSchema }).passthrough(),
          ),
        );
    }
  }
}
