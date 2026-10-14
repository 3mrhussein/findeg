import type { VariantId } from '../../../catalog';
import { availableStock, stockLevel, type StockBalance, type Warehouse } from '../../../inventory';
import type { BusinessPartnerStatus } from '../../../partners';
import {
  assertStaffListAuthoring,
  isEligibleVariant,
  SupplyListError,
  type CandidateVariant,
  type PublicCode,
} from '../../helpers';
import type { SchoolSupplyList, SchoolSupplyListItem, SupplyListItemId } from '../../types';
import type { ListOffer } from '../list-offer';

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

export interface PublishSupplyListInput {
  /** The draft to publish. */
  list: SchoolSupplyList;
  items: readonly SchoolSupplyListItem[];
  /** The status of the list's Business Partner. */
  partnerStatus: BusinessPartnerStatus;
  /** The items' default variants, with their products' facts. A default not given is unavailable. */
  defaultVariants: readonly CandidateVariant[];
  /** Stock of the default variants, for the out-of-stock warning. */
  stock: { balances: readonly StockBalance[]; warehouses: readonly Warehouse[] };
  /** The list published now in the same partner, academic year and grade, if any. */
  incumbent: SchoolSupplyList | null;
  /** The incumbent's List Offer, if any. */
  incumbentOffer: ListOffer | null;
  /** A new code, from `generatePublicCode`. */
  publicCode: PublicCode;
}

/** A default variant with nothing available to buy. It warns; it never blocks publishing. */
export interface DefaultOutOfStockWarning {
  code: 'DEFAULT_OUT_OF_STOCK';
  supplyListItemId: SupplyListItemId;
  variantId: VariantId;
}

/** A List Offer copied onto a replacement, before it is stored and given an id. */
export type CopiedListOffer = Omit<ListOffer, 'id'>;

export interface PublishedSupplyList {
  list: SchoolSupplyList;
  /** The list this one replaced, now archived (List Replacement), or `null`. */
  replaced: SchoolSupplyList | null;
  /** The replaced list's List Offer, copied onto this list, or `null`. */
  offer: CopiedListOffer | null;
  warnings: DefaultOutOfStockWarning[];
}

/** Lists in the same slot compete: one published list per partner, academic year and grade. */
export function isSameSupplyListSlot(
  a: Pick<SchoolSupplyList, 'businessPartnerId' | 'academicYear' | 'grade'>,
  b: Pick<SchoolSupplyList, 'businessPartnerId' | 'academicYear' | 'grade'>,
): boolean {
  return (
    a.businessPartnerId === b.businessPartnerId &&
    a.academicYear === b.academicYear &&
    a.grade === b.grade
  );
}

/** Each item with its default variant, once every default is present, active and eligible. */
function publishableDefaults(
  items: readonly SchoolSupplyListItem[],
  defaultVariants: readonly CandidateVariant[],
): { item: SchoolSupplyListItem; variant: CandidateVariant }[] {
  if (items.length === 0) throw new SupplyListError('EMPTY_LIST', 'A list needs at least one item');
  const byId = new Map(defaultVariants.map((variant) => [variant.id, variant]));
  const defaults = [];
  for (const item of items) {
    const variant = item.defaultVariantId === null ? undefined : byId.get(item.defaultVariantId);
    if (variant?.status !== 'active' || variant.product.status !== 'active') {
      throw new SupplyListError(
        'DEFAULT_UNAVAILABLE',
        'Every item needs a default variant that is active, on an active product',
      );
    }
    defaults.push({ item, variant });
  }
  if (defaults.some(({ item, variant }) => !isEligibleVariant(item, variant))) {
    throw new SupplyListError(
      'DEFAULT_INELIGIBLE',
      "Every item's default variant must match the item's own specification",
    );
  }
  return defaults;
}

/**
 * Publishes a draft (ADR-0004, ADR-0007, SL-3 to SL-5). In order, it refuses when:
 * - the partner's status does not allow publishing (`PARTNER_STATUS_NOT_ALLOWED`);
 * - the list is not a draft (`NOT_DRAFT`);
 * - it has no items (`EMPTY_LIST`);
 * - a default variant is missing, inactive or on an inactive product (`DEFAULT_UNAVAILABLE`);
 * - a default variant fails its item's specification (`DEFAULT_INELIGIBLE`);
 * - another list is published in its slot and this list is not a copy of it
 *   (`SLOT_TAKEN`), so a copy of an older version cannot displace a newer list.
 *
 * A copy of the incumbent replaces it: the incumbent is archived and its List Offer is copied.
 * An out-of-stock default only warns.
 */
export function publishSupplyList(input: PublishSupplyListInput): PublishedSupplyList {
  const { list, items, incumbent, incumbentOffer } = input;
  assertStaffListAuthoring(input.partnerStatus, 'publish');
  if (list.status !== 'draft') {
    throw new SupplyListError(
      'NOT_DRAFT',
      `Only a draft list can be published; this one is ${list.status}`,
    );
  }
  if (incumbent && (incumbent.status !== 'published' || !isSameSupplyListSlot(incumbent, list))) {
    throw new TypeError('The incumbent must be the list published in the same slot');
  }
  if (incumbentOffer && incumbentOffer.supplyListId !== incumbent?.id) {
    throw new TypeError("The incumbent offer must be the incumbent's List Offer");
  }
  const defaults = publishableDefaults(items, input.defaultVariants);
  if (incumbent && incumbent.id !== list.sourceListId) {
    throw new SupplyListError(
      'SLOT_TAKEN',
      'Another list is published for this partner, academic year and grade',
    );
  }

  const { balances, warehouses } = input.stock;
  const warnings = defaults.flatMap(({ item, variant }): DefaultOutOfStockWarning[] =>
    stockLevel(availableStock(variant.id, balances, warehouses)) === 'out-of-stock'
      ? [{ code: 'DEFAULT_OUT_OF_STOCK', supplyListItemId: item.id, variantId: variant.id }]
      : [],
  );

  return {
    list: {
      ...list,
      status: 'published',
      publicCode: input.publicCode,
      replacesListId: incumbent?.id ?? null,
    },
    replaced: incumbent && archiveSupplyList(incumbent, list.id),
    offer: incumbentOffer && {
      supplyListId: list.id,
      basisPoints: incumbentOffer.basisPoints,
      startsAt: incumbentOffer.startsAt,
      endsAt: incumbentOffer.endsAt,
    },
    warnings,
  };
}
