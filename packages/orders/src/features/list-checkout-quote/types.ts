import type { Quote } from '@findeg/domain';

export interface CatalogVariantMetadata {
  id: number;
  productId: number;
  sku: string;
  localizedLabel: unknown;
  productName: unknown;
}

export interface ListAttribution {
  schoolSupplyListId: number;
  schoolSupplyListPublicCode: string;
  schoolSupplyListPublishedAt: Date;
  businessPartnerId: number;
  items: Map<number, { defaultVariantId: number; exactItem: boolean }>;
  /** Basis points of the List Offer active at acceptance time, or null when none applies. */
  listOfferBasisPoints: number | null;
}

export interface ListQuoteCalculation {
  quote: Quote;
  variantMap: Map<number, CatalogVariantMetadata>;
  attribution: ListAttribution;
}
