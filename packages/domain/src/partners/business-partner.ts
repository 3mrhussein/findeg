import { DomainError } from '../common';
import {
  BUSINESS_PARTNER_STATUS_TRANSITIONS,
  PARTNER_ADMINISTRATOR_MIN_ACTIVE,
  type BusinessPartnerStatus,
} from './model';

export type BusinessPartnerErrorCode =
  | 'INVALID_PARTNER_STATUS_CHANGE'
  | 'NO_ACTIVE_PARTNER_ADMINISTRATOR'
  | 'INVALID_PARTNER_CODE'
  | 'PARTNER_CODE_LOCKED';

/** A change to a Business Partner that its rules refuse. */
export class BusinessPartnerError extends DomainError<BusinessPartnerErrorCode> {
  constructor(code: BusinessPartnerErrorCode, message: string) {
    super(code, message);
  }
}

/** The statuses a Business Partner may move to from `status`. `closed` is final. */
export function allowedPartnerStatusChanges(
  status: BusinessPartnerStatus,
): readonly BusinessPartnerStatus[] {
  return [...BUSINESS_PARTNER_STATUS_TRANSITIONS[status]];
}

/** What the caller knows about the partner when changing its status. */
export interface PartnerStatusChangeFacts {
  /** The partner's active memberships holding `partner-administrator`. */
  activePartnerAdministrators: number;
}

/**
 * Moves a Business Partner to `to` (PA-1, PA-17). Only moves in
 * `BUSINESS_PARTNER_STATUS_TRANSITIONS` are allowed, so `closed` is final and a same-status change
 * is refused. Activation, from onboarding or suspended, needs an active Partner Administrator
 * (PA-7). Returns a new partner; the one given is not changed.
 */
export function changePartnerStatus<Partner extends { status: BusinessPartnerStatus }>(
  partner: Partner,
  to: BusinessPartnerStatus,
  facts: PartnerStatusChangeFacts,
): Partner {
  if (!BUSINESS_PARTNER_STATUS_TRANSITIONS[partner.status].includes(to)) {
    throw new BusinessPartnerError(
      'INVALID_PARTNER_STATUS_CHANGE',
      `A Business Partner cannot move from ${partner.status} to ${to}`,
    );
  }
  if (to === 'active' && facts.activePartnerAdministrators < PARTNER_ADMINISTRATOR_MIN_ACTIVE) {
    throw new BusinessPartnerError(
      'NO_ACTIVE_PARTNER_ADMINISTRATOR',
      'A Business Partner is activated only with an active Partner Administrator',
    );
  }
  return { ...partner, status: to };
}

/** A Partner Code is lowercase letters and digits in hyphen-separated words, e.g. `nile-school`. */
export const PARTNER_CODE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const PARTNER_CODE_MIN_LENGTH = 2;
export const PARTNER_CODE_MAX_LENGTH = 120;

/** Whether `code` is a well-formed Partner Code. It is never trimmed or lowercased. */
export function isPartnerCode(code: string): boolean {
  return (
    code.length >= PARTNER_CODE_MIN_LENGTH &&
    code.length <= PARTNER_CODE_MAX_LENGTH &&
    PARTNER_CODE_PATTERN.test(code)
  );
}

/**
 * Gives a Business Partner a new Partner Code (PA-2). The code must be well-formed, and it changes
 * only while the partner is onboarding. Giving the same code back is a no-op in every status and
 * returns the partner unchanged. Names are not covered here: they change at any time.
 */
export function changePartnerCode<Partner extends { code: string; status: BusinessPartnerStatus }>(
  partner: Partner,
  code: string,
): Partner {
  if (!isPartnerCode(code)) {
    throw new BusinessPartnerError(
      'INVALID_PARTNER_CODE',
      `${JSON.stringify(code)} is not a Partner Code`,
    );
  }
  if (code === partner.code) return partner;
  if (partner.status !== 'onboarding') {
    throw new BusinessPartnerError(
      'PARTNER_CODE_LOCKED',
      `A Partner Code changes only while onboarding; the partner is ${partner.status}`,
    );
  }
  return { ...partner, code };
}
