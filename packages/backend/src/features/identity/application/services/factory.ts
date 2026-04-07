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

/**
 * Create identity services with all dependencies wired
 * 
 * @returns Object containing all identity service instances
 * 
 * @example
 * ```ts
 * // In app data layer (dashboard/src/data/users/queries.ts):
 * "use cache";
 * import { createIdentityServices } from '@findeg/backend/features/identity';
 * 
 * export async function getAdmins() {
 *   cacheTag('admins');
 *   cacheLife('minutes');
 *   
 *   const { adminUsers } = createIdentityServices();
 *   return await adminUsers.listAdmins();
 * }
 * ```
 */
export function createIdentityServices() {
  // Create repositories (no arguments - they use singleton db connection)
  const userRepository = new DrizzleUserRepository();
  
  // Create services (inject dependencies)
  return {
    auth: new AuthService(userRepository),
    permissions: new PermissionService(userRepository),
    jwt: new JWTService(), // Uses env vars for secrets
    adminUsers: new AdminUserService(),
    adminRoles: new AdminRoleService(),
  };
}

/**
 * Type helper for identity services
 */
export type IdentityServices = ReturnType<typeof createIdentityServices>;
