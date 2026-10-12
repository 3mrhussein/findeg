import { DomainError } from '../common';

export type SupplyListErrorCode =
  | 'INVALID_ITEM_QUANTITY'
  | 'INVALID_PUBLIC_CODE'
  | 'PARTNER_STATUS_NOT_ALLOWED'
  | 'NOT_DRAFT'
  | 'INVALID_TRANSITION'
  | 'EMPTY_LIST'
  | 'DEFAULT_UNAVAILABLE'
  | 'DEFAULT_INELIGIBLE'
  | 'SLOT_TAKEN'
  | 'INVALID_LIST_OFFER_WINDOW';

/** A School Supply List, item, List Offer or authoring step that breaks a list rule. */
export class SupplyListError extends DomainError<SupplyListErrorCode> {
  constructor(code: SupplyListErrorCode, message: string) {
    super(code, message);
  }
}
