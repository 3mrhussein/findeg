/**
 * Domain Entity: User
 *
 * Represents a user account with name split into first/last
 * for proper display and address form pre-filling.
 */

import { ID, Email, PortalRole } from "@findeg/backend/features/core/domain/types/common";
import type {
  AuthProvider,
  PaymentProvider,
  PermissionCode,
  RoleId,
  RoleScope,
} from "@findeg/backend/features/core/domain/value-objects";

export interface LinkedAuthAccount {
  id: string;
  provider: AuthProvider;
  providerAccountId: string;
  isPrimary?: boolean;
}

export interface UserRoleGrant {
  roleId: RoleId;
  scope: RoleScope;
  organizationId?: string;
  permissionCodes?: PermissionCode[];
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  status: "active" | "invited" | "suspended";
  roleGrants: UserRoleGrant[];
}

export interface SavedPaymentMethod {
  id: string;
  provider: PaymentProvider;
  tokenReference: string;
  isDefault: boolean;
}

export interface User {
  /** Unique identifier for the user */
  id: ID;
  /** Primary contact and login email */
  email: Email;
  /** User's given name */
  firstName?: string | null;
  /** User's family name */
  lastName?: string | null;
  /** Egyptian mobile number (formatted for SMS/WhatsApp) */
  phone?: string | null;
  /** Portal routing gate: 'customer', 'staff', 'school_staff' */
  portalRole: PortalRole;
  /** Additive role IDs for permission-based model migration */
  roleIds?: RoleId[];
  /** Additive permission codes for resolved/flattened authorization checks */
  permissionCodes?: PermissionCode[];
  /** Linked authentication identities (credentials + oauth providers) */
  linkedAccounts?: LinkedAuthAccount[];
  /** Business/tenant memberships with scoped roles */
  memberships?: OrganizationMembership[];
  /** Tokenized saved payment methods */
  paymentMethods?: SavedPaymentMethod[];
  /** URL to profile picture */
  image?: string;
  /** Whether the account is active or suspended */
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Derives a full name from a user's `firstName` and `lastName`.
 * Falls back to an empty string if neither is provided.
 */
export const getUserFullName = (user: Pick<User, "firstName" | "lastName">) => {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
};
