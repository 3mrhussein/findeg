/**
 * Identity Services Factory (Pure TypeScript - Framework Agnostic)
 *
 * Exports factory function that returns identity service instances.
 * Apps call this factory to get services, then wrap service calls in "use cache" directives.
 */

import { DrizzleUserRepository } from "../../infrastructure/persistence/DrizzleUserRepository";
import { AuthService } from "./AuthService";
import { PermissionService } from "./PermissionService";
import { JWTService } from "./JWTService";
import { AdminUserService } from "./AdminUserService";
import { AdminRoleService } from "./AdminRoleService";
import { UserService } from "./UserService";

import { IUserRepository } from "../interfaces/IUserRepository";
import { IAuthService } from "../interfaces/IAuthService";
import { IPermissionService } from "../interfaces/IPermissionService";
import { IJWTService } from "./JWTService";
import { IAdminUserService } from "../interfaces/IAdminUserService";
import { IAdminRoleService } from "../interfaces/IAdminRoleService";

export interface IdentityServices {
  auth: IAuthService;
  users: IUserRepository;
  permissions: IPermissionService;
  jwt: IJWTService;
  adminUsers: IAdminUserService;
  adminRoles: IAdminRoleService;
  userService: UserService;
}

/**
 * Create identity services with all dependencies wired
 */
export function createIdentityServices(): IdentityServices {
  // Create repositories
  const userRepository = new DrizzleUserRepository();

  // Create services
  return {
    auth: new AuthService(userRepository),
    users: userRepository,
    permissions: new PermissionService(userRepository),
    jwt: new JWTService(),
    adminUsers: new AdminUserService(),
    adminRoles: new AdminRoleService(),
    userService: new UserService(userRepository),
  };
}
