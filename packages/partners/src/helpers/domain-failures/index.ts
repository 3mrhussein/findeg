import {
  DomainError,
  type BusinessPartnerErrorCode,
  type PartnerAccessErrorCode,
  type PartnerInvitationErrorCode,
  type PartnerMembershipErrorCode,
} from '@findeg/domain';

type PartnerDomainErrorCode =
  | BusinessPartnerErrorCode
  | PartnerMembershipErrorCode
  | PartnerInvitationErrorCode
  | PartnerAccessErrorCode;

/**
 * The one mapping from Business Partner domain errors to this feature's application errors.
 * Every service maps its domain failures through `partnerFailure`, so a code means the same
 * failure everywhere. The domain carries no HTTP or presentation meaning.
 */
const APPLICATION_ERRORS = {
  INVALID_PARTNER_STATUS_CHANGE: 'invalid-transition',
  NO_ACTIVE_PARTNER_ADMINISTRATOR: 'last-administrator',
  INVALID_PARTNER_CODE: 'invalid-input',
  PARTNER_CODE_LOCKED: 'code-locked',
  PARTNER_ROLE_REQUIRED: 'invalid-input',
  UNKNOWN_PARTNER_ROLE: 'invalid-input',
  PARTNER_NOT_OPEN: 'partner-not-open',
  PARTNER_MEMBERSHIP_ENDED: 'membership-ended',
  LAST_PARTNER_ADMINISTRATOR: 'last-administrator',
  INVALID_INVITATION_EMAIL: 'invalid-input',
  ALREADY_PARTNER_MEMBER: 'already-member',
  INVITATION_NOT_PENDING: 'invitation-not-pending',
  INVITATION_EXPIRED: 'invitation-expired',
  INVITATION_EMAIL_MISMATCH: 'email-mismatch',
  PARTNER_ROLE_NOT_HELD: 'role-not-held',
  PARTNER_STATUS_NOT_ALLOWED: 'partner-status-not-allowed',
} as const satisfies Record<PartnerDomainErrorCode, string>;

/**
 * Turns a thrown partner domain error into the typed failure a service returns. The caller
 * narrows `E` to the errors its operation can produce. Any other error is rethrown.
 */
export function partnerFailure<E extends string>(error: unknown): { success: false; error: E } {
  if (error instanceof DomainError && Object.hasOwn(APPLICATION_ERRORS, error.code)) {
    const code = error.code as PartnerDomainErrorCode;
    return { success: false, error: APPLICATION_ERRORS[code] as E };
  }
  throw error;
}
