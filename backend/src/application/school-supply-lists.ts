import type { TransactionRunner } from './transactions.js';
import {
  createIdentityAccess,
  type IdentityStore,
  type IdentitySecurity,
} from '@findeg/backend/modules/identity-access/public';
import {
  createPartnerManagement,
  type PartnerStore,
  type PartnerSecurity,
} from '@findeg/backend/modules/partner-management/public';
import type { PartnerSession } from '@findeg/backend/modules/partner-management/contracts';
import type { CatalogStore, CatalogListStore } from '@findeg/backend/modules/catalog/public';
import {
  createSchoolSupplyLists,
  type SchoolSupplyListStore,
} from '@findeg/backend/modules/school-supply-lists/public';
import type {
  SchoolSupplyListInput,
  SchoolSupplyListItemInput,
} from '@findeg/backend/modules/school-supply-lists/contracts';

interface SchoolSupplyListStores {
  identity: IdentityStore;
  partners: PartnerStore;
  catalog: CatalogStore;
  listCatalog: CatalogListStore;
  schoolSupplyLists: SchoolSupplyListStore;
}

/** Identity, Partner Membership and the List mutation share one transaction. */
export function createSchoolSupplyListOperations(
  transactions: TransactionRunner<SchoolSupplyListStores>,
  security: IdentitySecurity & PartnerSecurity,
) {
  const lists = (stores: SchoolSupplyListStores) =>
    createSchoolSupplyLists(
      stores.schoolSupplyLists,
      stores.catalog,
      createPartnerManagement(stores.partners, security),
      stores.listCatalog,
    );
  async function run<Value extends { status: string }>(
    operation: (stores: SchoolSupplyListStores) => Promise<Value>,
  ): Promise<Value> {
    const result = await transactions.run<Value, Value>(async (stores) => {
      const value = await operation(stores);
      // Authorization Denial writes no List data; retain its authoritative session refresh.
      return ['created', 'updated', 'published', 'found', 'authorization-denied'].includes(
        value.status,
      )
        ? { ok: true, value }
        : { ok: false, error: value };
    });
    return result.ok ? result.value : result.error;
  }
  async function authenticated<Value extends { status: string }>(
    token: string | undefined,
    partnerId: number,
    operation: (
      lists: ReturnType<typeof createSchoolSupplyLists>,
      session: PartnerSession,
    ) => Promise<Value>,
  ) {
    // Reject untyped callers passing a fabricated Current Session before hashing credentials.
    if (typeof token !== 'string' || !token) return { status: 'authentication-required' } as const;
    return run(async (stores) => {
      const identity = await createIdentityAccess(stores.identity, security).currentSession(
        token,
        'storefront',
      );
      if (identity.status !== 'authenticated') return identity;
      if (!Number.isSafeInteger(partnerId) || partnerId <= 0)
        return { status: 'invalid-input' } as const;
      // Partner access writers hold this same lock, preserving membership through the mutation.
      await stores.partners.lockPartner(partnerId);
      const access = await createPartnerManagement(stores.partners, security).workspace(
        { ...identity.session, activePortal: 'partner' },
        partnerId,
      );
      if (access.status !== 'authenticated') return access;
      return operation(lists(stores), access.session);
    });
  }
  return {
    createDraft: (token: string | undefined, partnerId: number, input: SchoolSupplyListInput) =>
      authenticated(token, partnerId, (lists, session) =>
        lists.createDraft(session, partnerId, input),
      ),
    replaceDraft: (
      token: string | undefined,
      partnerId: number,
      listId: number,
      items: readonly SchoolSupplyListItemInput[],
    ) =>
      authenticated(token, partnerId, (lists, session) =>
        lists.replaceDraft(session, partnerId, listId, items),
      ),
    publish: (
      token: string | undefined,
      partnerId: number,
      listId: number,
      replacesListId?: number,
    ) =>
      authenticated(token, partnerId, (lists, session) =>
        lists.publish(session, partnerId, listId, replacesListId),
      ),
    clone: (token: string | undefined, partnerId: number, listId: number) =>
      authenticated(token, partnerId, (lists, session) => lists.clone(session, partnerId, listId)),
    readUnlisted: (code: string) => run((stores) => lists(stores).readUnlisted(code)),
  };
}
