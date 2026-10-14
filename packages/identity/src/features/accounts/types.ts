import type {
  LinkedAuthAccount,
  OrganizationMembership,
  PermissionCode,
  PortalRole,
  RoleId,
  SavedPaymentMethod,
} from '@findeg/db';
import type { Order } from '@findeg/orders';
import type {
  AdminUser,
  CreateAdminInput,
  PermissionOverrideInput,
  UpdateAdminInput,
} from '../admin-users';

/** Customer or Staff account profile. Does not carry the password credential. */
export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  verifiedPhone: boolean;
  portalRole: PortalRole;
  emailVerified: Date | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roleIds?: RoleId[];
  permissionCodes?: PermissionCode[];
  linkedAccounts?: LinkedAuthAccount[];
  memberships?: OrganizationMembership[];
  paymentMethods?: SavedPaymentMethod[];
}

/** A saved Egyptian shipping address. */
export interface Address {
  id: number;
  userId: number;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type HashStrategy = 'bcrypt' | 'argon2';

/** Password credential record. Never serialized to the presentation layer. */
export interface PasswordCredentials {
  userId: number;
  passwordHash: string;
  hashStrategy: HashStrategy;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserService {
  /** Current Customer profile, without Order reads. */
  getProfile(userId: number): Promise<User>;
  /** Returns all users assigned to at least one admin role */
  listAdmins(): Promise<AdminUser[]>;
  /** Returns a single admin user by ID, or null if not found */
  getAdmin(userId: number): Promise<AdminUser | null>;
  /** Creates a new admin user and assigns the given roles */
  createAdmin(input: CreateAdminInput): Promise<AdminUser>;
  /** Updates admin profile and/or role assignments */
  updateAdmin(userId: number, input: UpdateAdminInput): Promise<AdminUser>;
  /** Sets isActive = false; user cannot log in */
  deactivateAdmin(userId: number): Promise<void>;
  /** Replaces per-user permission overrides (upsert all, delete removed) */
  setPermissionOverrides(
    userId: number,
    overrides: PermissionOverrideInput[],
    grantedBy: number,
  ): Promise<void>;
  /** Updates the signed-in user's profile fields */
  updateProfile(
    userId: number,
    input: { firstName?: string; lastName?: string; phone?: string },
  ): Promise<void>;
  /** Profile and order summary for "My Account". */
  getProfileData(userId: number): Promise<{ user: User; orders: Order[] }>;
}
