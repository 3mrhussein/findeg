import type {
  CatalogLocale,
  LocalizedStorefrontVariant,
  ManageableVariant,
  ProductVariantInput,
  ProductVariantUpdate,
  StorefrontVariant,
} from './contracts.js';

export interface CatalogStore {
  createActiveVariant(input: ProductVariantInput): Promise<number | undefined>;
  updateActiveVariant(input: ProductVariantUpdate): Promise<boolean>;
  hasActiveVariant(variantId: number): Promise<boolean>;
  isDefaultVariant(variantId: number): Promise<boolean>;
  listActiveVariants(): Promise<readonly LocalizedStorefrontVariant[]>;
  listVariants(): Promise<readonly ManageableVariant[]>;
}

export interface CatalogCheckoutStore {
  readEligible(variantIds: readonly number[]): Promise<readonly LocalizedStorefrontVariant[]>;
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
    (!('strikePrice' in value) ||
      value.strikePrice === undefined ||
      (typeof value.strikePrice === 'string' && validMoney(value.strikePrice))) &&
    'isActive' in value &&
    value.isActive === true
  );
}

export function isProductVariantUpdate(value: unknown): value is ProductVariantUpdate {
  const candidate = value as Record<string, unknown>;
  return (
    isProductVariantInput({ ...(candidate as object), productId: 1, isActive: true }) &&
    !!value &&
    typeof value === 'object' &&
    'isActive' in candidate &&
    typeof candidate.isActive === 'boolean' &&
    'variantId' in candidate &&
    Number.isSafeInteger(candidate.variantId) &&
    (candidate.variantId as number) > 0
  );
}

export interface CatalogListStore {
  readEligible(): Promise<readonly import('./contracts.js').ListCatalogVariant[]>;
}
