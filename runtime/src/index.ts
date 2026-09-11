import {
  createIdentityAccess,
  createSessionLifecycle,
  createStaffAccess,
} from '@findeg/backend/modules/identity-access/public';
import type {
  Portal,
  StaffPermission,
  StaffRole,
} from '@findeg/backend/modules/identity-access/contracts';
import { bindIdentityStore } from '@findeg/backend/modules/identity-access/infrastructure/persistence';
import { createIdentitySecurity } from '@findeg/backend/modules/identity-access/infrastructure/security';
import { createTransactionRuntime } from './transactions.js';
import { readWebConfig } from './config.js';

export function createWebRuntime(environment: Readonly<Record<string, string | undefined>>) {
  const config = readWebConfig(environment);
  const persistence = createTransactionRuntime(
    { url: config.DATABASE_URL, ssl: config.DB_SSL, max: 5 },
    bindIdentityStore,
  );
  const security = createIdentitySecurity();
  async function run<Value>(
    operation: (store: ReturnType<typeof bindIdentityStore>) => Promise<Value>,
  ): Promise<Value> {
    const result = await persistence.transactions.run(async (store) => ({
      ok: true,
      value: await operation(store),
    }));
    if (!result.ok) throw new Error('Unexpected transaction rejection');
    return result.value;
  }
  const currentSession = (token: string | undefined, portal: Portal) =>
    // Public anonymous requests require no database connection.
    token
      ? run((store) => createIdentityAccess(store, security).currentSession(token, portal))
      : Promise.resolve({ status: 'authentication-required' } as const);
  return {
    currentSession,
    authorize: (token: string | undefined, portal: Portal, permission: StaffPermission) =>
      run((store) => createIdentityAccess(store, security).authorize(token, portal, permission)),
    signIn: (email: string, password: string) =>
      run((store) => createSessionLifecycle(store, security).signIn(email, password)),
    signOut: (token: string | undefined) =>
      run((store) => createSessionLifecycle(store, security).signOut(token)),
    async enterPortal(portal: Portal, token?: string) {
      if (portal === 'storefront') return 'allowed' as const;
      const result = await currentSession(token, portal);
      return result.status === 'authenticated' ? ('allowed' as const) : result.status;
    },
    updateStaffAccess: (
      token: string | undefined,
      portal: Portal,
      userId: number,
      roles: readonly StaffRole[],
      isActive: boolean,
    ) =>
      run((store) =>
        createStaffAccess(store, security).updateStaffAccess(
          token,
          portal,
          userId,
          roles,
          isActive,
        ),
      ),
    close: persistence.close,
    health: () => ({ process: 'web', revision: config.RELEASE_REVISION, status: 'alive' }),
  };
}

export type { Portal } from '@findeg/backend/modules/identity-access/contracts';
export { isStaffRole } from '@findeg/backend/modules/identity-access/public';
