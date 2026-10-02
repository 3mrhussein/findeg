import type { SchoolSupplyListRow } from '@findeg/db/schema';

/** Localized text as stored on a list (`en` and `ar`, either may be absent). */
type TranslationMap = SchoolSupplyListRow['localizedTitle'];

export type PublicSupplyListStatus = 'published' | 'archived';

export interface PublicSupplyListVariant {
  variantId: number;
  sku: string;
  name: TranslationMap;
  variantLabel: TranslationMap;
  brand: TranslationMap | null;
  /** Informational base price as a decimal string; the checkout quote is authoritative. */
  price: string;
  /** Available quantity summed across active warehouses is at least 1. */
  inStock: boolean;
}

export interface PublicSupplyListEligibleVariant extends PublicSupplyListVariant {
  /** Attribute key → value, only where this variant differs from the item's default. */
  differingAttributes: Record<string, string>;
}

export interface PublicSupplyListItem {
  id: number;
  required: boolean;
  quantity: number;
  exactItem: boolean;
  specification: { categoryId: number; attributes: Record<string, string> } | null;
  label: TranslationMap;
  note: TranslationMap | null;
  defaultVariant: PublicSupplyListVariant;
  eligibleVariants: PublicSupplyListEligibleVariant[];
}

export interface PublicSupplyList {
  publicCode: string;
  status: PublicSupplyListStatus;
  grade: string;
  academicYear: string;
  title: TranslationMap;
  description: TranslationMap | null;
  heroImageUrl: string | null;
  school: { id: number; nameEn: string; nameAr: string; logoUrl: string | null };
  /** Set when an archived list was replaced by a newer one. */
  replacementPublicCode: string | null;
  /** Reserved for the List Offer (ADR-0007); always `null` until that spec lands. */
  offer: null;
  items: PublicSupplyListItem[];
}

export type PublicSupplyListResult =
  { success: true; data: PublicSupplyList } | { success: false; error: 'not-found' };

/** Anonymous, live (uncached) read of a published or archived list by its public code. */
export interface ISchoolSupplyListReader {
  getByPublicCode(publicCode: string): Promise<PublicSupplyListResult>;
}
