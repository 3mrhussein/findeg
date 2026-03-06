import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import type {
  AuthProvider,
  PaymentProvider,
  PermissionCode,
  RoleScope,
} from "@/features/core/domain/value-objects";

/**
 * Linked authentication identities per user.
 */
export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 40 }).$type<AuthProvider>().notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqProviderAccount: uniqueIndex("uq_auth_accounts_provider_account").on(
      table.provider,
      table.providerAccountId,
    ),
    idxAuthAccountsUser: index("idx_auth_accounts_user_id").on(table.userId),
  }),
);

/**
 * Local credential hash storage.
 */
export const passwordCredentials = pgTable("password_credentials", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  hashStrategy: varchar("hash_strategy", { length: 30 }).notNull().default("bcrypt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Organizations for business/tenant context.
 */
export const organizations = pgTable(
  "organizations",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 120 }).notNull().unique(),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxOrganizationsCode: index("idx_organizations_code").on(table.code),
  }),
);

/**
 * RBAC roles.
 */
export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 120 }).notNull().unique(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxRolesCode: index("idx_roles_code").on(table.code),
  }),
);

/**
 * Atomic permissions.
 */
export const permissions = pgTable(
  "permissions",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 160 }).$type<PermissionCode>().notNull().unique(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxPermissionsCode: index("idx_permissions_code").on(table.code),
  }),
);

/**
 * Role-to-permission mapping.
 */
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
);

/**
 * Direct user role grants.
 */
export const userRoles = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    scope: varchar("scope", { length: 20 }).$type<RoleScope>().notNull().default("global"),
    organizationId: integer("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uqUserRoleScope: uniqueIndex("uq_user_roles_user_role_scope_org").on(
      table.userId,
      table.roleId,
      table.scope,
      table.organizationId,
    ),
    idxUserRolesUser: index("idx_user_roles_user_id").on(table.userId),
  }),
);

/**
 * Per-user permission overrides.
 * Allows system admin to grant or revoke individual permissions per user,
 * independent of their role assignments.
 */
export const userPermissions = pgTable(
  "user_permissions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    /** 'grant' adds a permission, 'revoke' removes one even if the role includes it */
    action: varchar("action", { length: 10 }).notNull().default("grant"),
    /** Who made this override */
    grantedBy: integer("granted_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uqUserPermission: uniqueIndex("uq_user_permissions_user_permission").on(
      table.userId,
      table.permissionId,
    ),
    idxUserPermissionsUser: index("idx_user_permissions_user_id").on(table.userId),
  }),
);

/**
 * User membership in organizations.
 */
export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqOrganizationMembership: uniqueIndex("uq_organization_memberships_org_user").on(
      table.organizationId,
      table.userId,
    ),
    idxOrganizationMembershipUser: index("idx_organization_memberships_user_id").on(table.userId),
  }),
);

/**
 * Tokenized saved payment methods.
 */
export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 40 }).$type<PaymentProvider>().notNull(),
    tokenReference: text("token_reference").notNull(),
    displayLabel: text("display_label"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxPaymentMethodsUser: index("idx_payment_methods_user_id").on(table.userId),
  }),
);

/**
 * Persistent guest principal records.
 */
export const guestPrincipals = pgTable(
  "guest_principals",
  {
    id: serial("id").primaryKey(),
    guestKey: varchar("guest_key", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxGuestPrincipalsGuestKey: index("idx_guest_principals_guest_key").on(table.guestKey),
  }),
);

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(users, {
    fields: [authAccounts.userId],
    references: [users.id],
  }),
}));

export const passwordCredentialsRelations = relations(passwordCredentials, ({ one }) => ({
  user: one(users, {
    fields: [passwordCredentials.userId],
    references: [users.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [userRoles.organizationId],
    references: [organizations.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id],
  }),
  grantedByUser: one(users, {
    fields: [userPermissions.grantedBy],
    references: [users.id],
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const organizationMembershipsRelations = relations(organizationMemberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMemberships.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMemberships.userId],
    references: [users.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export type AuthAccount = typeof authAccounts.$inferSelect;
export type NewAuthAccount = typeof authAccounts.$inferInsert;
export type PasswordCredential = typeof passwordCredentials.$inferSelect;
export type NewPasswordCredential = typeof passwordCredentials.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type UserRoleAssignment = typeof userRoles.$inferSelect;
export type NewUserRoleAssignment = typeof userRoles.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMembership = typeof organizationMemberships.$inferSelect;
export type NewOrganizationMembership = typeof organizationMemberships.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type GuestPrincipal = typeof guestPrincipals.$inferSelect;
export type NewGuestPrincipal = typeof guestPrincipals.$inferInsert;
