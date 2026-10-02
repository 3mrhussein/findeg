/**
 * List-checkout request contract (spec #206). Interface only: the checkout
 * spec implements it. `/checkout/validate` and Order Acceptance accept this
 * beside the existing `{ source: 'cart', lines: [{ variantId, quantity }] }`.
 *
 * The server must check that:
 * - the list is `published` (otherwise 409 `list-unavailable`);
 * - each `listItemId` belongs to the list and appears once;
 * - each variant is eligible via `eligibleVariants`, inside the acceptance
 *   transaction with candidates read `FOR SHARE`;
 * - quantities are 1 to 999 and the selection is not empty.
 * Line failures return 422 `selection-invalid` naming the offending `listItemId`s.
 */
export interface ListCheckoutLine {
  listItemId: number;
  variantId: number;
  /** 1 to 999. */
  quantity: number;
}

export interface ListCheckoutRequest {
  source: 'list';
  publicCode: string;
  lines: ListCheckoutLine[];
}

export type ListCheckoutError =
  | { status: 409; code: 'list-unavailable' }
  | { status: 422; code: 'selection-invalid'; listItemIds: number[] };
