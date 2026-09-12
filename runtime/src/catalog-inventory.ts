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

export function createCatalogManagement(catalog: CatalogStore, inventory: InventoryStore) {
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
