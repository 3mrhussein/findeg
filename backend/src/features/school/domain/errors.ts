import { SupplyListError as DomainSupplyListError, type SupplyListErrorCode } from '@findeg/domain';
import type { SupplyListError } from '../application/interfaces/ISchoolSupplyListService';

const applicationCodes: Record<SupplyListErrorCode, SupplyListError> = {
  INVALID_ITEM_QUANTITY: 'invalid-input',
  INVALID_PUBLIC_CODE: 'invalid-input',
  PARTNER_STATUS_NOT_ALLOWED: 'partner-status-not-allowed',
  NOT_DRAFT: 'not-draft',
  INVALID_TRANSITION: 'invalid-transition',
  EMPTY_LIST: 'empty-list',
  DEFAULT_UNAVAILABLE: 'default-unavailable',
  DEFAULT_INELIGIBLE: 'default-ineligible',
  SLOT_TAKEN: 'slot-taken',
};

/** Preserve the feature's public rejection codes; technical errors still roll back and propagate. */
export function schoolListFailure(error: unknown): { success: false; error: SupplyListError } {
  if (!(error instanceof DomainSupplyListError)) throw error;
  return { success: false, error: applicationCodes[error.code] };
}
