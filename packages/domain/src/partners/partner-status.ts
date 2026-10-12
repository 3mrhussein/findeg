import { DomainError } from '../common';
import {
  BUSINESS_PARTNER_STATUS_TRANSITIONS,
  PARTNER_ADMINISTRATOR_MIN_ACTIVE,
  type BusinessPartnerStatus,
} from './model';

export type BusinessPartnerErrorCode =
  'INVALID_PARTNER_STATUS_CHANGE' | 'NO_ACTIVE_PARTNER_ADMINISTRATOR';

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
