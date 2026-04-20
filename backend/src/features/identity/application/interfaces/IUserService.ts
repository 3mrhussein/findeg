/**
 * User Service Interface
 *
 * Manages all user-related business logic, including administrative tasks,
 * profile management, and dashboard data aggregation.
 */

import type { User } from "../../domain/entities/User";
import type { Order } from "../../../order/domain/entities/Order";
import type { Product } from "../../../catalog/domain/entities/Product";
import type { SchoolListResult } from "../../../catalog/application/interfaces/ISchoolListRepository";

export interface AdminUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roles: { id: number; code: string; name: string }[];
  permissionOverrides: { permissionCode: string; action: "grant" | "revoke" }[];
  createdAt: Date;
}

export interface CreateAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds: number[];
}

export interface UpdateAdminInput {
  firstName?: string;
  lastName?: string;
  roleIds?: number[];
  isActive?: boolean;
}

export interface PermissionOverrideInput {
  permissionId: number;
  action: "grant" | "revoke";
}

export interface DashboardData {
  products: Product[];
  orders: Order[];
  schoolLists: SchoolListResult[];
}

export interface IUserService {
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

  /**
   * Retrieves profile and order summary for the "My Account" page.
   */
  getProfileData(userId: number): Promise<{ user: User; orders: Order[] }>;

  /**
   * Aggregates data for the user dashboard (products, orders, school lists).
   */
  getDashboardData(locale: string, userId: number): Promise<DashboardData>;
}
