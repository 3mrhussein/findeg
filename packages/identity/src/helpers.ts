/**
 * Identity composition: wires the identity services and exposes the facade functions the
 * application layers call. Infrastructure (JWT, cookies, session storage) is not wired here.
 */
import { AuthService, type IAuthService } from './features/authentication';
import { PermissionService, type IPermissionService } from './features/permissions';
import {
  AdminUserService,
  type IAdminUserService,
  type UpdateAdminInput,
} from './features/admin-users';
import { AdminRoleService, type IAdminRoleService } from './features/admin-roles';
import { UserService } from './features/accounts';

export interface IdentityServices {
  auth: IAuthService;
  permissions: IPermissionService;
  adminUsers: IAdminUserService;
  adminRoles: IAdminRoleService;
  userService: UserService;
}

/** Creates identity services with their dependencies wired. */
export function createIdentityServices(): IdentityServices {
  return {
    auth: new AuthService(),
    permissions: new PermissionService(),
    adminUsers: new AdminUserService(),
    adminRoles: new AdminRoleService(),
    userService: new UserService(),
  };
}

/** Authenticates with (email, password) or ({ email, password }). */
export async function login(
  ...credentials:
    [email: string, password: string] | [credentials: { email: string; password: string }]
) {
  const { auth } = createIdentityServices();
  if (credentials.length === 1) {
    return auth.login(credentials[0].email, credentials[0].password);
  }
  return auth.login(credentials[0], credentials[1]);
}

export function logout() {
  return Promise.resolve({ success: true });
}

export async function updateMyProfile(userId: number, input: UpdateAdminInput) {
  const { userService } = createIdentityServices();
  return userService.updateAdmin(userId, input);
}

export async function updateProfile(
  userId: number,
  input: { firstName?: string; lastName?: string; phone?: string },
) {
  const { userService } = createIdentityServices();
  return userService.updateProfile(userId, input);
}

export async function getMyAccountData(userId: number) {
  const { userService } = createIdentityServices();
  return userService.getProfileData(userId);
}
