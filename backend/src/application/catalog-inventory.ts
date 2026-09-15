import type { TransactionRunner } from './transactions.js';
import {
  createIdentityAccess,
  type IdentityStore,
  type IdentitySecurity,
} from '@findeg/backend/modules/identity-access/public';
import { InventoryVariantNotFoundError } from '@findeg/backend/modules/inventory/public';
import type { CatalogLocale } from '@findeg/backend/modules/catalog/contracts';
import {
  isProductVariantInput,
  isProductVariantUpdate,
  type CatalogStore,
} from '@findeg/backend/modules/catalog/public';
import {
  isInventoryAdjustment,
  type InventoryStore,
} from '@findeg/backend/modules/inventory/public';

function createCatalogManagement(catalog: CatalogStore, inventory: InventoryStore) {
  return {
    async createVariant(input: unknown) {
      if (!isProductVariantInput(input)) return { status: 'invalid-input' } as const;
      const variantId = await catalog.createActiveVariant(input);
      return variantId === undefined
        ? ({ status: 'product-not-found' } as const)
        : ({ status: 'created', variantId } as const);
    },
    async updateVariant(input: unknown) {
      if (!isProductVariantUpdate(input)) return { status: 'invalid-input' } as const;
      return (await catalog.updateActiveVariant(input))
        ? ({ status: 'updated' } as const)
        : ({ status: 'not-found' } as const);
    },
    async adjustInventory(input: unknown) {
      if (!isInventoryAdjustment(input)) return { status: 'invalid-input' } as const;
      if (!(await catalog.hasActiveVariant(input.variantId)))
        return { status: 'variant-not-found' } as const;
      return { status: await inventory.adjustOnHand(input) } as const;
    },
    async browse(locale: CatalogLocale) {
      const variants = await catalog.listActiveVariants();
      const available = await inventory.availabilityFor(variants.map((variant) => variant.id));
      return variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        name: localized(variant.name, locale),
        label: localized(variant.label, locale),
        price: variant.price,
        ...(variant.strikePrice ? { strikePrice: variant.strikePrice } : {}),
        available: Math.max(available.get(variant.id) ?? 0, 0),
      }));
    },
    async listVariants() {
      return catalog.listVariants();
    },
  };
}

function localized(value: { readonly en?: string; readonly ar?: string }, locale: CatalogLocale) {
  return value[locale] ?? value.en ?? '';
}

interface CatalogStores {
  identity: IdentityStore;
  catalog: CatalogStore;
  inventory: InventoryStore;
}

/** Authorized Catalog and Inventory policy belongs to application coordination. */
export function createCatalogOperations(
  transactions: TransactionRunner<CatalogStores>,
  security: IdentitySecurity,
) {
  async function run<Value>(operation: (stores: CatalogStores) => Promise<Value>) {
    const result = await transactions.run(async (stores) => ({
      ok: true,
      value: await operation(stores),
    }));
    if (!result.ok) throw new Error('Unexpected transaction rejection');
    return result.value;
  }
  async function authorized<Value>(
    token: string | undefined,
    operation: (
      catalog: ReturnType<typeof createCatalogManagement>,
      actorId: number,
    ) => Promise<Value>,
  ) {
    return run(async (stores) => {
      const access = await createIdentityAccess(stores.identity, security).authorize(
        token,
        'back-office',
        'catalog.manage',
      );
      return access.status === 'authenticated'
        ? operation(
            createCatalogManagement(stores.catalog, stores.inventory),
            access.session.userId,
          )
        : access;
    });
  }
  return {
    createVariant: (token: string | undefined, input: unknown) =>
      authorized(token, (catalog) => catalog.createVariant(input)),
    updateVariant: (token: string | undefined, input: unknown) =>
      authorized(token, (catalog) => catalog.updateVariant(input)),
    async adjustInventory(token: string | undefined, input: unknown) {
      try {
        return await authorized(token, (catalog, actorId) =>
          catalog.adjustInventory({ ...(input as object), actorId }),
        );
      } catch (error) {
        // Translate only after the transaction rolls back the failed adjustment.
        if (error instanceof InventoryVariantNotFoundError)
          return { status: 'variant-not-found' } as const;
        throw error;
      }
    },
    listVariants: (token: string | undefined) =>
      authorized(token, (catalog) => catalog.listVariants()),
    browse: (locale: CatalogLocale) =>
      run((stores) => createCatalogManagement(stores.catalog, stores.inventory).browse(locale)),
  };
}
