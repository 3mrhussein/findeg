/**
 * Business Partner vocabulary (GLOSSARY: Business Partner, Partner School, Partner Membership,
 * Partner Role, Partner Invitation; ADR-0003, ADR-0010, ADR-0012).
 */
import type { CustomerId } from '../customers';
import type { Governorate, Id, Locale, LocalizedText } from '../common';
import * as constants from './constants';

export type BusinessPartnerId = Id<'BusinessPartner'>;
export type PartnerMembershipId = Id<'PartnerMembership'>;
export type PartnerInvitationId = Id<'PartnerInvitation'>;

export type BusinessPartnerStatus = (typeof constants.BUSINESS_PARTNER_STATUSES)[number];
export type PartnerMembershipStatus = (typeof constants.PARTNER_MEMBERSHIP_STATUSES)[number];
export type PartnerRole = (typeof constants.PARTNER_ROLES)[number];
export type PartnerInvitationStatus = (typeof constants.PARTNER_INVITATION_STATUSES)[number];
export type SchoolType = (typeof constants.SCHOOL_TYPES)[number];
export type AcademicSystem = (typeof constants.ACADEMIC_SYSTEMS)[number];

/** A Business Partner: the organisation FindEg has a commercial relationship with. */
export interface BusinessPartner {
  id: BusinessPartnerId;
  code: string;
  name: LocalizedText;
  status: BusinessPartnerStatus;
}

/** A Business Partner that is a school, with the details shown in the Partner School directory. */
export interface PartnerSchoolProfile {
  businessPartnerId: BusinessPartnerId;
  governorate: Governorate;
  area: LocalizedText;
  schoolType: SchoolType;
  academicSystem: AcademicSystem;
  logoUrl?: string;
}

/** A person's Partner Membership in one Business Partner. */
export interface PartnerMembership {
  id: PartnerMembershipId;
  businessPartnerId: BusinessPartnerId;
  customerId: CustomerId;
  roles: readonly PartnerRole[];
  status: PartnerMembershipStatus;
}

/** An emailed offer to join a Business Partner with specific roles. Opening it never accepts it. */
export interface PartnerInvitation {
  id: PartnerInvitationId;
  businessPartnerId: BusinessPartnerId;
  email: string;
  roles: readonly PartnerRole[];
  status: PartnerInvitationStatus;
  /** The sent time plus PARTNER_INVITATION_VALID_DAYS, reset on resend. Expired when `≤ now`. */
  expiresAt: Date;
  locale: Locale;
}
