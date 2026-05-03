/**
 * Domain Entity: User
 *
 * Represents a user account with name split into first/last
 * for proper display and address form pre-filling.
 */

import {
  type PermissionCode,
  type RoleId,
  type LinkedAuthAccount,
  type OrganizationMembership,
  type SavedPaymentMethod,
} from '@findeg/db';
import { type InferSelectModel } from 'drizzle-orm';
import { users } from '@findeg/db/schema';



/**
 * Domain Entity: User
 *
 * Extends the baseline database model with domain-specific associations
 * and authorization context.
 */
export interface User extends InferSelectModel<typeof users> {
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
