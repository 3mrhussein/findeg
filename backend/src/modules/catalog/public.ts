import type {
  CatalogLocale,
  InventoryAdjustment,
  ProductVariantInput,
  ProductVariantUpdate,
  StorefrontVariant,
} from './contracts.js';

export interface CatalogStore {
  createActiveVariant(input: ProductVariantInput): Promise<number | undefined>;
  updateActiveVariant(input: ProductVariantUpdate): Promise<boolean>;
  hasActiveVariant(variantId: number): Promise<boolean>;
  listActiveVariants(locale: CatalogLocale): Promise<readonly StorefrontVariant[]>;
}

export interface InventoryStore {
  adjustOnHand(
    input: InventoryAdjustment,
  ): Promise<'adjusted' | 'insufficient-stock' | 'not-found'>;
  availabilityFor(variantIds: readonly number[]): Promise<ReadonlyMap<number, number>>;
}

function validText(value: unknown): value is { en: string; ar: string } {
  return (
    !!value &&
    typeof value === 'object' &&
    'en' in value &&
    'ar' in value &&
    typeof value.en === 'string' &&
    value.en.trim().length > 0 &&
    typeof value.ar === 'string' &&
    value.ar.trim().length > 0
  );
}

function validMoney(value: string) {
  return /^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) >= 0;
}

export function isProductVariantInput(value: unknown): value is ProductVariantInput {
  const candidate = value as Record<string, unknown>;
  return (
    !!value &&
    typeof value === 'object' &&
    'productId' in value &&
    Number.isSafeInteger(candidate.productId) &&
    (candidate.productId as number) > 0 &&
    'sku' in value &&
    typeof value.sku === 'string' &&
    value.sku.trim().length > 0 &&
    'variantKey' in value &&
    typeof value.variantKey === 'string' &&
    value.variantKey.trim().length > 0 &&
    'label' in value &&
    validText(value.label) &&
    'basePrice' in value &&
    typeof value.basePrice === 'string' &&
    validMoney(value.basePrice) &&
    'isActive' in value &&
    typeof value.isActive === 'boolean'
  );
}

export function isProductVariantUpdate(value: unknown): value is ProductVariantUpdate {
  const candidate = value as Record<string, unknown>;
  return (
    isProductVariantInput({ ...(candidate as object), productId: 1 }) &&
    !!value &&
    typeof value === 'object' &&
    'variantId' in candidate &&
    Number.isSafeInteger(candidate.variantId) &&
    (candidate.variantId as number) > 0
  );
}

export function isInventoryAdjustment(value: unknown): value is InventoryAdjustment {
  const candidate = value as Record<string, unknown>;
  return (
    !!value &&
    typeof value === 'object' &&
    'variantId' in value &&
    Number.isSafeInteger(candidate.variantId) &&
    (candidate.variantId as number) > 0 &&
    'warehouseId' in value &&
    Number.isSafeInteger(candidate.warehouseId) &&
    (candidate.warehouseId as number) > 0 &&
    'quantityDelta' in value &&
    Number.isSafeInteger(value.quantityDelta) &&
    value.quantityDelta !== 0 &&
    'actorId' in value &&
    Number.isSafeInteger(candidate.actorId) &&
    (candidate.actorId as number) > 0 &&
    (!('notes' in value) || value.notes === undefined || typeof value.notes === 'string')
  );
}

/** Catalog owns variant validity; Inventory owns atomic stock changes and availability. */
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
      const variants = await catalog.listActiveVariants(locale);
      const available = await inventory.availabilityFor(variants.map((variant) => variant.id));
      return variants.map((variant) => ({
        ...variant,
        available: Math.max(available.get(variant.id) ?? 0, 0),
      }));
    },
  };
}
