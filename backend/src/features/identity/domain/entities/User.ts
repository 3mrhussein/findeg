/**
 * Domain Entity: User
 *
 * Represents a user account with name split into first/last
 * for proper display and address form pre-filling.
 */

import {
  type PortalRole,
  type PermissionCode,
  type RoleId,
  type LinkedAuthAccount,
  type OrganizationMembership,
  type SavedPaymentMethod,
} from '@findeg/db';

/**
 * Domain Entity: User
 *
 * Represents a user account with domain-specific associations
 * and authorization context. Does not extend database model.
 */
export interface User {
  /** User ID */
  id: number;
  
  /** Unique email address (case-insensitive) */
  email: string;
  
  /** User's first name */
  firstName: string | null;
  
  /** User's last name */
  lastName: string | null;
  
  /** User phone number (Egyptian format) */
  phone: string | null;
  
  /** Phone verification status */
  verifiedPhone: boolean;
  
  /** Portal routing gate (customer, staff, school_staff) */
  portalRole: PortalRole;
  
  /** Email verification date */
  emailVerified: Date | null;
  
  /** User avatar/profile image URL */
  image: string | null;
  
  /** Account activation status */
  isActive: boolean;
  
  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
  
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
}

/**
 * Derives a full name from a user's `firstName` and `lastName`.
 * Falls back to an empty string if neither is provided.
 */
export const getUserFullName = (user: Pick<User, 'firstName' | 'lastName'>) => {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
};
