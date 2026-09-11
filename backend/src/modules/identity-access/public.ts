import type {
  CurrentSession,
  Portal,
  SessionResolution,
  StaffPermission,
  StaffRole,
} from './contracts.js';

export interface ActiveUser {
  readonly id: number;
  readonly email: string;
  readonly isActive: boolean;
  readonly authorizationVersion: number;
  readonly staffRoles: readonly StaffRole[];
}
export interface StoredSession {
  readonly userId: number;
  readonly expiresAt: Date;
  readonly authorizationVersion: number;
}
export interface SessionStore {
  readSession(digest: string): Promise<StoredSession | undefined>;
  readUser(id: number): Promise<ActiveUser | undefined>;
  refreshSession(digest: string, version: number): Promise<void>;
}
export interface SessionSecurity {
  digest(token: string): string;
  now(): Date;
}
const rolePermissions: Readonly<Record<StaffRole, readonly StaffPermission[]>> = {
  'access-administrator': ['back-office.enter', 'staff-access.manage'],
  'catalog-manager': ['back-office.enter', 'catalog.manage'],
  'fulfillment-operator': ['back-office.enter', 'fulfillment.manage'],
  'finance-manager': ['back-office.enter', 'finance.manage'],
};

/** Resolve authoritative access for every operation; no caller-supplied snapshot authorizes work. */
export function createIdentityAccess(store: SessionStore, security: SessionSecurity) {
  async function currentSession(
    token: string | undefined,
    portal: Portal,
  ): Promise<SessionResolution> {
    if (!token) return { status: 'authentication-required' };
    const digest = security.digest(token);
    const stored = await store.readSession(digest);
    if (!stored || stored.expiresAt <= security.now()) return { status: 'authentication-required' };
    const user = await store.readUser(stored.userId);
    if (!user?.isActive || !(await store.readSession(digest)))
      return { status: 'authentication-required' };
    if (stored.authorizationVersion !== user.authorizationVersion)
      await store.refreshSession(digest, user.authorizationVersion);
    const staffRoles = portal === 'back-office' ? [...user.staffRoles] : [];
    const permissions = [...new Set(staffRoles.flatMap((role) => rolePermissions[role]))];
    const session: CurrentSession = {
      userId: user.id,
      email: user.email,
      activePortal: portal,
      authorizationVersion: user.authorizationVersion,
      staffRoles,
      permissions,
    };
    // Partner eligibility belongs to Partner Management (#56); staff grants never confer it.
    if (
      portal === 'partner' ||
      (portal === 'back-office' && !permissions.includes('back-office.enter'))
    )
      return { status: 'authorization-denied', session };
    return { status: 'authenticated', session };
  }
  async function authorize(
    token: string | undefined,
    portal: Portal,
    permission: StaffPermission,
  ): Promise<SessionResolution> {
    const result = await currentSession(token, portal);
    if (result.status !== 'authenticated') return result;
    return result.session.permissions.includes(permission)
      ? result
      : { status: 'authorization-denied', session: result.session };
  }
  return { currentSession, authorize };
}

export interface IdentityStore extends SessionStore {
  findCredentials(email: string): Promise<{ userId: number; passwordHash: string } | undefined>;
  insertSession(digest: string, session: StoredSession): Promise<void>;
  deleteSession(digest: string): Promise<void>;
  updateStaffAccess(
    userId: number,
    roles: readonly StaffRole[],
    isActive: boolean,
  ): Promise<boolean>;
}
export interface IdentitySecurity extends SessionSecurity {
  newToken(): string;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
export function createSessionLifecycle(store: IdentityStore, security: IdentitySecurity) {
  return {
    async signIn(email: string, password: string) {
      if (
        typeof email !== 'string' ||
        email.length > 255 ||
        typeof password !== 'string' ||
        !password ||
        new TextEncoder().encode(password).length > 72
      )
        return { status: 'invalid-credentials' } as const;
      const credentials = await store.findCredentials(email.trim().toLowerCase());
      if (!credentials || !(await security.verifyPassword(password, credentials.passwordHash)))
        return { status: 'invalid-credentials' } as const;
      const user = await store.readUser(credentials.userId);
      if (!user?.isActive) return { status: 'invalid-credentials' } as const;
      const token = security.newToken();
      const expiresAt = new Date(security.now().getTime() + 1000 * 60 * 60 * 24 * 7);
      await store.insertSession(security.digest(token), {
        userId: user.id,
        authorizationVersion: user.authorizationVersion,
        expiresAt,
      });
      return { status: 'authenticated', token, expiresAt } as const;
    },
    async signOut(token: string | undefined) {
      if (token) await store.deleteSession(security.digest(token));
    },
  };
}

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && Object.hasOwn(rolePermissions, value);
}

/** A Back Office operation; permission checks and writes share one injected transaction. */
export function createStaffAccess(store: IdentityStore, security: IdentitySecurity) {
  const identity = createIdentityAccess(store, security);
  return {
    async updateStaffAccess(
      token: string | undefined,
      portal: Portal,
      userId: number,
      roles: readonly StaffRole[],
      isActive: boolean,
    ) {
      const access = await identity.authorize(token, portal, 'staff-access.manage');
      if (access.status !== 'authenticated') return access;
      if (
        !Number.isSafeInteger(userId) ||
        userId <= 0 ||
        !roles.every(isStaffRole) ||
        typeof isActive !== 'boolean'
      )
        return { status: 'invalid-input' } as const;
      return {
        status: (await store.updateStaffAccess(userId, [...new Set(roles)], isActive))
          ? 'updated'
          : 'not-found',
      } as const;
    },
  };
}
