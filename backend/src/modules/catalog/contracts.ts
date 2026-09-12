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
  readonly strikePrice?: string;
  readonly isActive: boolean;
}

export interface ProductVariantUpdate {
  readonly variantId: number;
  readonly sku: string;
  readonly variantKey: string;
  readonly label: LocalizedText;
  readonly basePrice: string;
  readonly strikePrice?: string;
  readonly isActive: boolean;
}

export interface StorefrontVariant {
  readonly id: number;
  readonly sku: string;
  readonly name: string;
  readonly label: string;
  readonly price: string;
  readonly strikePrice?: string;
}

export interface LocalizedStorefrontVariant {
  readonly id: number;
  readonly sku: string;
  readonly name: { readonly en?: string; readonly ar?: string };
  readonly label: { readonly en?: string; readonly ar?: string };
  readonly price: string;
  readonly strikePrice?: string;
}

export interface ManageableVariant {
  readonly id: number;
  readonly productId: number;
  readonly productName: LocalizedText;
  readonly sku: string;
  readonly variantKey: string;
  readonly label: LocalizedText;
  readonly basePrice: string;
  readonly strikePrice?: string;
  readonly isActive: boolean;
}
