import { createPartnerOperations } from '@findeg/backend/partner-operations';
import { bindPartnerStore } from '@findeg/backend/modules/partner-management/infrastructure/persistence';
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
import { createCatalogManagement } from '@findeg/backend/modules/catalog/public';
import { bindCatalogStore } from '@findeg/backend/modules/catalog/infrastructure/persistence';
import { bindInventoryStore } from '@findeg/backend/modules/inventory/infrastructure/persistence';
import { createTransactionRuntime } from './transactions.js';
import { readWebConfig } from './config.js';

export function createWebRuntime(environment: Readonly<Record<string, string | undefined>>) {
  const config = readWebConfig(environment);
  const persistence = createTransactionRuntime(
    { url: config.DATABASE_URL, ssl: config.DB_SSL, max: 5 },
    (database) => ({
      identity: bindIdentityStore(database),
      partners: bindPartnerStore(database),
      catalog: bindCatalogStore(database),
      inventory: bindInventoryStore(database),
    }),
  );
  const security = {
    ...createIdentitySecurity(),
    invitationLifetimeMs: config.PARTNER_INVITATION_DAYS * 24 * 60 * 60 * 1000,
  };
  async function run<Value>(
    operation: (stores: {
      identity: ReturnType<typeof bindIdentityStore>;
      partners: ReturnType<typeof bindPartnerStore>;
      catalog: ReturnType<typeof bindCatalogStore>;
      inventory: ReturnType<typeof bindInventoryStore>;
    }) => Promise<Value>,
  ): Promise<Value> {
    const result = await persistence.transactions.run(async (store) => ({
      ok: true,
      value: await operation(store),
    }));
    if (!result.ok) throw new Error('Unexpected transaction rejection');
    return result.value;
  }
  const currentSession = (token: string | undefined, portal: Portal, partnerId?: number) =>
    // Public anonymous requests require no database connection.
    token
      ? run(async (store) =>
          portal === 'partner'
            ? createPartnerOperations(store, security).currentSession(token, partnerId)
            : createIdentityAccess(store.identity, security).currentSession(token, portal),
        )
      : Promise.resolve({ status: 'authentication-required' } as const);
  return {
    currentSession,
    partners: {
      currentSession: (token: string | undefined, partnerId?: number) =>
        token
          ? run((store) =>
              createPartnerOperations(store, security).currentSession(token, partnerId),
            )
          : Promise.resolve({ status: 'authentication-required' } as const),
      accessOverview: (
        ...args: Parameters<ReturnType<typeof createPartnerOperations>['accessOverview']>
      ) => run((store) => createPartnerOperations(store, security).accessOverview(...args)),
      revokeInvitation: (
        ...args: Parameters<ReturnType<typeof createPartnerOperations>['revokeInvitation']>
      ) => run((store) => createPartnerOperations(store, security).revokeInvitation(...args)),
      updateMembership: (
        ...args: Parameters<ReturnType<typeof createPartnerOperations>['updateMembership']>
      ) => run((store) => createPartnerOperations(store, security).updateMembership(...args)),
      createPartner: (
        ...args: Parameters<ReturnType<typeof createPartnerOperations>['createPartner']>
      ) => run((store) => createPartnerOperations(store, security).createPartner(...args)),
      changePartnerStatus: (
        ...args: Parameters<ReturnType<typeof createPartnerOperations>['changePartnerStatus']>
      ) => run((store) => createPartnerOperations(store, security).changePartnerStatus(...args)),
      invite: (...args: Parameters<ReturnType<typeof createPartnerOperations>['invite']>) =>
        run((store) => createPartnerOperations(store, security).invite(...args)),
      acceptInvitation: (
        ...args: Parameters<ReturnType<typeof createPartnerOperations>['acceptInvitation']>
      ) => run((store) => createPartnerOperations(store, security).acceptInvitation(...args)),
    },
    authorize: (token: string | undefined, portal: Portal, permission: StaffPermission) =>
      run((store) =>
        createIdentityAccess(store.identity, security).authorize(token, portal, permission),
      ),
    signIn: (email: string, password: string) =>
      run((store) => createSessionLifecycle(store.identity, security).signIn(email, password)),
    signOut: (token: string | undefined) =>
      run((store) => createSessionLifecycle(store.identity, security).signOut(token)),
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
        createStaffAccess(store.identity, security).updateStaffAccess(
          token,
          portal,
          userId,
          roles,
          isActive,
        ),
      ),
    async createCatalogVariant(token: string | undefined, input: unknown) {
      return run(async (stores) => {
        const access = await createIdentityAccess(stores.identity, security).authorize(
          token,
          'back-office',
          'catalog.manage',
        );
        return access.status === 'authenticated'
          ? createCatalogManagement(stores.catalog, stores.inventory).createVariant(input)
          : access;
      });
    },
    async updateCatalogVariant(token: string | undefined, input: unknown) {
      return run(async (stores) => {
        const access = await createIdentityAccess(stores.identity, security).authorize(
          token,
          'back-office',
          'catalog.manage',
        );
        return access.status === 'authenticated'
          ? createCatalogManagement(stores.catalog, stores.inventory).updateVariant(input)
          : access;
      });
    },
    async adjustInventory(token: string | undefined, input: unknown) {
      return run(async (stores) => {
        const access = await createIdentityAccess(stores.identity, security).authorize(
          token,
          'back-office',
          'catalog.manage',
        );
        return access.status === 'authenticated'
          ? createCatalogManagement(stores.catalog, stores.inventory).adjustInventory({
              ...(input as object),
              actorId: access.session.userId,
            })
          : access;
      });
    },
    browseCatalog: (locale: 'en' | 'ar') =>
      run((stores) => createCatalogManagement(stores.catalog, stores.inventory).browse(locale)),
    close: persistence.close,
    health: () => ({ process: 'web', revision: config.RELEASE_REVISION, status: 'alive' }),
  };
}

export type { Portal } from '@findeg/backend/modules/identity-access/contracts';
export { isStaffRole } from '@findeg/backend/modules/identity-access/public';

export { isPartnerRole } from '@findeg/backend/modules/partner-management/public';
