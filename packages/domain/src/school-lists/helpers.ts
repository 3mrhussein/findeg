import {
  type ActiveStatus,
  DomainError,
  LINE_QUANTITY_MAX,
  LINE_QUANTITY_MIN,
  isLineQuantity,
} from '../common';
import type { CategoryId, VariantId } from '../catalog';
import { drawRandomBytes, type RandomBytes } from '../common/features/random';
import type { BusinessPartnerStatus } from '../partners';
import type { ItemSpecification, SchoolSupplyListItem } from './types';

export type SupplyListErrorCode =
  | 'INVALID_ITEM_QUANTITY'
  | 'INVALID_PUBLIC_CODE'
  | 'PARTNER_STATUS_NOT_ALLOWED'
  | 'NOT_DRAFT'
  | 'INVALID_TRANSITION'
  | 'EMPTY_LIST'
  | 'DEFAULT_UNAVAILABLE'
  | 'DEFAULT_INELIGIBLE'
  | 'SLOT_TAKEN';

/** A School Supply List, item or authoring step that breaks a list rule. */
export class SupplyListError extends DomainError<SupplyListErrorCode> {}

/** What eligibility needs to know of a product variant: its own facts and its product's. */
export interface CandidateVariant {
  id: VariantId;
  /** Attribute key → value of the variant. */
  attributes: Readonly<Record<string, string>>;
  status: ActiveStatus;
  product: { categoryId: CategoryId; status: ActiveStatus };
}

/** The parts of a School Supply List Item that decide which variants it accepts. */
export interface EligibilityItem {
  defaultVariantId: VariantId | null;
  specification: ItemSpecification | null;
}

const isActive = (candidate: CandidateVariant) =>
  candidate.status === 'active' && candidate.product.status === 'active';

function matchesSpecification(candidate: CandidateVariant, specification: ItemSpecification) {
  return (
    candidate.product.categoryId === specification.categoryId &&
    Object.entries(specification.attributes).every(
      ([key, value]) =>
        Object.hasOwn(candidate.attributes, key) && candidate.attributes[key] === value,
    )
  );
}

/** Whether an item accepts a variant. See {@link eligibleVariants}. */
export function isEligibleVariant(item: EligibilityItem, candidate: CandidateVariant): boolean {
  if (!isActive(candidate)) return false;
  if (item.specification === null) return candidate.id === item.defaultVariantId;
  return matchesSpecification(candidate, item.specification);
}

/**
 * The variants a School Supply List Item accepts (ADR-0004, CA-4). An inactive variant, or a
 * variant of an inactive product, is never eligible. An Exact Item accepts only its default
 * variant. Otherwise the variant's product must be in the specification's category exactly (a
 * child category does not match) and the variant must carry every specified attribute with an
 * equal, case-sensitive value; extra attributes are fine and no attributes match the whole
 * category.
 */
export function eligibleVariants<C extends CandidateVariant>(
  item: EligibilityItem,
  candidates: readonly C[],
): C[] {
  return candidates.filter((candidate) => isEligibleVariant(item, candidate));
}

/** A list item prescribes a line quantity: 1 to 999 units. */
export const SUPPLY_LIST_ITEM_QUANTITY_MIN = LINE_QUANTITY_MIN;
export const SUPPLY_LIST_ITEM_QUANTITY_MAX = LINE_QUANTITY_MAX;

/** An item is an Exact Item when it has no specification: only its default variant is accepted. */
export function isExactItem(item: Pick<SchoolSupplyListItem, 'specification'>): boolean {
  return item.specification === null;
}

/** A School Supply List Item, checked: its quantity is a whole number from 1 to 999. */
export function supplyListItem(props: SchoolSupplyListItem): SchoolSupplyListItem {
  const { quantity } = props;
  if (!isLineQuantity(quantity)) {
    throw new SupplyListError(
      'INVALID_ITEM_QUANTITY',
      `An item quantity is a whole number from ${String(SUPPLY_LIST_ITEM_QUANTITY_MIN)} to ${String(SUPPLY_LIST_ITEM_QUANTITY_MAX)}, received ${String(quantity)}`,
    );
  }
  return { ...props };
}

declare const brand: unique symbol;

/** A list's public, unguessable code (SL-6): 32 lowercase hex characters, 128 random bits. */
export type PublicCode = string & { readonly [brand]: 'PublicCode' };

const PUBLIC_CODE_BYTES = 16;
export const PUBLIC_CODE_PATTERN = /^[0-9a-f]{32}$/;

/** Parses a public code, refusing anything but exactly 32 lowercase hex characters. */
export function publicCode(text: string): PublicCode {
  if (typeof text !== 'string') throw new TypeError('A public code is a string');
  if (!PUBLIC_CODE_PATTERN.test(text)) {
    throw new SupplyListError(
      'INVALID_PUBLIC_CODE',
      'A public code is 32 lowercase hex characters',
    );
  }
  return text as PublicCode;
}

/** A new public code made from 16 bytes of the supplied random source. */
export function generatePublicCode(random: RandomBytes): PublicCode {
  const bytes = drawRandomBytes(random, PUBLIC_CODE_BYTES);
  return publicCode(Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
}

/**
 * What Staff do to a Business Partner's lists that depends on the partner's status.
 * `draft` covers creating, cloning, editing a draft and editing its items; `publish` covers
 * List Replacement too. Archiving, reading and setting a List Offer never depend on the status.
 */
export const STAFF_LIST_AUTHORING_ACTIONS = ['draft', 'publish'] as const;
export type StaffListAuthoringAction = (typeof STAFF_LIST_AUTHORING_ACTIONS)[number];

/**
 * The Staff list-authoring rule (ADR-0014): which partner statuses allow each action. It is its
 * own rule, kept apart from the ADR-0012 partner action table. A suspended partner's lists can
 * still be drafted but not published; a closed partner's cannot be drafted either.
 */
export const STAFF_LIST_AUTHORING_STATUSES: Readonly<
  Record<StaffListAuthoringAction, readonly BusinessPartnerStatus[]>
> = {
  draft: ['onboarding', 'active', 'suspended'],
  publish: ['onboarding', 'active'],
};

export function staffListAuthoringAllows(
  status: BusinessPartnerStatus,
  action: StaffListAuthoringAction,
): boolean {
  return STAFF_LIST_AUTHORING_STATUSES[action].includes(status);
}

/** Throws `PARTNER_STATUS_NOT_ALLOWED` unless the partner's status allows the action. */
export function assertStaffListAuthoring(
  status: BusinessPartnerStatus,
  action: StaffListAuthoringAction,
): void {
  if (!staffListAuthoringAllows(status, action)) {
    throw new SupplyListError(
      'PARTNER_STATUS_NOT_ALLOWED',
      `Staff cannot ${action} a list while its Business Partner is ${status}`,
    );
  }
}
