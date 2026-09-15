import type { LocalizedText, ManageableVariant } from '../catalog/contracts.js';

export type SchoolSupplyListStatus = 'draft' | 'published' | 'archived';

export interface ListItemSpecification {
  readonly categoryId: number;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface SchoolSupplyListItemInput {
  readonly required?: boolean;
  readonly specification?: ListItemSpecification;
  readonly variantId: number;
  readonly quantity: number;
  readonly label: LocalizedText;
  readonly exactItem: boolean;
}

export interface SchoolSupplyListInput {
  readonly classSection?: string;
  readonly academicYear: string;
  readonly schoolName: string;
  readonly grade: string;
  readonly title: LocalizedText;
}

export interface SchoolSupplyListItem {
  readonly required?: boolean;
  readonly specification?: ListItemSpecification;
  readonly id: number;
  readonly variantId: number;
  readonly quantity: number;
  readonly exactItem: boolean;
  readonly productName: LocalizedText;
  readonly sku: string;
  readonly label: LocalizedText;
  readonly unitPrice: string;
}

export interface SchoolSupplyList {
  readonly classSection?: string;
  readonly id: number;
  readonly businessPartnerId: number;
  readonly status: SchoolSupplyListStatus;
  readonly academicYear: string;
  readonly schoolName: string;
  readonly grade: string;
  readonly title: LocalizedText;
  readonly publicCode?: string;
  readonly sourceListId?: number;
  readonly replacesListId?: number;
  readonly replacedById?: number;
  readonly items: readonly SchoolSupplyListItem[];
}

export type Snapshot = ManageableVariant;
