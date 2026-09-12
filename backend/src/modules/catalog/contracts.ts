export type CatalogLocale = 'en' | 'ar';

export interface LocalizedText {
  readonly en: string;
  readonly ar: string;
}

export interface ProductVariantInput {
  readonly productId: number;
  readonly sku: string;
  readonly variantKey: string;
  readonly label: LocalizedText;
  readonly basePrice: string;
  readonly isActive: boolean;
}

export interface ProductVariantUpdate {
  readonly variantId: number;
  readonly sku: string;
  readonly variantKey: string;
  readonly label: LocalizedText;
  readonly basePrice: string;
  readonly isActive: boolean;
}

export interface StorefrontVariant {
  readonly id: number;
  readonly sku: string;
  readonly name: string;
  readonly label: string;
  readonly price: string;
}

export interface InventoryAdjustment {
  readonly variantId: number;
  readonly warehouseId: number;
  readonly quantityDelta: number;
  readonly actorId: number;
  readonly notes?: string;
}
