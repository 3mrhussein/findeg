import { createOrderLifecycle } from '@findeg/backend/order-lifecycle';
import { createRewardRateOperations } from '@findeg/backend/reward-rates';
import { bindPartnerRewardStore } from '@findeg/backend/modules/partner-rewards/infrastructure/persistence';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { createPartnerOperations } from '@findeg/backend/partner-operations';
import { createListCommerce } from '@findeg/backend/list-commerce';
import { createStorefrontCommerce } from '@findeg/backend/checkout';
import {
  bindOrderLifecycleStore,
  bindCommerceStore,
  bindListSelectionStore,
} from '@findeg/backend/modules/commerce/infrastructure/persistence';
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
import { createCatalogOperations } from '@findeg/backend/catalog-inventory';
import { createSchoolSupplyListOperations } from '@findeg/backend/school-supply-lists';
import {
  bindCatalogListStore,
  bindCatalogCheckoutStore,
  bindCatalogStore,
} from '@findeg/backend/modules/catalog/infrastructure/persistence';
import {
  bindInventoryFulfillment,
  bindInventoryReservations,
  bindInventoryStore,
} from '@findeg/backend/modules/inventory/infrastructure/persistence';
import { bindSchoolSupplyListStore } from '@findeg/backend/modules/school-supply-lists/infrastructure/persistence';
import { createTransactionRuntime } from './transactions.js';
import { readWebConfig } from './config.js';
import { bindCheckoutOutbox } from './checkout-outbox.js';

export function createWebRuntime(environment: Readonly<Record<string, string | undefined>>) {
  const config = readWebConfig(environment);
  const persistence = createTransactionRuntime(
    { url: config.DATABASE_URL, ssl: config.DB_SSL, max: 5 },
    (database) => ({
      orderLifecycle: bindOrderLifecycleStore(database),
      fulfillment: bindInventoryFulfillment(database),
      rewards: bindPartnerRewardStore(database),
      commerce: bindCommerceStore(database),
      selections: bindListSelectionStore(database, config.LIST_SELECTION_INACTIVITY_DAYS),
      listCatalog: bindCatalogListStore(database),
      checkoutCatalog: bindCatalogCheckoutStore(database),
      reservations: bindInventoryReservations(database),
      outbox: bindCheckoutOutbox(database),
      identity: bindIdentityStore(database),
      partners: bindPartnerStore(database),
      catalog: bindCatalogStore(database),
      inventory: bindInventoryStore(database),
      schoolSupplyLists: bindSchoolSupplyListStore(database),
    }),
  );
  const security = {
    ...createIdentitySecurity(),
    invitationLifetimeMs: config.PARTNER_INVITATION_DAYS * 24 * 60 * 60 * 1000,
  };
  const catalog = createCatalogOperations(persistence.transactions, security);
  async function run<Value>(
    operation: (stores: {
      rewards: ReturnType<typeof bindPartnerRewardStore>;
      identity: ReturnType<typeof bindIdentityStore>;
      partners: ReturnType<typeof bindPartnerStore>;
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
    orderLifecycle: createOrderLifecycle(persistence.transactions, security),
    rewardRates: {
      configure: (
        ...args: Parameters<ReturnType<typeof createRewardRateOperations>['configure']>
      ) => run((stores) => createRewardRateOperations(stores, security).configure(...args)),
    },
    listSelectionLifetimeSeconds: config.LIST_SELECTION_INACTIVITY_DAYS * 86400,
    listCommerce: createListCommerce(persistence.transactions, {
      digest: (value) => createHash('sha256').update(value).digest('hex'),
      randomToken: () => randomBytes(32).toString('hex'),
      verificationCode: () => String(randomInt(100000, 1000000)),
    }),
    commerce: createStorefrontCommerce(persistence.transactions, {
      digest: (value) => createHash('sha256').update(value).digest('hex'),
      randomToken: () => randomBytes(32).toString('hex'),
      verificationCode: () => String(randomInt(100000, 1000000)),
    }),
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
    createCatalogVariant: catalog.createVariant,
    updateCatalogVariant: catalog.updateVariant,
    adjustInventory: catalog.adjustInventory,
    listCatalogVariants: catalog.listVariants,
    browseCatalog: catalog.browse,
    schoolSupplyLists: createSchoolSupplyListOperations(persistence.transactions, security),
    close: persistence.close,
    health: () => ({ process: 'web', revision: config.RELEASE_REVISION, status: 'alive' }),
  };
}

export type { Portal } from '@findeg/backend/modules/identity-access/contracts';
export { isStaffRole } from '@findeg/backend/modules/identity-access/public';

export { isPartnerRole } from '@findeg/backend/modules/partner-management/public';
