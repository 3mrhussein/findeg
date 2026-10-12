import type { BusinessPartnerStatus } from '../partners';
import type { SchoolSupplyList, SchoolSupplyListItem } from './index';
import { assertStaffListAuthoring } from './staff-authoring';
import { SupplyListError } from './supply-list-error';

/** A new draft list before it is stored and given an id. */
export type SupplyListDraft = Omit<SchoolSupplyList, 'id'>;

/** An item of a new draft before it is stored: the authoring fields only. */
export type SupplyListItemDraft = Omit<SchoolSupplyListItem, 'id' | 'supplyListId'>;

export interface SupplyListClone {
  list: SupplyListDraft;
  /** In the source's order. */
  items: SupplyListItemDraft[];
}

/**
 * Throws unless Staff may edit this list or its items now: the partner's status must allow
 * drafting (`PARTNER_STATUS_NOT_ALLOWED`), then the list must be a draft (`NOT_DRAFT`).
 */
export function assertDraftEditable(
  list: SchoolSupplyList,
  partnerStatus: BusinessPartnerStatus,
): void {
  assertStaffListAuthoring(partnerStatus, 'draft');
  if (list.status !== 'draft') {
    throw new SupplyListError(
      'NOT_DRAFT',
      `Only a draft list can be edited; this one is ${list.status}`,
    );
  }
}

/**
 * Copies a published or archived list into a fresh draft that records its source. Only the
 * authoring fields are copied: never ids, the public code or the replacement chain. A copy of
 * an older version cannot later displace a newer list (see `publishSupplyList`).
 */
export function cloneSupplyList(
  source: SchoolSupplyList,
  items: readonly SchoolSupplyListItem[],
  partnerStatus: BusinessPartnerStatus,
): SupplyListClone {
  assertStaffListAuthoring(partnerStatus, 'draft');
  if (source.status === 'draft') {
    throw new SupplyListError('INVALID_TRANSITION', 'A draft list cannot be cloned');
  }
  return {
    list: {
      businessPartnerId: source.businessPartnerId,
      academicYear: source.academicYear,
      grade: source.grade,
      title: { ...source.title },
      status: 'draft',
      publicCode: null,
      sourceListId: source.id,
      replacesListId: null,
      replacedById: null,
    },
    items: items.map((item) => ({
      defaultVariantId: item.defaultVariantId,
      specification:
        item.specification === null
          ? null
          : {
              categoryId: item.specification.categoryId,
              attributes: { ...item.specification.attributes },
            },
      required: item.required,
      quantity: item.quantity,
    })),
  };
}

/**
 * Archives a published list, optionally recording the list that replaced it. Archiving never
 * depends on the partner's status, and an archived list is never un-archived.
 */
export function archiveSupplyList(
  list: SchoolSupplyList,
  replacedById: SchoolSupplyList['replacedById'] = null,
): SchoolSupplyList {
  if (list.status !== 'published') {
    throw new SupplyListError(
      'INVALID_TRANSITION',
      `Only a published list can be archived; this one is ${list.status}`,
    );
  }
  return { ...list, status: 'archived', replacedById };
}
