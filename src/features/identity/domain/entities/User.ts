/**
 * Domain Entity: User
 *
 * Represents a user account with name split into first/last
 * for proper display and address form pre-filling.
 */

import { ID, Email, UserRole } from "@/features/core/domain/types/common";
import type {
  AuthProvider,
  PaymentProvider,
  PermissionCode,
  RoleId,
  RoleScope,
} from "@/features/core/domain/value-objects";

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
  firstName?: string;
  /** User's family name */
  lastName?: string;
  /** Combined or display name fallback */
  name?: string;
  /** Egyptian mobile number (formatted for SMS/WhatsApp) */
  phone?: string;
  /** Access level control (e.g., 'user', 'admin') */
  role: UserRole;
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
